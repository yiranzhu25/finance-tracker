'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { Transaction, TopLevelType } from '@/types/database'

interface TransactionEditModalProps {
  transaction: Transaction
  onClose: () => void
  onSave: (t: Transaction) => void
}

const CATEGORIES: Record<TopLevelType, string[]> = {
  expense: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other'],
  income: ['Salary', 'Investment Income', 'Side Income', 'Other'],
  transfer: ['Account Transfer', 'Credit Card Payment'],
}

const SUBCATEGORIES: Record<string, string[]> = {
  'Food & Dining': ['Groceries', 'Restaurants', 'Coffee', 'Fast Food'],
  Transportation: ['Gas', 'Parking', 'Public Transit', 'Ride Share'],
  Entertainment: ['Streaming', 'Events', 'Games'],
  Shopping: ['Clothing', 'Electronics', 'Home', 'Amazon'],
  Health: ['Gym', 'Medical', 'Pharmacy'],
  Utilities: ['Electric', 'Internet', 'Water', 'Phone'],
  Salary: ['Primary Job', 'Bonus', 'Overtime'],
  'Investment Income': ['Dividends', 'Interest', 'Capital Gains'],
}

const TYPE_OPTIONS: { value: TopLevelType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
]

export default function TransactionEditModal({
  transaction,
  onClose,
  onSave,
}: TransactionEditModalProps) {
  const [type, setType] = useState<TopLevelType>(transaction.top_level_type)
  const [category, setCategory] = useState<string>('')
  const [subcategory, setSubcategory] = useState<string>('')
  const [notes, setNotes] = useState(transaction.notes || '')
  const [isRecurring, setIsRecurring] = useState(transaction.is_recurring)
  const [saving, setSaving] = useState(false)

  const categories = CATEGORIES[type] || []
  const subcategories = category ? (SUBCATEGORIES[category] || []) : []

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          top_level_type: type,
          category_id: category || null,
          subcategory_id: subcategory || null,
          notes: notes || null,
          is_recurring: isRecurring,
        }),
      })

      if (response.ok) {
        onSave({
          ...transaction,
          top_level_type: type,
          notes: notes || null,
          is_recurring: isRecurring,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit Transaction" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Transaction info */}
        <div
          style={{
            backgroundColor: 'var(--system-gray6)',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)' }}>
            {transaction.merchant_name || transaction.description}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginTop: '2px' }}>
            {transaction.date}
          </p>
        </div>

        {/* Type selector */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', marginBottom: '8px' }}>
            Type
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setType(value)
                  setCategory('')
                  setSubcategory('')
                }}
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
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>
              Subcategory
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
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
              <option value="">Select subcategory...</option>
              {subcategories.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--secondary-label)', display: 'block', marginBottom: '6px' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1px solid var(--system-gray4)',
              padding: '10px 12px',
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
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>Recurring</p>
            <p style={{ fontSize: '12px', color: 'var(--system-gray)' }}>Mark as a recurring transaction</p>
          </div>
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
              flexShrink: 0,
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

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  )
}
