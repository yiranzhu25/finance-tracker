'use client'

import { useState } from 'react'
import NetWorthChart from '@/components/charts/NetWorthChart'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

const MOCK_HISTORY = [
  { month: 'Jun 25', netWorth: 118000, assets: 132000, liabilities: 14000 },
  { month: 'Jul 25', netWorth: 121500, assets: 135000, liabilities: 13500 },
  { month: 'Aug 25', netWorth: 119800, assets: 133500, liabilities: 13700 },
  { month: 'Sep 25', netWorth: 124200, assets: 137800, liabilities: 13600 },
  { month: 'Oct 25', netWorth: 127100, assets: 140500, liabilities: 13400 },
  { month: 'Nov 25', netWorth: 129800, assets: 143000, liabilities: 13200 },
  { month: 'Dec 25', netWorth: 131500, assets: 144600, liabilities: 13100 },
  { month: 'Jan 26', netWorth: 134200, assets: 147100, liabilities: 12900 },
  { month: 'Feb 26', netWorth: 137800, assets: 150500, liabilities: 12700 },
  { month: 'Mar 26', netWorth: 139600, assets: 152100, liabilities: 12500 },
  { month: 'Apr 26', netWorth: 141200, assets: 153600, liabilities: 12400 },
  { month: 'May 26', netWorth: 142850, assets: 155150, liabilities: 12300 },
]

const ASSETS = [
  { name: 'Checking (Chase)', value: 12400, type: 'asset' },
  { name: 'HYSA (Marcus)', value: 18200, type: 'asset' },
  { name: 'Brokerage (Fidelity)', value: 38600, type: 'asset' },
  { name: 'Coinbase', value: 4200, type: 'asset' },
  { name: '401k (Fidelity)', value: 42500, type: 'asset' },
  { name: '401k (Vanguard)', value: 28100, type: 'asset' },
  { name: '529 Plan', value: 11150, type: 'asset' },
]

const LIABILITIES = [
  { name: 'Chase Sapphire', value: 2800, type: 'liability' },
  { name: 'Amex Platinum', value: 1200, type: 'liability' },
  { name: 'Mortgage', value: 8300, type: 'liability' },
]

const current = MOCK_HISTORY[MOCK_HISTORY.length - 1]
const prev = MOCK_HISTORY[MOCK_HISTORY.length - 2]
const prevYear = MOCK_HISTORY[MOCK_HISTORY.length - 13] || MOCK_HISTORY[0]
const momDelta = current.netWorth - prev.netWorth
const yoyDelta = current.netWorth - prevYear.netWorth

export default function NetWorthPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [snapshotAccount, setSnapshotAccount] = useState('')
  const [snapshotValue, setSnapshotValue] = useState('')
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0])

  const totalAssets = ASSETS.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = LIABILITIES.reduce((s, a) => s + a.value, 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>
          Net Worth
        </h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Snapshot
        </Button>
      </div>

      {/* Current net worth hero */}
      <Card className="mb-6" style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: 'var(--system-gray)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
          Net Worth
        </p>
        <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          {formatCurrency(netWorth)}
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {momDelta >= 0 ? <TrendingUp size={14} color="var(--system-green)" /> : <TrendingDown size={14} color="var(--system-red)" />}
            <span style={{ fontSize: '13px', color: momDelta >= 0 ? 'var(--system-green)' : 'var(--system-red)', fontWeight: '500' }}>
              {momDelta >= 0 ? '+' : ''}{formatCurrency(momDelta)} MoM
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {yoyDelta >= 0 ? <TrendingUp size={14} color="var(--system-green)" /> : <TrendingDown size={14} color="var(--system-red)" />}
            <span style={{ fontSize: '13px', color: yoyDelta >= 0 ? 'var(--system-green)' : 'var(--system-red)', fontWeight: '500' }}>
              {yoyDelta >= 0 ? '+' : ''}{formatCurrency(yoyDelta)} YoY
            </span>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="mb-6" style={{ marginBottom: '24px' }}>
        <NetWorthChart data={MOCK_HISTORY} />
      </Card>

      {/* Assets + Liabilities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Assets */}
        <Card>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
            Assets — {formatCurrency(totalAssets)}
          </h2>
          {ASSETS.map((a) => (
            <div
              key={a.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--system-gray6)',
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--label)' }}>{a.name}</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--system-green)' }}>
                {formatCurrency(a.value)}
              </span>
            </div>
          ))}
        </Card>

        {/* Liabilities */}
        <Card>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
            Liabilities — {formatCurrency(totalLiabilities)}
          </h2>
          {LIABILITIES.map((l) => (
            <div
              key={l.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--system-gray6)',
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--label)' }}>{l.name}</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--system-red)' }}>
                {formatCurrency(l.value)}
              </span>
            </div>
          ))}
        </Card>
      </div>

      {/* Add Snapshot Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Portfolio Snapshot" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Account"
            placeholder="e.g. Fidelity 401k"
            value={snapshotAccount}
            onChange={(e) => setSnapshotAccount(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={snapshotDate}
            onChange={(e) => setSnapshotDate(e.target.value)}
          />
          <Input
            label="Value"
            type="number"
            placeholder="0.00"
            value={snapshotValue}
            onChange={(e) => setSnapshotValue(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={() => setShowAdd(false)}>Save Snapshot</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
