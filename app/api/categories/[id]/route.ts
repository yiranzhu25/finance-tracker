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
    const { name, sort_order, color, icon } = body

    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (sort_order !== undefined) updates.sort_order = sort_order
    if (color !== undefined) updates.color = color
    if (icon !== undefined) updates.icon = icon

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    return Response.json({ data })
  } catch (error) {
    console.error('Category PATCH error:', error)
    return Response.json({ error: 'Failed to update category' }, { status: 500 })
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
    const db = supabase as any

    // Check for existing transactions using this category
    const { count } = await db
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('user_id', user.id)

    if (count && count > 0) {
      return Response.json(
        {
          error: `Cannot delete category with ${count} existing transactions. Reassign them first.`,
        },
        { status: 409 }
      )
    }

    // Delete budgets referencing this category
    const { count: budgetCount } = await db
      .from('budgets')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('user_id', user.id)

    if (budgetCount && budgetCount > 0) {
      await db.from('budgets').delete().eq('category_id', id).eq('user_id', user.id)
    }

    // Delete subcategories
    await db.from('subcategories').delete().eq('category_id', id).eq('user_id', user.id)

    // Delete category
    const { error } = await db
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Category DELETE error:', error)
    return Response.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
