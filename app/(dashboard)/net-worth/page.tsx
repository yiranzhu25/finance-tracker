'use client'

import { useState, useEffect } from 'react'
import NetWorthChart from '@/components/charts/NetWorthChart'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

interface AccountRow {
  id: string
  name: string
  type: string
  current_balance: number | null
}

interface NetWorthHistory {
  month: string
  netWorth: number
  assets: number
  liabilities: number
}

function isLiability(type: string) {
  return type === 'credit' || type === 'loan'
}

export default function NetWorthPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [history, setHistory] = useState<NetWorthHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [snapshotAccount, setSnapshotAccount] = useState('')
  const [snapshotValue, setSnapshotValue] = useState('')
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const manualAccounts = accounts.filter((a) => !isLiability(a.type))

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts').then((r) => r.json()),
      fetch('/api/cash-flow?months=12').then((r) => r.json()),
    ]).then(([accData, _cf]) => {
      setAccounts(accData.accounts ?? [])
      // Build a single current snapshot for the chart
      // Historical net worth tracking requires portfolio_snapshots; show current month for now
      const accs: AccountRow[] = accData.accounts ?? []
      const totalAssets = accs.filter((a) => !isLiability(a.type)).reduce((s, a) => s + Number(a.current_balance ?? 0), 0)
      const totalLiabilities = accs.filter((a) => isLiability(a.type)).reduce((s, a) => s + Number(a.current_balance ?? 0), 0)
      const now = new Date()
      const monthLabel = now.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (totalAssets > 0 || totalLiabilities > 0) {
        setHistory([{ month: monthLabel, netWorth: totalAssets - totalLiabilities, assets: totalAssets, liabilities: totalLiabilities }])
      }
    }).finally(() => setLoading(false))
  }, [])

  async function saveSnapshot() {
    if (!snapshotAccount || !snapshotValue) return
    setSaving(true)
    try {
      await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: snapshotAccount,
          date: snapshotDate,
          value: parseFloat(snapshotValue),
        }),
      })
      setShowAdd(false)
      setSnapshotValue('')
    } finally {
      setSaving(false)
    }
  }

  const assets = accounts.filter((a) => !isLiability(a.type))
  const liabilities = accounts.filter((a) => isLiability(a.type))
  const totalAssets = assets.reduce((s, a) => s + Number(a.current_balance ?? 0), 0)
  const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.current_balance ?? 0), 0)
  const netWorth = totalAssets - totalLiabilities

  const current = history[history.length - 1]
  const prev = history[history.length - 2]
  const momDelta = current && prev ? current.netWorth - prev.netWorth : null
  const yoyDelta = null

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>Net Worth</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Snapshot
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--system-gray)' }}>Loading…</div>
      ) : (
        <>
          {/* Hero */}
          <Card style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: 'var(--system-gray)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Net Worth
            </p>
            <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              {formatCurrency(netWorth)}
            </p>
            {(momDelta !== null || yoyDelta !== null) && (
              <div style={{ display: 'flex', gap: '20px' }}>
                {momDelta !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {momDelta >= 0 ? <TrendingUp size={14} color="var(--system-green)" /> : <TrendingDown size={14} color="var(--system-red)" />}
                    <span style={{ fontSize: '13px', color: momDelta >= 0 ? 'var(--system-green)' : 'var(--system-red)', fontWeight: '500' }}>
                      {momDelta >= 0 ? '+' : ''}{formatCurrency(momDelta)} MoM
                    </span>
                  </div>
                )}
              </div>
            )}
            {accounts.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginTop: '8px' }}>
                Connect a bank account to see your real net worth here.
              </p>
            )}
          </Card>

          {/* Chart */}
          {history.length > 1 && (
            <Card style={{ marginBottom: '24px' }}>
              <NetWorthChart data={history} />
            </Card>
          )}

          {/* Assets + Liabilities */}
          {accounts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Card>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
                  Assets — {formatCurrency(totalAssets)}
                </h2>
                {assets.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--system-gray6)' }}>
                    <span style={{ fontSize: '14px', color: 'var(--label)' }}>{a.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--system-green)' }}>
                      {formatCurrency(Number(a.current_balance ?? 0))}
                    </span>
                  </div>
                ))}
              </Card>

              {liabilities.length > 0 && (
                <Card>
                  <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
                    Liabilities — {formatCurrency(totalLiabilities)}
                  </h2>
                  {liabilities.map((a) => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--system-gray6)' }}>
                      <span style={{ fontSize: '14px', color: 'var(--label)' }}>{a.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--system-red)' }}>
                        {formatCurrency(Number(a.current_balance ?? 0))}
                      </span>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Portfolio Snapshot" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>Account</label>
            <select
              value={snapshotAccount}
              onChange={(e) => setSnapshotAccount(e.target.value)}
              style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid var(--system-gray4)', padding: '0 12px', fontSize: '15px', outline: 'none', backgroundColor: 'var(--system-background)', color: 'var(--label)' }}
            >
              <option value="">Select account…</option>
              {manualAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <Input label="Date" type="date" value={snapshotDate} onChange={(e) => setSnapshotDate(e.target.value)} />
          <Input label="Value" type="number" placeholder="0.00" value={snapshotValue} onChange={(e) => setSnapshotValue(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="md" loading={saving} onClick={saveSnapshot}>Save Snapshot</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
