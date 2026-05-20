import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/components/layout/SidebarLayout'
import BottomNav from '@/components/layout/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  let userEmail: string | undefined

  if (!isDemoMode) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    userEmail = user.email
  }

  return (
    <>
      <SidebarLayout userEmail={userEmail}>
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </SidebarLayout>
      <BottomNav />
    </>
  )
}
