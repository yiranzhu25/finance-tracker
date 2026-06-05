'use client'

import { useState, useEffect } from 'react'
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
  subtype: string | null
  current_balance: number | null
  is_manual: boolean
}

function isInvestmentAccount(a: AccountRow) {
  return a.type === 'investment' || a.type === 'brokerage' || a.subtype === 'retirement' || a.subtype === '401k' || a.subtype === '403b' || a.subtype === 'ira' || a.subtype === 'roth' || a.subtype === '529' || a.is_manual
}

export default function InvestmentsPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addAccount, setAddAccount] = useState('')
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0])
  const [addValue, setAddValue] = useState('')
  const [saving, setSaving] = useState(false)

  const loadAccounts = () => {
    setLoading(true)
    fetch('/api/accounts')
      .then((r) => r.json())
      .then(({ accounts: accs }) => {
        const inv = (accs ?? []).filter(isInvestmentAccount)
        setAccounts(inv)
        if (inv.length > 0) setAddAccount(inv[0].id)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAccounts() }, [])

  async function saveEntry() {
    if (!addAccount || !addValue) return
    setSaving(true)
    try {
      await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: addAccount,
          date: addDate,
          value: parseFloat(addValue),
        }),
      })
      setShowAdd(false)
      setAddValue('')
      loadAccounts()
    } finally {
      setSaving(false)
    }
  }

  const total = accounts.reduce((s, a) => s + Number(a.current_balance ?? 0), 0)

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>Investments</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Entry
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--system-gray)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
          Total Investments
        </p>
        <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--system-indigo)' }}>
          {formatCurrency(total)}
        </p>
      </Card>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--system-gray)' }}>Loading…</div>
      ) : accounts.length === 0 ? (
        <Card>
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--system-gray)' }}>
            <p>No investment accounts found.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Connect a brokerage or retirement account via Plaid, or add a manual account.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {accounts.map((a) => {
            const current = Number(a.current_balance ?? 0)
            return (
              <Card key={a.id}>
                <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginBottom: '4px' }}>{a.name}</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--label)', marginBottom: '6px' }}>
                  {formatCurrency(current)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--system-gray)' }}>
                  {a.subtype ?? a.type}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Investment Entry" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>Account</label>
            <select
              value={addAccount}
              onChange={(e) => setAddAccount(e.target.value)}
              style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid var(--system-gray4)', padding: '0 12px', fontSize: '15px', outline: 'none', backgroundColor: 'var(--system-background)', color: 'var(--label)' }}
            >
              {accounts.length === 0
                ? <option value="">No accounts</option>
                : accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)
              }
            </select>
          </div>
          <Input label="Date" type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
          <Input label="Value" type="number" placeholder="0.00" value={addValue} onChange={(e) => setAddValue(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="md" loading={saving} onClick={saveEntry}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
