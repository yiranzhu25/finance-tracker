import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const months = Math.min(parseInt(searchParams.get('months') || '12'), 24)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: txns } = await (supabase as any)
    .from('transactions')
    .select('date, amount, top_level_type')
    .eq('user_id', user.id)
    .neq('top_level_type', 'transfer')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date')

  // Build month buckets
  const buckets: { month: string; income: number; expenses: number }[] = []
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1)
    buckets.push({
      month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income: 0,
      expenses: 0,
    })
  }

  for (const t of txns ?? []) {
    const d = new Date(t.date + 'T12:00:00')
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const bucket = buckets.find((b) => b.month === key)
    if (!bucket) continue
    if (t.top_level_type === 'income') bucket.income += Number(t.amount)
    else if (t.top_level_type === 'expense') bucket.expenses += Number(t.amount)
  }

  return Response.json({
    data: buckets.map((b) => ({ ...b, net: b.income - b.expenses })),
  })
}
