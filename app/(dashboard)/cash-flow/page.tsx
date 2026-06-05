'use client'

import { useState, useEffect } from 'react'
import CashFlowChart from '@/components/charts/CashFlowChart'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MonthRow {
  month: string
  income: number
  expenses: number
  net: number
}

export default function CashFlowPage() {
  const [months, setMonths] = useState(12)
  const [data, setData] = useState<MonthRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/cash-flow?months=${months}`)
      .then((r) => r.json())
      .then(({ data: rows }) => setData(rows ?? []))
      .finally(() => setLoading(false))
  }, [months])

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>
          Cash Flow
        </h1>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '13px',
                fontWeight: months === m ? '600' : '400',
                backgroundColor: months === m ? 'var(--system-blue)' : 'var(--system-gray6)',
                color: months === m ? '#fff' : 'var(--secondary-label)',
                cursor: 'pointer',
              }}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-6" style={{ marginBottom: '24px' }}>
        {loading ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--system-gray)' }}>
            Loading…
          </div>
        ) : data.every((d) => d.income === 0 && d.expenses === 0) ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--system-gray)', flexDirection: 'column', gap: '8px' }}>
            <p>No transaction data yet.</p>
            <p style={{ fontSize: '13px' }}>Connect a bank account and sync to see your cash flow.</p>
          </div>
        ) : (
          <CashFlowChart data={data} />
        )}
      </Card>

      <Card>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 120px', gap: '12px',
            padding: '0 0 10px', borderBottom: '1px solid var(--system-gray5)', marginBottom: '4px',
          }}
        >
          {['Month', 'Income', 'Expenses', 'Net', 'MoM Change'].map((h) => (
            <span key={h} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--system-gray)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: h === 'Month' ? 'left' : 'right' }}>
              {h}
            </span>
          ))}
        </div>

        {data.map((row, idx) => {
          const prev = idx > 0 ? data[idx - 1] : null
          const mom = prev ? row.net - prev.net : null
          return (
            <div
              key={row.month}
              style={{
                display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 120px', gap: '12px',
                padding: '10px 0', borderBottom: idx < data.length - 1 ? '1px solid var(--system-gray6)' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>{row.month}</span>
              <span style={{ fontSize: '14px', color: 'var(--system-green)', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(row.income)}</span>
              <span style={{ fontSize: '14px', color: 'var(--system-red)', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(row.expenses)}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'right', color: row.net >= 0 ? 'var(--system-green)' : 'var(--system-red)' }}>
                {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                {mom === null ? (
                  <span style={{ fontSize: '13px', color: 'var(--system-gray)' }}>—</span>
                ) : mom > 0 ? (
                  <><TrendingUp size={13} color="var(--system-green)" /><span style={{ fontSize: '13px', color: 'var(--system-green)', fontWeight: '500' }}>+{formatCurrency(mom)}</span></>
                ) : mom < 0 ? (
                  <><TrendingDown size={13} color="var(--system-red)" /><span style={{ fontSize: '13px', color: 'var(--system-red)', fontWeight: '500' }}>{formatCurrency(mom)}</span></>
                ) : (
                  <><Minus size={13} color="var(--system-gray)" /><span style={{ fontSize: '13px', color: 'var(--system-gray)' }}>$0</span></>
                )}
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
