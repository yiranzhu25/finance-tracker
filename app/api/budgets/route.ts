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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('budgets')
      .select('*, categories(name, top_level_type), subcategories(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data })
  } catch (error) {
    console.error('Budgets GET error:', error)
    return Response.json({ error: 'Failed to fetch budgets' }, { status: 500 })
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
    const { category_id, subcategory_id, frequency, amount, month_overrides } = body

    if (!frequency || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          category_id: category_id || null,
          subcategory_id: subcategory_id || null,
          frequency,
          amount: parseFloat(amount),
          month_overrides: month_overrides || null,
        },
        { onConflict: 'user_id,category_id,subcategory_id,frequency' }
      )
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Budgets POST error:', error)
    return Response.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}
