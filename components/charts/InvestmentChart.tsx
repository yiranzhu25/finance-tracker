'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface InvestmentChartProps {
  data: { month: string; [accountName: string]: number | string }[]
  accounts: string[]
  activeAccounts: string[]
}

const ACCOUNT_COLORS = ['#007AFF', '#34C759', '#FF9500', '#5856D6', '#FF3B30', '#00C7BE', '#FF6B6B']

function CustomTooltip({ active, payload, label, accounts }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  accounts: string[]
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
        minWidth: '200px',
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
          <span style={{ fontSize: '12px', color: entry.color, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.name}
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function InvestmentChart({ data, accounts, activeAccounts }: InvestmentChartProps) {
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
        <Tooltip content={<CustomTooltip accounts={accounts} />} />
        {accounts.map((account, i) => (
          activeAccounts.includes(account) && (
            <Line
              key={account}
              type="monotone"
              dataKey={account}
              stroke={ACCOUNT_COLORS[i % ACCOUNT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2.5, fill: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length], strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
