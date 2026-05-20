import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finance',
  description: 'Personal Finance Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--grouped-background)' }}>
        {children}
      </body>
    </html>
  )
}
