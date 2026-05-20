'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, PieChart, TrendingUp, Wallet } from 'lucide-react'

const tabs = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/transactions' },
  { label: 'Spending', icon: PieChart, href: '/spending' },
  { label: 'Cash Flow', icon: TrendingUp, href: '/cash-flow' },
  { label: 'Accounts', icon: Wallet, href: '/accounts' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0"
      style={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderTop: '1px solid var(--system-gray5)',
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ label, icon: Icon, href }) => {
        const isActive =
          pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 4px',
              textDecoration: 'none',
              color: isActive ? 'var(--system-blue)' : 'var(--system-gray)',
              gap: '3px',
              minHeight: '50px',
            }}
          >
            <Icon size={22} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? '600' : '400',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
