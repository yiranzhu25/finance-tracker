'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface NetWorthChartProps {
  data: { month: string; netWorth: number; assets: number; liabilities: number }[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload || !payload.length) return null

  const labels: Record<string, string> = {
    netWorth: 'Net Worth',
    assets: 'Assets',
    liabilities: 'Liabilities',
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--system-background)',
        border: '1px solid var(--system-gray5)',
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        minWidth: '160px',
      }}
    >
      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--label)', marginBottom: '8px' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}
        >
          <span style={{ fontSize: '13px', color: entry.color }}>
            {labels[entry.name] || entry.name}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function NetWorthChart({ data }: NetWorthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--system-gray5)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: 'var(--system-gray)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: 'var(--system-gray)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
          formatter={(value) =>
            value === 'netWorth' ? 'Net Worth' : value === 'assets' ? 'Assets' : 'Liabilities'
          }
        />
        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="#007AFF"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#007AFF', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="assets"
          stroke="#34C759"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="liabilities"
          stroke="#FF3B30"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
