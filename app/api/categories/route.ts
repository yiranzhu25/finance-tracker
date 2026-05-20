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
    const db = supabase as any
    const { data: categories, error: catError } = await db
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (catError) {
      return Response.json({ error: catError.message }, { status: 500 })
    }

    const { data: subcategories, error: subError } = await db
      .from('subcategories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (subError) {
      return Response.json({ error: subError.message }, { status: 500 })
    }

    // Nest subcategories under their parent category
    const result = (categories || []).map((cat: { id: string; [key: string]: unknown }) => ({
      ...cat,
      subcategories: (subcategories || []).filter(
        (sub: { category_id: string }) => sub.category_id === cat.id
      ),
    }))

    return Response.json({ data: result })
  } catch (error) {
    console.error('Categories GET error:', error)
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 })
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
    const { name, top_level_type, color, icon } = body

    if (!name || !top_level_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    // Get max sort_order
    const { data: existing } = await db
      .from('categories')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const sortOrder =
      existing && existing.length > 0
        ? (existing[0] as { sort_order: number }).sort_order + 1
        : 0

    const { data, error } = await db
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        top_level_type,
        sort_order: sortOrder,
        color: color || null,
        icon: icon || null,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return Response.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
