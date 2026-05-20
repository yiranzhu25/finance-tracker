'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  BarChart3,
  LineChart,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/transactions' },
  { label: 'Spending', icon: PieChart, href: '/spending' },
  { label: 'Cash Flow', icon: TrendingUp, href: '/cash-flow' },
  { label: 'Net Worth', icon: BarChart3, href: '/net-worth' },
  { label: 'Investments', icon: LineChart, href: '/investments' },
  { label: 'Accounts', icon: Wallet, href: '/accounts' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  userEmail?: string
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ userEmail, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        width: collapsed ? '64px' : '240px',
        backgroundColor: 'var(--system-background)',
        borderRight: '1px solid var(--system-gray5)',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '24px 0 16px' : '24px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'padding 0.2s ease',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: 'var(--label)',
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? 'F' : 'Finance'}
        </h1>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? '8px 8px' : '8px 12px' }}>
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? '0' : '10px',
                padding: collapsed ? '10px 0' : '9px 10px',
                borderRadius: '10px',
                marginBottom: '2px',
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                color: isActive ? 'var(--system-blue)' : 'var(--secondary-label)',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                transition: 'background-color 0.1s, color 0.1s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--system-gray6)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
                }
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? 'var(--system-blue)' : 'var(--system-gray)',
                  flexShrink: 0,
                }}
              />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: collapsed ? '8px' : '8px 12px' }}>
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            width: '100%',
            padding: collapsed ? '9px 0' : '9px 10px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--system-gray)',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.1s',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--system-gray6)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && 'Collapse'}
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid var(--system-gray5)',
          padding: collapsed ? '12px 8px' : '16px 20px',
        }}
      >
        {userEmail && !collapsed && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--system-gray)',
              marginBottom: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userEmail}
          </p>
        )}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            width: '100%',
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--system-gray)',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.1s',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--system-gray6)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--system-red)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--system-gray)'
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
