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
    const accountId = searchParams.get('account_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    let query = db
      .from('portfolio_snapshots')
      .select('*, accounts(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (accountId) {
      query = query.eq('account_id', accountId)
    }
    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    const { data, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data })
  } catch (error) {
    console.error('Snapshots GET error:', error)
    return Response.json({ error: 'Failed to fetch snapshots' }, { status: 500 })
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
    const { account_id, date, value, notes } = body

    if (!account_id || !date || value === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('portfolio_snapshots')
      .upsert(
        {
          user_id: user.id,
          account_id,
          date,
          value: parseFloat(value),
          notes: notes || null,
        },
        { onConflict: 'user_id,account_id,date' }
      )
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Snapshots POST error:', error)
    return Response.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}
