'use client'

import { useState } from 'react'
import CashFlowChart from '@/components/charts/CashFlowChart'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MOCK_DATA = [
  { month: 'Jun 25', income: 8200, expenses: 4100, net: 4100 },
  { month: 'Jul 25', income: 8500, expenses: 3800, net: 4700 },
  { month: 'Aug 25', income: 8500, expenses: 5200, net: 3300 },
  { month: 'Sep 25', income: 9000, expenses: 4300, net: 4700 },
  { month: 'Oct 25', income: 8500, expenses: 4600, net: 3900 },
  { month: 'Nov 25', income: 8500, expenses: 5800, net: 2700 },
  { month: 'Dec 25', income: 10200, expenses: 7200, net: 3000 },
  { month: 'Jan 26', income: 8500, expenses: 4200, net: 4300 },
  { month: 'Feb 26', income: 8500, expenses: 3900, net: 4600 },
  { month: 'Mar 26', income: 8500, expenses: 4500, net: 4000 },
  { month: 'Apr 26', income: 8500, expenses: 4100, net: 4400 },
  { month: 'May 26', income: 8500, expenses: 3920, net: 4580 },
]

export default function CashFlowPage() {
  const [months, setMonths] = useState(12)

  const data = MOCK_DATA.slice(-months)

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
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
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
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

      {/* Chart */}
      <Card className="mb-6" style={{ marginBottom: '24px' }}>
        <CashFlowChart data={data} />
      </Card>

      {/* Summary table */}
      <Card>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 1fr 1fr 120px',
            gap: '12px',
            padding: '0 0 10px',
            borderBottom: '1px solid var(--system-gray5)',
            marginBottom: '4px',
          }}
        >
          {['Month', 'Income', 'Expenses', 'Net', 'MoM Change'].map((h) => (
            <span
              key={h}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--system-gray)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textAlign: h === 'Month' ? 'left' : 'right',
              }}
            >
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
                display: 'grid',
                gridTemplateColumns: '100px 1fr 1fr 1fr 120px',
                gap: '12px',
                padding: '10px 0',
                borderBottom: idx < data.length - 1 ? '1px solid var(--system-gray6)' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>
                {row.month}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--system-green)', textAlign: 'right', fontWeight: '500' }}>
                {formatCurrency(row.income)}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--system-red)', textAlign: 'right', fontWeight: '500' }}>
                {formatCurrency(row.expenses)}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'right',
                  color: row.net >= 0 ? 'var(--system-green)' : 'var(--system-red)',
                }}
              >
                {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                {mom === null ? (
                  <span style={{ fontSize: '13px', color: 'var(--system-gray)' }}>—</span>
                ) : mom > 0 ? (
                  <>
                    <TrendingUp size={13} color="var(--system-green)" />
                    <span style={{ fontSize: '13px', color: 'var(--system-green)', fontWeight: '500' }}>
                      +{formatCurrency(mom)}
                    </span>
                  </>
                ) : mom < 0 ? (
                  <>
                    <TrendingDown size={13} color="var(--system-red)" />
                    <span style={{ fontSize: '13px', color: 'var(--system-red)', fontWeight: '500' }}>
                      {formatCurrency(mom)}
                    </span>
                  </>
                ) : (
                  <>
                    <Minus size={13} color="var(--system-gray)" />
                    <span style={{ fontSize: '13px', color: 'var(--system-gray)' }}>$0</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
