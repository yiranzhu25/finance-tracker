import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') || 'monthly'
  const month = searchParams.get('month') // YYYY-MM

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  let dateFrom: string
  let dateTo: string

  if (mode === 'ytd') {
    dateFrom = `${now.getFullYear()}-01-01`
    dateTo = now.toISOString().split('T')[0]
  } else {
    const parts = month ? month.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
    const [y, m] = parts
    dateFrom = `${y}-${String(m).padStart(2, '0')}-01`
    dateTo = `${y}-${String(m).padStart(2, '0')}-31`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const monthsInPeriod = mode === 'ytd' ? now.getMonth() + 1 : 1

  const [{ data: txns }, { data: budgets }] = await Promise.all([
    db
      .from('transactions')
      .select('amount, category_id, subcategory_id, categories(id, name), subcategories(id, name)')
      .eq('user_id', user.id)
      .eq('top_level_type', 'expense')
      .gte('date', dateFrom)
      .lte('date', dateTo),
    db
      .from('budgets')
      .select('category_id, subcategory_id, amount, frequency, categories(name), subcategories(name)')
      .eq('user_id', user.id),
  ])

  type CatEntry = {
    name: string
    actual: number
    budget: number
    subcats: Record<string, { name: string; actual: number; budget: number }>
  }

  const catMap: Record<string, CatEntry> = {}

  for (const t of txns ?? []) {
    const catId = t.category_id ?? 'uncategorized'
    const catName = t.categories?.name ?? 'Uncategorized'
    if (!catMap[catId]) catMap[catId] = { name: catName, actual: 0, budget: 0, subcats: {} }
    catMap[catId].actual += Number(t.amount)

    if (t.subcategory_id) {
      const subId = t.subcategory_id
      const subName = t.subcategories?.name ?? 'Other'
      if (!catMap[catId].subcats[subId])
        catMap[catId].subcats[subId] = { name: subName, actual: 0, budget: 0 }
      catMap[catId].subcats[subId].actual += Number(t.amount)
    }
  }

  for (const b of budgets ?? []) {
    const effective = b.frequency === 'yearly' ? (b.amount / 12) * monthsInPeriod : b.amount * monthsInPeriod
    if (b.category_id && !b.subcategory_id) {
      const catName = b.categories?.name ?? ''
      if (!catMap[b.category_id])
        catMap[b.category_id] = { name: catName, actual: 0, budget: 0, subcats: {} }
      catMap[b.category_id].budget = effective
    } else if (b.subcategory_id && b.category_id) {
      const catName = b.categories?.name ?? ''
      const subName = b.subcategories?.name ?? ''
      if (!catMap[b.category_id])
        catMap[b.category_id] = { name: catName, actual: 0, budget: 0, subcats: {} }
      if (!catMap[b.category_id].subcats[b.subcategory_id])
        catMap[b.category_id].subcats[b.subcategory_id] = { name: subName, actual: 0, budget: 0 }
      catMap[b.category_id].subcats[b.subcategory_id].budget = effective
    }
  }

  const result = Object.values(catMap)
    .filter((c) => c.actual > 0 || c.budget > 0)
    .sort((a, b) => b.actual - a.actual)
    .map((c) => ({
      category: c.name,
      budget: c.budget,
      actual: c.actual,
      subcategories: Object.values(c.subcats)
        .filter((s) => s.actual > 0 || s.budget > 0)
        .map((s) => ({ name: s.name, budget: s.budget, actual: s.actual })),
    }))

  return Response.json({ data: result })
}
