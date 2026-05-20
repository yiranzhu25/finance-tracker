'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CashFlowChartProps {
  data: { month: string; income: number; expenses: number; net: number }[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload || !payload.length) return null

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
            {entry.name === 'expenses' ? 'Expenses' : entry.name === 'income' ? 'Income' : 'Net'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: entry.color }}>
            {entry.name === 'expenses' ? '-' : ''}{formatCurrency(Math.abs(entry.value))}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  // Transform expenses to negative for display
  const chartData = data.map((d) => ({
    ...d,
    expenses: -d.expenses,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--system-gray5)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: 'var(--system-gray)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${Math.abs(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: 'var(--system-gray)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
          formatter={(value) =>
            value === 'income' ? 'Income' : value === 'expenses' ? 'Expenses' : 'Net'
          }
        />
        <Bar dataKey="income" fill="#34C759" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="expenses" fill="#FF3B30" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#007AFF"
          strokeWidth={2}
          dot={{ r: 3, fill: '#007AFF', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
