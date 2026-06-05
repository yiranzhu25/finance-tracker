'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import TransactionEditModal from '@/components/transactions/TransactionEditModal'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import type { Transaction } from '@/types/database'

const TYPE_OPTIONS = ['All', 'expense', 'income', 'transfer'] as const

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [recurringOnly, setRecurringOnly] = useState(false)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/transactions?limit=500')
      const { data } = await res.json()
      setTransactions(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'All' && t.top_level_type !== typeFilter) return false
    if (recurringOnly && !t.is_recurring) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.description.toLowerCase().includes(q) && !(t.merchant_name?.toLowerCase().includes(q)))
        return false
    }
    return true
  })

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function handleSave(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setEditTransaction(null)
  }

  function handleAdd(t: Transaction) {
    setTransactions((prev) => [t, ...prev])
    setShowAdd(false)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em' }}>
          Transactions
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" icon={<Upload size={14} />}>Import CSV</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Add
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          backgroundColor: 'var(--system-background)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-card)',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--system-gray)' }}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{
              width: '100%', height: '36px', paddingLeft: '30px', paddingRight: '12px',
              borderRadius: '8px', border: '1px solid var(--system-gray5)', fontSize: '14px',
              outline: 'none', backgroundColor: 'var(--system-gray6)', color: 'var(--label)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => { setTypeFilter(opt); setPage(1) }}
              style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '13px',
                fontWeight: typeFilter === opt ? '600' : '400',
                backgroundColor: typeFilter === opt ? 'var(--system-blue)' : 'var(--system-gray6)',
                color: typeFilter === opt ? '#fff' : 'var(--secondary-label)',
                cursor: 'pointer',
                textTransform: opt === 'All' ? undefined : 'capitalize',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--secondary-label)', cursor: 'pointer' }}>
          <input type="checkbox" checked={recurringOnly} onChange={(e) => { setRecurringOnly(e.target.checked); setPage(1) }} />
          Recurring only
        </label>
      </div>

      {/* Transaction list */}
      <div style={{ backgroundColor: 'var(--system-background)', borderRadius: '12px', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--system-gray)' }}>
            Loading transactions…
          </div>
        ) : paged.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--system-gray)' }}>
            {transactions.length === 0
              ? 'No transactions yet. Connect a bank account to get started.'
              : 'No transactions match your filters.'}
          </div>
        ) : (
          paged.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => setEditTransaction(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: idx < paged.length - 1 ? '1px solid var(--system-gray6)' : 'none',
                cursor: 'pointer', transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--system-gray6)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
            >
              <span style={{ fontSize: '13px', color: 'var(--system-gray)', minWidth: '56px', flexShrink: 0 }}>
                {formatShortDate(t.date)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.merchant_name || t.description}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--system-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <Badge variant={t.top_level_type as 'expense' | 'income' | 'transfer'}>{t.top_level_type}</Badge>
                {t.is_recurring && <Badge variant="recurring">Recurring</Badge>}
                {t.pending && <Badge variant="pending">Pending</Badge>}
              </div>
              <span
                style={{
                  fontSize: '15px', fontWeight: '600',
                  color: t.top_level_type === 'income' ? 'var(--system-green)' : t.top_level_type === 'expense' ? 'var(--system-red)' : 'var(--system-gray)',
                  minWidth: '90px', textAlign: 'right', flexShrink: 0,
                }}
              >
                {t.top_level_type === 'expense' ? '-' : t.top_level_type === 'income' ? '+' : ''}
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span style={{ fontSize: '14px', color: 'var(--system-gray)' }}>Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {editTransaction && (
        <TransactionEditModal transaction={editTransaction} onClose={() => setEditTransaction(null)} onSave={handleSave} />
      )}
      {showAdd && (
        <AddTransactionModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  )
}
