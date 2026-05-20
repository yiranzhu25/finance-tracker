'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Edit2, GripVertical, Download } from 'lucide-react'

type Tab = 'categories' | 'budgets' | 'recurring' | 'account' | 'export'

const TABS: { key: Tab; label: string }[] = [
  { key: 'categories', label: 'Categories' },
  { key: 'budgets', label: 'Budgets' },
  { key: 'recurring', label: 'Recurring Rules' },
  { key: 'account', label: 'Account' },
  { key: 'export', label: 'Export' },
]

const MOCK_CATEGORIES = {
  expense: [
    { id: 'e1', name: 'Food & Dining', subcategories: ['Groceries', 'Restaurants', 'Coffee'] },
    { id: 'e2', name: 'Transportation', subcategories: ['Gas', 'Parking', 'Transit'] },
    { id: 'e3', name: 'Entertainment', subcategories: ['Streaming', 'Events'] },
    { id: 'e4', name: 'Shopping', subcategories: ['Clothing', 'Electronics', 'Home'] },
    { id: 'e5', name: 'Health', subcategories: ['Gym', 'Medical', 'Pharmacy'] },
    { id: 'e6', name: 'Utilities', subcategories: ['Electric', 'Internet', 'Water'] },
  ],
  income: [
    { id: 'i1', name: 'Salary', subcategories: ['Primary Job', 'Bonus'] },
    { id: 'i2', name: 'Investment Income', subcategories: ['Dividends', 'Interest'] },
    { id: 'i3', name: 'Side Income', subcategories: [] },
  ],
  transfer: [
    { id: 't1', name: 'Account Transfer', subcategories: [] },
    { id: 't2', name: 'Credit Card Payment', subcategories: [] },
  ],
}

const MOCK_BUDGETS = [
  { category: 'Food & Dining', amount: 1000, frequency: 'monthly' },
  { category: 'Transportation', amount: 300, frequency: 'monthly' },
  { category: 'Entertainment', amount: 200, frequency: 'monthly' },
  { category: 'Shopping', amount: 500, frequency: 'monthly' },
  { category: 'Health', amount: 200, frequency: 'monthly' },
  { category: 'Utilities', amount: 250, frequency: 'monthly' },
  { category: 'Travel', amount: 3000, frequency: 'yearly' },
]

const MOCK_RECURRING = [
  { id: '1', name: 'Netflix', amount: 12.99, frequency: 'monthly', category: 'Entertainment', active: true },
  { id: '2', name: 'Spotify', amount: 9.99, frequency: 'monthly', category: 'Entertainment', active: true },
  { id: '3', name: 'Gym Membership', amount: 49, frequency: 'monthly', category: 'Health', active: true },
  { id: '4', name: 'Annual Amazon Prime', amount: 139, frequency: 'yearly', category: 'Shopping', active: true },
  { id: '5', name: 'Car Insurance', amount: 180, frequency: 'monthly', category: 'Transportation', active: false },
]

function CategoriesTab() {
  const types = ['expense', 'income', 'transfer'] as const
  const typeLabels = { expense: 'Expense', income: 'Income', transfer: 'Transfer' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {types.map((type) => (
        <div key={type}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)' }}>
              {typeLabels[type]}
            </h3>
            <Button variant="ghost" size="sm" icon={<Plus size={13} />}>Add</Button>
          </div>
          <Card>
            {MOCK_CATEGORIES[type].map((cat, idx) => (
              <div key={cat.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--system-gray6)',
                  }}
                >
                  <GripVertical size={14} color="var(--system-gray4)" style={{ cursor: 'grab' }} />
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>
                    {cat.name}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-blue)', padding: '4px' }}>
                      <Edit2 size={13} />
                    </button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-red)', padding: '4px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 0 8px 28px',
                      borderBottom: '1px solid var(--system-gray6)',
                      backgroundColor: 'var(--system-gray6)',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--secondary-label)' }}>{sub}</span>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-red)', padding: '4px' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {cat.subcategories.length > 0 && (
                  <div style={{ padding: '6px 0 6px 28px', borderBottom: '1px solid var(--system-gray6)' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-blue)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Plus size={11} /> Add subcategory
                    </button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}

function BudgetsTab() {
  const [budgets, setBudgets] = useState(MOCK_BUDGETS)

  return (
    <Card>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 160px 120px',
          gap: '12px',
          padding: '0 0 10px',
          borderBottom: '1px solid var(--system-gray5)',
          marginBottom: '4px',
        }}
      >
        {['Category', 'Amount', 'Frequency'].map((h) => (
          <span key={h} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--system-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {h}
          </span>
        ))}
      </div>
      {budgets.map((b, idx) => (
        <div
          key={b.category}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 120px',
            gap: '12px',
            padding: '10px 0',
            borderBottom: idx < budgets.length - 1 ? '1px solid var(--system-gray6)' : 'none',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--label)' }}>{b.category}</span>
          <input
            type="number"
            value={b.amount}
            onChange={(e) =>
              setBudgets((prev) =>
                prev.map((x) => x.category === b.category ? { ...x, amount: parseFloat(e.target.value) || 0 } : x)
              )
            }
            style={{
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--system-gray4)',
              padding: '0 10px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'var(--system-background)',
              color: 'var(--label)',
            }}
          />
          <select
            value={b.frequency}
            onChange={(e) =>
              setBudgets((prev) =>
                prev.map((x) => x.category === b.category ? { ...x, frequency: e.target.value } : x)
              )
            }
            style={{
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--system-gray4)',
              padding: '0 8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'var(--system-background)',
              color: 'var(--label)',
            }}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      ))}
      <div style={{ paddingTop: '12px' }}>
        <Button variant="ghost" size="sm" icon={<Plus size={13} />}>Add Budget</Button>
      </div>
    </Card>
  )
}

function RecurringTab() {
  const [rules, setRules] = useState(MOCK_RECURRING)

  function toggleActive(id: string) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  return (
    <Card>
      {rules.map((r, idx) => (
        <div
          key={r.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
            borderBottom: idx < rules.length - 1 ? '1px solid var(--system-gray6)' : 'none',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: r.active ? 'var(--label)' : 'var(--system-gray)' }}>
              {r.name}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '2px' }}>
              {r.category} · {r.frequency}
            </p>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--label)', minWidth: '70px', textAlign: 'right' }}>
            {formatCurrency(r.amount)}
          </span>
          <button
            onClick={() => toggleActive(r.id)}
            style={{
              width: '44px',
              height: '26px',
              borderRadius: '13px',
              border: 'none',
              backgroundColor: r.active ? 'var(--system-green)' : 'var(--system-gray4)',
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
                left: r.active ? '21px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
          <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--system-red)', padding: '4px', flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <div style={{ paddingTop: '12px' }}>
        <Button variant="ghost" size="sm" icon={<Plus size={13} />}>Add Rule</Button>
      </div>
    </Card>
  )
}

function AccountTab() {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginBottom: '4px' }}>Email</p>
          <p style={{ fontSize: '15px', color: 'var(--label)' }}>yiran.jour@gmail.com</p>
        </div>
        <div>
          <Button variant="secondary" size="md">Change Password</Button>
        </div>
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--system-gray5)' }}>
          <Button variant="danger" size="md">Delete Account</Button>
        </div>
      </div>
    </Card>
  )
}

function ExportTab() {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)', marginBottom: '4px' }}>
            Export Transactions
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--system-gray)', marginBottom: '12px' }}>
            Download all your transactions as a CSV file.
          </p>
          <Button variant="primary" size="md" icon={<Download size={14} />}>
            Export Transactions CSV
          </Button>
        </div>
        <div style={{ borderTop: '1px solid var(--system-gray5)', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--label)', marginBottom: '4px' }}>
            Export Net Worth History
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--system-gray)', marginBottom: '12px' }}>
            Download portfolio snapshots as CSV.
          </p>
          <Button variant="secondary" size="md" icon={<Download size={14} />}>
            Export Portfolio CSV
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('categories')

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--label)', letterSpacing: '-0.02em', marginBottom: '20px' }}>
        Settings
      </h1>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          backgroundColor: 'var(--system-gray6)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '24px',
          width: 'fit-content',
        }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === key ? '600' : '400',
              backgroundColor: activeTab === key ? 'var(--system-background)' : 'transparent',
              color: activeTab === key ? 'var(--label)' : 'var(--system-gray)',
              cursor: 'pointer',
              boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'budgets' && <BudgetsTab />}
      {activeTab === 'recurring' && <RecurringTab />}
      {activeTab === 'account' && <AccountTab />}
      {activeTab === 'export' && <ExportTab />}
    </div>
  )
}
