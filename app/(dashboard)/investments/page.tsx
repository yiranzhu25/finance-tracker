'use client'

import { useState } from 'react'
import InvestmentChart from '@/components/charts/InvestmentChart'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

const ACCOUNTS = ['Fidelity Brokerage', 'Coinbase', '401k (Fidelity)', '401k (Vanguard)', '529 Plan']

const MOCK_DATA = [
  { month: 'Jun 25', 'Fidelity Brokerage': 32000, 'Coinbase': 3100, '401k (Fidelity)': 38000, '401k (Vanguard)': 24000, '529 Plan': 9200 },
  { month: 'Jul 25', 'Fidelity Brokerage': 33200, 'Coinbase': 3400, '401k (Fidelity)': 38800, '401k (Vanguard)': 24600, '529 Plan': 9400 },
  { month: 'Aug 25', 'Fidelity Brokerage': 31800, 'Coinbase': 2900, '401k (Fidelity)': 39200, '401k (Vanguard)': 25000, '529 Plan': 9600 },
  { month: 'Sep 25', 'Fidelity Brokerage': 34100, 'Coinbase': 3200, '401k (Fidelity)': 40100, '401k (Vanguard)': 25500, '529 Plan': 9800 },
  { month: 'Oct 25', 'Fidelity Brokerage': 35400, 'Coinbase': 3600, '401k (Fidelity)': 40800, '401k (Vanguard)': 26100, '529 Plan': 10000 },
  { month: 'Nov 25', 'Fidelity Brokerage': 36200, 'Coinbase': 3800, '401k (Fidelity)': 41500, '401k (Vanguard)': 26700, '529 Plan': 10200 },
  { month: 'Dec 25', 'Fidelity Brokerage': 37100, 'Coinbase': 4000, '401k (Fidelity)': 42000, '401k (Vanguard)': 27200, '529 Plan': 10500 },
  { month: 'Jan 26', 'Fidelity Brokerage': 36800, 'Coinbase': 3900, '401k (Fidelity)': 41800, '401k (Vanguard)': 27600, '529 Plan': 10700 },
  { month: 'Feb 26', 'Fidelity Brokerage': 37900, 'Coinbase': 4100, '401k (Fidelity)': 42200, '401k (Vanguard)': 27900, '529 Plan': 10900 },
  { month: 'Mar 26', 'Fidelity Brokerage': 38200, 'Coinbase': 4200, '401k (Fidelity)': 42400, '401k (Vanguard)': 28000, '529 Plan': 11000 },
  { month: 'Apr 26', 'Fidelity Brokerage': 38400, 'Coinbase': 4100, '401k (Fidelity)': 42400, '401k (Vanguard)': 28000, '529 Plan': 11100 },
  { month: 'May 26', 'Fidelity Brokerage': 38600, 'Coinbase': 4200, '401k (Fidelity)': 42500, '401k (Vanguard)': 28100, '529 Plan': 11150 },
]

const CURRENT = MOCK_DATA[MOCK_DATA.length - 1]
const PREV = MOCK_DATA[MOCK_DATA.length - 2]

interface AccountCardProps {
  name: string
  current: number
  prev: number
}

function AccountCard({ name, current, prev }: AccountCardProps) {
  const delta = current - prev
  const pct = prev > 0 ? (delta / prev) * 100 : 0
  return (
    <Card>
      <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginBottom: '4px' }}>{name}</p>
      <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--label)', marginBottom: '6px' }}>
        {formatCurrency(current)}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {delta >= 0 ? (
          <TrendingUp size={13} color="var(--system-green)" />
        ) : (
          <TrendingDown size={13} color="var(--system-red)" />
        )}
        <span
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: delta >= 0 ? 'var(--system-green)' : 'var(--system-red)',
          }}
        >
          {delta >= 0 ? '+' : ''}{formatCurrency(delta)} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
        </span>
      </div>
    </Card>
  )
}

export default function InvestmentsPage() {
  const [activeAccounts, setActiveAccounts] = useState<string[]>(ACCOUNTS)
  const [showAdd, setShowAdd] = useState(false)
  const [addAccount, setAddAccount] = useState(ACCOUNTS[0])
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0])
  const [addValue, setAddValue] = useState('')

  function toggleAccount(name: string) {
    setActiveAccounts((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    )
  }

  const total = ACCOUNTS.reduce((s, a) => s + (CURRENT[a as keyof typeof CURRENT] as number), 0)

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>
          Investments
        </h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Entry
        </Button>
      </div>

      {/* Total */}
      <Card style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--system-gray)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
          Total Investments
        </p>
        <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--system-indigo)' }}>
          {formatCurrency(total)}
        </p>
      </Card>

      {/* Account toggles + chart */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {ACCOUNTS.map((a, i) => {
            const colors = ['#007AFF', '#34C759', '#FF9500', '#5856D6', '#FF3B30']
            const isActive = activeAccounts.includes(a)
            return (
              <button
                key={a}
                onClick={() => toggleAccount(a)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: `2px solid ${colors[i % colors.length]}`,
                  backgroundColor: isActive ? colors[i % colors.length] : 'transparent',
                  color: isActive ? '#fff' : colors[i % colors.length],
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {a}
              </button>
            )
          })}
        </div>
        <InvestmentChart data={MOCK_DATA} accounts={ACCOUNTS} activeAccounts={activeAccounts} />
      </Card>

      {/* Account cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {ACCOUNTS.map((a) => (
          <AccountCard
            key={a}
            name={a}
            current={CURRENT[a as keyof typeof CURRENT] as number}
            prev={PREV[a as keyof typeof PREV] as number}
          />
        ))}
      </div>

      {/* Add Entry Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Investment Entry" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: 'var(--secondary-label)', fontWeight: '500' }}>
              Account
            </label>
            <select
              value={addAccount}
              onChange={(e) => setAddAccount(e.target.value)}
              style={{
                height: '40px',
                borderRadius: '8px',
                border: '1px solid var(--system-gray4)',
                padding: '0 12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'var(--system-background)',
                color: 'var(--label)',
              }}
            >
              {ACCOUNTS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={addDate}
            onChange={(e) => setAddDate(e.target.value)}
          />
          <Input
            label="Value"
            type="number"
            placeholder="0.00"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={() => setShowAdd(false)}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
