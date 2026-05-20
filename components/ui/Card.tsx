import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
}

export default function Card({ children, className = '', onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: 'var(--system-background)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-card)',
        padding: '16px',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
