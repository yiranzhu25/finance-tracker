'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CategoryRow {
  category: string
  budget: number
  actual: number
  subcategories?: { name: string; budget: number; actual: number }[]
}

function ProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const color = budget === 0 ? 'var(--system-blue)' : spent > budget ? 'var(--system-red)' : spent / budget > 0.8 ? 'var(--system-orange)' : 'var(--system-green)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--system-gray5)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }} />
      </div>
      <span style={{ fontSize: '12px', color: 'var(--system-gray)', minWidth: '36px', textAlign: 'right' }}>
        {budget > 0 ? `${pct.toFixed(0)}%` : '—'}
      </span>
    </div>
  )
}

export default function SpendingPage() {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [view, setView] = useState<'monthly' | 'ytd'>('monthly')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [data, setData] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params =
      view === 'ytd'
        ? 'mode=ytd'
        : `mode=monthly&month=${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    fetch(`/api/spending?${params}`)
      .then((r) => r.json())
      .then(({ data: rows }) => setData(rows ?? []))
      .finally(() => setLoading(false))
  }, [view, viewMonth, viewYear])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }
  function toggleExpand(cat: string) {
    setExpanded((prev) => { const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>Spending</h1>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['monthly', 'ytd'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '13px',
                fontWeight: view === v ? '600' : '400',
                backgroundColor: view === v ? 'var(--system-blue)' : 'var(--system-gray6)',
                color: view === v ? '#fff' : 'var(--secondary-label)', cursor: 'pointer',
              }}
            >
              {v === 'monthly' ? 'Monthly' : 'YTD'}
            </button>
          ))}
        </div>
      </div>

      {view === 'monthly' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={prevMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-blue)' }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--label)', minWidth: '140px', textAlign: 'center' }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-blue)' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <Card>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 120px 110px 200px', gap: '12px',
            padding: '0 0 10px', borderBottom: '1px solid var(--system-gray5)', marginBottom: '4px',
          }}
        >
          {['Category', 'Budget', 'Actual', 'Variance', '% Used'].map((h) => (
            <span key={h} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--system-gray)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: h === 'Category' ? 'left' : 'right' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--system-gray)' }}>Loading…</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--system-gray)' }}>
            No spending data for this period.
          </div>
        ) : data.map((row) => {
          const variance = row.budget - row.actual
          const isExpanded = expanded.has(row.category)
          const hasSubcats = (row.subcategories?.length ?? 0) > 0
          return (
            <div key={row.category}>
              <div
                onClick={() => hasSubcats && toggleExpand(row.category)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 120px 110px 200px', gap: '12px',
                  padding: '10px 0', borderBottom: '1px solid var(--system-gray6)', alignItems: 'center',
                  cursor: hasSubcats ? 'pointer' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {hasSubcats && (isExpanded ? <ChevronUp size={14} color="var(--system-gray)" /> : <ChevronDown size={14} color="var(--system-gray)" />)}
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>{row.category}</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--secondary-label)', textAlign: 'right' }}>
                  {row.budget > 0 ? formatCurrency(row.budget) : '—'}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--label)', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(row.actual)}</span>
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'right', color: row.budget === 0 ? 'var(--system-gray)' : variance >= 0 ? 'var(--system-green)' : 'var(--system-red)' }}>
                  {row.budget > 0 ? `${variance >= 0 ? '+' : ''}${formatCurrency(variance)}` : '—'}
                </span>
                <ProgressBar spent={row.actual} budget={row.budget} />
              </div>

              {isExpanded && row.subcategories?.map((sub) => {
                const subVariance = sub.budget - sub.actual
                return (
                  <div
                    key={sub.name}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 120px 110px 200px', gap: '12px',
                      padding: '8px 0 8px 24px', borderBottom: '1px solid var(--system-gray6)',
                      alignItems: 'center', backgroundColor: 'var(--system-gray6)',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--secondary-label)' }}>{sub.name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--secondary-label)', textAlign: 'right' }}>
                      {sub.budget > 0 ? formatCurrency(sub.budget) : '—'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--label)', textAlign: 'right' }}>{formatCurrency(sub.actual)}</span>
                    <span style={{ fontSize: '13px', textAlign: 'right', color: sub.budget === 0 ? 'var(--system-gray)' : subVariance >= 0 ? 'var(--system-green)' : 'var(--system-red)' }}>
                      {sub.budget > 0 ? `${subVariance >= 0 ? '+' : ''}${formatCurrency(subVariance)}` : '—'}
                    </span>
                    <ProgressBar spent={sub.actual} budget={sub.budget} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </Card>

      {view === 'ytd' && data.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>Annual Projection</h2>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', gap: '12px', padding: '0 0 10px', borderBottom: '1px solid var(--system-gray5)', marginBottom: '4px' }}>
              {['Category', 'Annual Cap', 'YTD Spend', 'Projection'].map((h) => (
                <span key={h} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--system-gray)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: h === 'Category' ? 'left' : 'right' }}>{h}</span>
              ))}
            </div>
            {data.map((row) => {
              const monthsElapsed = now.getMonth() + 1
              const annualBudget = row.budget * 12
              const projection = (row.actual / monthsElapsed) * 12
              return (
                <div
                  key={row.category}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--system-gray6)', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>{row.category}</span>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-label)', textAlign: 'right' }}>
                    {annualBudget > 0 ? formatCurrency(annualBudget) : '—'}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--label)', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(row.actual)}</span>
                  <span style={{ fontSize: '14px', textAlign: 'right', fontWeight: '500', color: annualBudget > 0 && projection > annualBudget ? 'var(--system-red)' : 'var(--system-green)' }}>
                    {formatCurrency(projection)}
                  </span>
                </div>
              )
            })}
          </Card>
        </div>
      )}
    </div>
  )
}
