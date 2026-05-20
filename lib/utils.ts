export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function calcPercent(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function daysElapsedInMonth(): number {
  return new Date().getDate()
}

export function daysInMonth(year: number, month: number): number {
  // month is 1-indexed
  return new Date(year, month, 0).getDate()
}

export function projectAmount(
  spent: number,
  daysElapsed: number,
  daysTotal: number
): number {
  if (daysElapsed === 0) return 0
  return (spent / daysElapsed) * daysTotal
}
