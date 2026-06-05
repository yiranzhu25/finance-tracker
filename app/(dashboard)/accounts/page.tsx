'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import PlaidLinkButton from '@/components/plaid/PlaidLinkButton'
import { formatCurrency } from '@/lib/utils'
import { RefreshCw, Unplug } from 'lucide-react'

interface AccountRow {
  id: string
  name: string
  official_name: string | null
  type: string
  subtype: string | null
  is_manual: boolean
  current_balance: number | null
  mask: string | null
  last_synced_at: string | null
  plaid_item_id: string | null
  plaid_items: { institution_name: string | null; last_synced_at: string | null } | null
}

function InstitutionLogo({ name }: { name: string }) {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: 'var(--system-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '700',
        flexShrink: 0,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [updateModal, setUpdateModal] = useState<AccountRow | null>(null)
  const [updateValue, setUpdateValue] = useState('')
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/accounts')
      const { accounts: accs } = await res.json()
      setAccounts(accs ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  async function handleSyncAll() {
    setSyncing(true)
    try {
      await fetch('/api/plaid/sync', { method: 'POST' })
      await loadAccounts()
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect(id: string) {
    setDisconnecting(id)
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      await loadAccounts()
    } finally {
      setDisconnecting(null)
    }
  }

  async function saveManualUpdate() {
    if (!updateModal) return
    const value = parseFloat(updateValue)
    if (isNaN(value)) return
    // Update via snapshots API
    await fetch('/api/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: updateModal.id,
        date: new Date().toISOString().split('T')[0],
        value,
      }),
    })
    setUpdateModal(null)
    await loadAccounts()
  }

  const connected = accounts.filter((a) => !a.is_manual && a.plaid_item_id)
  const manual = accounts.filter((a) => a.is_manual)

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>
          Accounts
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} />}
            loading={syncing}
            onClick={handleSyncAll}
          >
            Sync All
          </Button>
          <PlaidLinkButton onSuccess={() => loadAccounts()} />
        </div>
      </div>

      {/* Connected accounts */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
          Connected Accounts
        </h2>
        <Card>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--system-gray)' }}>
              Loading accounts…
            </div>
          ) : connected.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--system-gray)' }}>
              No connected accounts. Click &ldquo;Connect Account&rdquo; to link your bank.
            </div>
          ) : (
            connected.map((acc, idx) => {
              const institution = acc.plaid_items?.institution_name ?? acc.name
              const syncedAt = acc.plaid_items?.last_synced_at ?? acc.last_synced_at
              return (
                <div
                  key={acc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: idx < connected.length - 1 ? '1px solid var(--system-gray6)' : 'none',
                  }}
                >
                  <InstitutionLogo name={institution} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>
                      {acc.name}{acc.mask ? ` ••${acc.mask}` : ''}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '2px' }}>
                      {institution} · {acc.subtype ?? acc.type}
                      {syncedAt ? ` · Synced ${new Date(syncedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: (acc.current_balance ?? 0) < 0 ? 'var(--system-red)' : 'var(--label)',
                      minWidth: '100px',
                      textAlign: 'right',
                    }}
                  >
                    {acc.current_balance != null ? formatCurrency(Math.abs(acc.current_balance)) : '—'}
                  </span>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    disabled={disconnecting === acc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'var(--system-gray6)',
                      color: 'var(--system-gray)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: disconnecting === acc.id ? 0.5 : 1,
                    }}
                  >
                    <Unplug size={12} />
                    {disconnecting === acc.id ? 'Removing…' : 'Disconnect'}
                  </button>
                </div>
              )
            })
          )}
        </Card>
      </div>

      {/* Manual accounts */}
      {manual.length > 0 && (
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
            Manual Accounts
          </h2>
          <Card>
            {manual.map((acc, idx) => (
              <div
                key={acc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: idx < manual.length - 1 ? '1px solid var(--system-gray6)' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>{acc.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '2px' }}>
                    {acc.last_synced_at ? `Updated ${new Date(acc.last_synced_at).toLocaleDateString()}` : 'No updates yet'}
                  </p>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--system-indigo)', minWidth: '100px', textAlign: 'right' }}>
                  {acc.current_balance != null ? formatCurrency(acc.current_balance) : '—'}
                </span>
                <button
                  onClick={() => { setUpdateModal(acc); setUpdateValue(String(acc.current_balance ?? '')) }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'rgba(0,122,255,0.08)',
                    color: 'var(--system-blue)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Update Value
                </button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Update Value Modal */}
      <Modal
        open={updateModal !== null}
        onClose={() => setUpdateModal(null)}
        title={`Update ${updateModal?.name}`}
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Current Value"
            type="number"
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
            placeholder="0.00"
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="md" onClick={() => setUpdateModal(null)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={saveManualUpdate}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
