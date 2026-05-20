import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const account = searchParams.get('account')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const search = searchParams.get('search')
    const recurring = searchParams.get('recurring')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    let query = db
      .from('transactions')
      .select('*, accounts(name)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type && type !== 'all') {
      query = query.eq('top_level_type', type)
    }
    if (category) {
      query = query.eq('category_id', category)
    }
    if (account) {
      query = query.eq('account_id', account)
    }
    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }
    if (search) {
      query = query.or(`description.ilike.%${search}%,merchant_name.ilike.%${search}%`)
    }
    if (recurring === 'true') {
      query = query.eq('is_recurring', true)
    }

    const { data, error, count } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data, count, page, limit })
  } catch (error) {
    console.error('Transactions GET error:', error)
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
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

    const body = await request.json()
    const {
      date,
      amount,
      description,
      account_id,
      top_level_type,
      category_id,
      subcategory_id,
      notes,
      is_recurring,
    } = body

    if (!date || !amount || !description || !account_id || !top_level_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('transactions')
      .insert({
        user_id: user.id,
        date,
        amount: parseFloat(amount),
        description,
        account_id,
        top_level_type,
        category_id: category_id || null,
        subcategory_id: subcategory_id || null,
        notes: notes || null,
        is_recurring: is_recurring || false,
        is_manual: true,
        pending: false,
        plaid_transaction_id: null,
        merchant_name: null,
        transfer_pair_id: null,
        recurring_group_id: null,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Transactions POST error:', error)
    return Response.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
