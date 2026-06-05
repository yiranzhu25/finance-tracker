import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: account } = await db
    .from('accounts')
    .select('plaid_item_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!account) return Response.json({ error: 'Not found' }, { status: 404 })

  if (account.plaid_item_id) {
    // Delete the whole institution connection; cascades to accounts + transactions
    const { error } = await db
      .from('plaid_items')
      .delete()
      .eq('id', account.plaid_item_id)
      .eq('user_id', user.id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await db
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
