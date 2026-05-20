'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

interface SidebarLayoutProps {
  userEmail?: string
  children: React.ReactNode
}

export default function SidebarLayout({ userEmail, children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userEmail={userEmail}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main
        className="flex-1 min-h-screen"
        style={{ transition: 'all 0.2s ease' }}
      >
        {children}
      </main>
    </div>
  )
}
