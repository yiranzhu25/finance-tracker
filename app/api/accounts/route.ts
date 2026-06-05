import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('accounts')
    .select(
      'id, name, official_name, type, subtype, is_manual, current_balance, available_balance, currency, mask, last_synced_at, plaid_item_id, plaid_items(institution_name, last_synced_at)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ accounts: data ?? [] })
}
