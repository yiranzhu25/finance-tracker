import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { public_token, institution_id, institution_name } = await request.json()

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const { access_token, item_id } = exchangeResponse.data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    // Store plaid item
    const { data: plaidItem, error: itemError } = await db
      .from('plaid_items')
      .insert({
        user_id: user.id,
        access_token,
        item_id,
        institution_id: institution_id || null,
        institution_name: institution_name || null,
      })
      .select()
      .single()

    if (itemError) {
      console.error('Error storing plaid item:', itemError)
      return Response.json({ error: 'Failed to store institution' }, { status: 500 })
    }

    // Fetch accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({ access_token })
    const accounts = accountsResponse.data.accounts

    // Upsert accounts
    const accountInserts = accounts.map((acc) => ({
      user_id: user.id,
      plaid_account_id: acc.account_id,
      plaid_item_id: plaidItem.id,
      name: acc.name,
      official_name: acc.official_name || null,
      type: acc.type,
      subtype: acc.subtype || null,
      is_manual: false,
      current_balance: acc.balances.current,
      available_balance: acc.balances.available,
      currency: acc.balances.iso_currency_code || 'USD',
      mask: acc.mask || null,
      last_synced_at: new Date().toISOString(),
    }))

    const { error: accError } = await db.from('accounts').upsert(accountInserts, {
      onConflict: 'plaid_account_id',
    })

    if (accError) {
      console.error('Error storing accounts:', accError)
    }

    return Response.json({ success: true, item_id })
  } catch (error) {
    console.error('Plaid exchange token error:', error)
    return Response.json({ error: 'Failed to exchange token' }, { status: 500 })
  }
}
