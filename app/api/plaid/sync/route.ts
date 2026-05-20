import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid'
import type { TopLevelType } from '@/types/database'

interface TransactionInsert {
  user_id: string
  plaid_transaction_id: string
  date: string
  amount: number
  description: string
  merchant_name: string | null
  account_id: string
  top_level_type: TopLevelType
  category_id: null
  subcategory_id: null
  transfer_pair_id: string | null
  is_recurring: boolean
  recurring_group_id: null
  is_manual: boolean
  notes: null
  pending: boolean
}

function detectTransferPairs(transactions: TransactionInsert[]): TransactionInsert[] {
  const expenses = transactions.filter((t) => t.top_level_type === 'expense')
  const incomes = transactions.filter((t) => t.top_level_type === 'income')
  const matched = new Set<number>()

  for (let i = 0; i < expenses.length; i++) {
    for (let j = 0; j < incomes.length; j++) {
      if (matched.has(j)) continue
      const exp = expenses[i]
      const inc = incomes[j]

      if (Math.abs(exp.amount - inc.amount) > 0.01) continue

      const expDate = new Date(exp.date).getTime()
      const incDate = new Date(inc.date).getTime()
      const daysDiff = Math.abs(expDate - incDate) / (1000 * 60 * 60 * 24)
      if (daysDiff > 2) continue

      const pairId = `${exp.plaid_transaction_id}-${inc.plaid_transaction_id}`
      exp.top_level_type = 'transfer'
      inc.top_level_type = 'transfer'
      exp.transfer_pair_id = pairId
      inc.transfer_pair_id = pairId
      matched.add(j)
      break
    }
  }

  return transactions
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: plaidItems, error: itemsError } = await db
      .from('plaid_items')
      .select('*')
      .eq('user_id', user.id)

    if (itemsError || !plaidItems) {
      return Response.json({ error: 'Failed to fetch plaid items' }, { status: 500 })
    }

    const { data: accounts } = await db
      .from('accounts')
      .select('id, plaid_account_id')
      .eq('user_id', user.id)

    const accountMap = new Map<string, string>()
    ;(accounts || []).forEach((a: { id: string; plaid_account_id: string | null }) => {
      if (a.plaid_account_id) accountMap.set(a.plaid_account_id, a.id)
    })

    let totalAdded = 0
    let totalModified = 0
    let totalRemoved = 0

    for (const item of plaidItems as {
      access_token: string
      cursor: string | null
      id: string
    }[]) {
      let cursor: string | undefined = item.cursor || undefined
      let hasMore = true
      const newTransactions: TransactionInsert[] = []

      while (hasMore) {
        const response = await plaidClient.transactionsSync({
          access_token: item.access_token,
          cursor,
        })

        const { added, modified, removed, next_cursor, has_more } = response.data

        for (const t of added) {
          const accountId = accountMap.get(t.account_id)
          if (!accountId) continue

          newTransactions.push({
            user_id: user.id,
            plaid_transaction_id: t.transaction_id,
            date: t.date,
            amount: Math.abs(t.amount),
            description: t.name,
            merchant_name: t.merchant_name || null,
            account_id: accountId,
            top_level_type: t.amount > 0 ? 'expense' : 'income',
            category_id: null,
            subcategory_id: null,
            transfer_pair_id: null,
            is_recurring: false,
            recurring_group_id: null,
            is_manual: false,
            notes: null,
            pending: t.pending,
          })
        }

        for (const t of modified) {
          const accountId = accountMap.get(t.account_id)
          if (!accountId) continue

          await db
            .from('transactions')
            .update({
              amount: Math.abs(t.amount),
              description: t.name,
              merchant_name: t.merchant_name || null,
              pending: t.pending,
              date: t.date,
            })
            .eq('plaid_transaction_id', t.transaction_id)
            .eq('user_id', user.id)

          totalModified++
        }

        for (const r of removed) {
          await db
            .from('transactions')
            .delete()
            .eq('plaid_transaction_id', r.transaction_id)
            .eq('user_id', user.id)

          totalRemoved++
        }

        cursor = next_cursor
        hasMore = has_more
      }

      const processed = detectTransferPairs(newTransactions)

      if (processed.length > 0) {
        const { error: upsertError } = await db.from('transactions').upsert(processed, {
          onConflict: 'plaid_transaction_id',
        })

        if (upsertError) {
          console.error('Error upserting transactions:', upsertError)
        } else {
          totalAdded += processed.length
        }
      }

      await db
        .from('plaid_items')
        .update({ cursor, last_synced_at: new Date().toISOString() })
        .eq('id', item.id)
    }

    return Response.json({
      success: true,
      added: totalAdded,
      modified: totalModified,
      removed: totalRemoved,
    })
  } catch (error) {
    console.error('Plaid sync error:', error)
    return Response.json({ error: 'Sync failed' }, { status: 500 })
  }
}
