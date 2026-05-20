import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { category_id, subcategory_id, top_level_type, notes, is_recurring } = body

    const updates: Record<string, unknown> = {}
    if (category_id !== undefined) updates.category_id = category_id
    if (subcategory_id !== undefined) updates.subcategory_id = subcategory_id
    if (top_level_type !== undefined) updates.top_level_type = top_level_type
    if (notes !== undefined) updates.notes = notes
    if (is_recurring !== undefined) updates.is_recurring = is_recurring

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return Response.json({ data })
  } catch (error) {
    console.error('Transaction PATCH error:', error)
    return Response.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Transaction DELETE error:', error)
    return Response.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
