import React from 'react'

type BadgeVariant = 'expense' | 'income' | 'transfer' | 'recurring' | 'pending' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  expense: { bg: 'rgba(255, 59, 48, 0.10)', color: 'var(--system-red)' },
  income: { bg: 'rgba(52, 199, 89, 0.10)', color: 'var(--system-green)' },
  transfer: { bg: 'var(--system-gray6)', color: 'var(--system-gray)' },
  recurring: { bg: 'rgba(88, 86, 214, 0.10)', color: 'var(--system-indigo)' },
  pending: { bg: 'rgba(255, 149, 0, 0.10)', color: 'var(--system-orange)' },
  default: { bg: 'var(--system-gray6)', color: 'var(--secondary-label)' },
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const { bg, color } = variantStyles[variant]

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
