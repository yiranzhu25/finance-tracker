import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/components/layout/SidebarLayout'
import BottomNav from '@/components/layout/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <SidebarLayout userEmail={user.email}>
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </SidebarLayout>
      <BottomNav />
    </>
  )
}
