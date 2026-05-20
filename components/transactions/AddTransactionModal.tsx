'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Transaction, TopLevelType } from '@/types/database'

interface AddTransactionModalProps {
  onClose: () => void
  onAdd: (t: Transaction) => void
}

const MOCK_ACCOUNTS = [
  { id: 'a1', name: 'Chase Checking' },
  { id: 'a2', name: 'Marcus HYSA' },
  { id: 'a3', name: 'Fidelity Brokerage' },
]

const CATEGORIES: Record<TopLevelType, string[]> = {
  expense: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other'],
  income: ['Salary', 'Investment Income', 'Side Income', 'Other'],
  transfer: ['Account Transfer', 'Credit Card Payment'],
}

const SUBCATEGORIES: Record<string, string[]> = {
  'Food & Dining': ['Groceries', 'Restaurants', 'Coffee'],
  Transportation: ['Gas', 'Parking', 'Transit'],
  Entertainment: ['Streaming', 'Events'],
  Shopping: ['Clothing', 'Electronics', 'Home'],
  Health: ['Gym', 'Medical', 'Pharmacy'],
  Utilities: ['Electric', 'Internet', 'Water'],
  Salary: ['Primary Job', 'Bonus'],
  'Investment Income': ['Dividends', 'Interest'],
}

const TYPE_OPTIONS: { value: TopLevelType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
]

export default function AddTransactionModal({ onClose, onAdd }: AddTransactionModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState(MOCK_ACCOUNTS[0].id)
  const [type, setType] = useState<TopLevelType>('expense')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = CATEGORIES[type] || []
  const subcategories = category ? (SUBCATEGORIES[category] || []) : []

  async function handleAdd() {
    if (!date || !description || !amount || !accountId) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          description,
          amount: parseFloat(amount),
          account_id: accountId,
          top_level_type: type,
          category_id: category || null,
          subcategory_id: subcategory || null,
          notes: notes || null,
          is_recurring: isRecurring,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        onAdd(data)
      } else {
        const { error: apiError } = await response.json()
        setError(apiError || 'Failed to add transaction.')
      }
    } catch {
      // Use mock data when API is not configured
      const mockTx: Transaction = {
        id: Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
        user_id: 'u1',
        plaid_transaction_id: null,
        date,
        amount: parseFloat(amount),
        description,
        merchant_name: null,
        account_id: accountId,
        top_level_type: type,
        category_id: category || null,
        subcategory_id: subcategory || null,
        transfer_pair_id: null,
        is_recurring: isRecurring,
        recurring_group_id: null,
        is_manual: true,
        notes: notes || null,
        pending: false,
      }
      onAdd(mockTx)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Add Transaction" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Date + Description row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Input
          label="Description"
          placeholder="Transaction description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Account */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            style={{
              width: '100%',
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
            {MOCK_ACCOUNTS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', marginBottom: '8px' }}>
            Type
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setType(value); setCategory(''); setSubcategory('') }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: `2px solid ${type === value ? 'var(--system-blue)' : 'var(--system-gray5)'}`,
                  backgroundColor: type === value ? 'rgba(0,122,255,0.08)' : 'transparent',
                  color: type === value ? 'var(--system-blue)' : 'var(--secondary-label)',
                  fontSize: '14px',
                  fontWeight: type === value ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setSubcategory('') }}
              style={{
                width: '100%',
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
              <option value="">Select...</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>
              Subcategory
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={subcategories.length === 0}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid var(--system-gray4)',
                padding: '0 12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: subcategories.length === 0 ? 'var(--system-gray6)' : 'var(--system-background)',
                color: 'var(--label)',
              }}
            >
              <option value="">Select...</option>
              {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1px solid var(--system-gray4)',
              padding: '8px 12px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              backgroundColor: 'var(--system-background)',
              color: 'var(--label)',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Recurring toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>Recurring</p>
          <button
            onClick={() => setIsRecurring((prev) => !prev)}
            style={{
              width: '44px',
              height: '26px',
              borderRadius: '13px',
              border: 'none',
              backgroundColor: isRecurring ? 'var(--system-green)' : 'var(--system-gray4)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: isRecurring ? '21px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: 'var(--system-red)', backgroundColor: 'rgba(255,59,48,0.08)', padding: '8px 12px', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleAdd}>Add Transaction</Button>
        </div>
      </div>
    </Modal>
  )
}
