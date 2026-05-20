'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { RefreshCw, Unplug, Plus, Edit2 } from 'lucide-react'

interface ConnectedAccount {
  id: string
  institution: string
  name: string
  type: string
  balance: number
  lastSynced: string
}

interface ManualAccount {
  id: string
  name: string
  value: number
  lastUpdated: string
}

const MOCK_CONNECTED: ConnectedAccount[] = [
  { id: '1', institution: 'Chase', name: 'Checking ••4821', type: 'Checking', balance: 12400, lastSynced: '2026-05-17T08:00:00Z' },
  { id: '2', institution: 'Chase', name: 'Sapphire Reserve ••7291', type: 'Credit Card', balance: -2800, lastSynced: '2026-05-17T08:00:00Z' },
  { id: '3', institution: 'Marcus', name: 'High-Yield Savings', type: 'Savings', balance: 18200, lastSynced: '2026-05-16T20:00:00Z' },
  { id: '4', institution: 'Fidelity', name: 'Brokerage ••3381', type: 'Brokerage', balance: 38600, lastSynced: '2026-05-17T06:00:00Z' },
]

const MOCK_MANUAL: ManualAccount[] = [
  { id: '1', name: '401k (Fidelity)', value: 42500, lastUpdated: '2026-05-01' },
  { id: '2', name: '401k (Vanguard)', value: 28100, lastUpdated: '2026-05-01' },
  { id: '3', name: '529 Plan', value: 11150, lastUpdated: '2026-05-01' },
]

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
  const [connected, setConnected] = useState(MOCK_CONNECTED)
  const [manual, setManual] = useState(MOCK_MANUAL)
  const [syncing, setSyncing] = useState(false)
  const [updateModal, setUpdateModal] = useState<ManualAccount | null>(null)
  const [updateValue, setUpdateValue] = useState('')

  async function handleSyncAll() {
    setSyncing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSyncing(false)
  }

  function handleDisconnect(id: string) {
    setConnected((prev) => prev.filter((a) => a.id !== id))
  }

  function openUpdate(acc: ManualAccount) {
    setUpdateModal(acc)
    setUpdateValue(acc.value.toString())
  }

  function saveUpdate() {
    if (!updateModal) return
    setManual((prev) =>
      prev.map((a) =>
        a.id === updateModal.id
          ? { ...a, value: parseFloat(updateValue) || a.value, lastUpdated: new Date().toISOString().split('T')[0] }
          : a
      )
    )
    setUpdateModal(null)
  }

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
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>
            Connect Account
          </Button>
        </div>
      </div>

      {/* Connected accounts */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--label)', marginBottom: '12px' }}>
          Connected Accounts
        </h2>
        <Card>
          {connected.map((acc, idx) => (
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
              <InstitutionLogo name={acc.institution} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>
                  {acc.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '2px' }}>
                  {acc.institution} · {acc.type} · Last synced {new Date(acc.lastSynced).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: acc.balance < 0 ? 'var(--system-red)' : 'var(--label)',
                  minWidth: '100px',
                  textAlign: 'right',
                }}
              >
                {formatCurrency(Math.abs(acc.balance))}
              </span>
              <button
                onClick={() => handleDisconnect(acc.id)}
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
                }}
              >
                <Unplug size={12} />
                Disconnect
              </button>
            </div>
          ))}
          {connected.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--system-gray)' }}>
              No connected accounts. Click "Connect Account" to link your bank.
            </div>
          )}
        </Card>
      </div>

      {/* Manual accounts */}
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
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>
                  {acc.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '2px' }}>
                  Last updated {formatDate(acc.lastUpdated)}
                </p>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--system-indigo)', minWidth: '100px', textAlign: 'right' }}>
                {formatCurrency(acc.value)}
              </span>
              <button
                onClick={() => openUpdate(acc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
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
                <Edit2 size={12} />
                Update Value
              </button>
            </div>
          ))}
        </Card>
      </div>

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
            <Button variant="primary" size="md" onClick={saveUpdate}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
