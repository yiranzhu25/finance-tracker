import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import {
  formatCurrency,
  formatDate,
  daysElapsedInMonth,
  daysInMonth,
  projectAmount,
} from '@/lib/utils'

// Mock data for demo / when DB is empty
const MOCK_BUDGETS = [
  { category: 'Food & Dining', spent: 840, budget: 1000, color: '#FF9500' },
  { category: 'Transportation', spent: 320, budget: 300, color: '#FF3B30' },
  { category: 'Entertainment', spent: 180, budget: 200, color: '#34C759' },
  { category: 'Shopping', spent: 650, budget: 500, color: '#FF3B30' },
  { category: 'Health', spent: 120, budget: 200, color: '#34C759' },
  { category: 'Utilities', spent: 210, budget: 250, color: '#34C759' },
]

const MOCK_SUMMARY = {
  income: 8500,
  expenses: 3920,
  net: 4580,
}

const MOCK_QUICK_STATS = {
  netWorth: 142850,
  investments: 98400,
}

function BudgetBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = Math.min((spent / budget) * 100, 100)
  const color =
    pct > 100 ? 'var(--system-red)' : pct > 80 ? 'var(--system-orange)' : 'var(--system-green)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          backgroundColor: 'var(--system-gray5)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: '3px',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <p style={{ fontSize: '11px', color: 'var(--system-gray)' }}>
        {pct.toFixed(0)}% used
      </p>
    </div>
  )
}

export default async function DashboardPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const elapsed = daysElapsedInMonth()
  const total = daysInMonth(year, month)
  const daysRemaining = total - elapsed

  let income = MOCK_SUMMARY.income
  let expenses = MOCK_SUMMARY.expenses

  if (!isDemoMode) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, top_level_type')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)

      if (txns && txns.length > 0) {
        const rows = txns as { amount: number; top_level_type: string }[]
        income = rows
          .filter((t) => t.top_level_type === 'income')
          .reduce((s, t) => s + t.amount, 0)
        expenses = rows
          .filter((t) => t.top_level_type === 'expense')
          .reduce((s, t) => s + t.amount, 0)
      }
    }
  }

  const net = income - expenses
  const projectedExpenses = projectAmount(expenses, elapsed, total)

  // Worst budget performer
  const worstBudget = [...MOCK_BUDGETS].sort(
    (a, b) => b.spent / b.budget - a.spent / a.budget
  )[0]

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--label)',
            letterSpacing: '-0.02em',
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--system-gray)', marginTop: '2px' }}>
          {formatDate(now)}
        </p>
      </div>

      {/* Month summary bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {/* Income */}
        <Card>
          <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Income
          </p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--system-green)' }}>
            {formatCurrency(income)}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '4px' }}>
            {monthName}
          </p>
        </Card>

        {/* Expenses */}
        <Card>
          <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Expenses
          </p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--system-red)' }}>
            {formatCurrency(expenses)}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '4px' }}>
            Projected: {formatCurrency(projectedExpenses)}
          </p>
        </Card>

        {/* Net Cash Flow */}
        <Card>
          <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Net Cash Flow
          </p>
          <p
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: net >= 0 ? 'var(--system-green)' : 'var(--system-red)',
            }}
          >
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginTop: '4px' }}>
            {daysRemaining} days remaining
          </p>
        </Card>
      </div>

      {/* Top Overspend Alert */}
      {worstBudget.spent > worstBudget.budget * 0.8 && (
        <div
          style={{
            backgroundColor: worstBudget.spent > worstBudget.budget
              ? 'rgba(255, 59, 48, 0.06)'
              : 'rgba(255, 149, 0, 0.06)',
            borderRadius: '12px',
            border: `1px solid ${worstBudget.spent > worstBudget.budget ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 149, 0, 0.2)'}`,
            padding: '14px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: worstBudget.spent > worstBudget.budget ? 'var(--system-red)' : 'var(--system-orange)',
              }}
            >
              {worstBudget.spent > worstBudget.budget ? 'Over budget' : 'Approaching limit'}: {worstBudget.category}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginTop: '2px' }}>
              Spent {formatCurrency(worstBudget.spent)} of {formatCurrency(worstBudget.budget)} budget
            </p>
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: worstBudget.spent > worstBudget.budget ? 'var(--system-red)' : 'var(--system-orange)',
            }}
          >
            {((worstBudget.spent / worstBudget.budget) * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Budget Performance */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: '600',
            color: 'var(--label)',
            marginBottom: '12px',
          }}
        >
          Budget Performance
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {MOCK_BUDGETS.map((b) => {
            const pct = b.spent / b.budget
            const variance = b.budget - b.spent
            return (
              <Card key={b.category}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--label)' }}>
                      {b.category}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginTop: '2px' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.budget)}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: variance < 0 ? 'var(--system-red)' : 'var(--system-green)',
                    }}
                  >
                    {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                  </span>
                </div>
                <BudgetBar spent={b.spent} budget={b.budget} />
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: '600',
            color: 'var(--label)',
            marginBottom: '12px',
          }}
        >
          Quick Stats
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <Card>
            <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Worth
            </p>
            <p style={{ fontSize: '26px', fontWeight: '700', color: 'var(--label)' }}>
              {formatCurrency(MOCK_QUICK_STATS.netWorth)}
            </p>
          </Card>
          <Card>
            <p style={{ fontSize: '12px', color: 'var(--system-gray)', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Investments
            </p>
            <p style={{ fontSize: '26px', fontWeight: '700', color: 'var(--system-indigo)' }}>
              {formatCurrency(MOCK_QUICK_STATS.investments)}
            </p>
          </Card>
        </div>
      </div>

      {/* Cash Flow Snapshot */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: '600',
            color: 'var(--label)',
            marginBottom: '12px',
          }}
        >
          Cash Flow Snapshot
        </h2>
        <Card>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
            {/* Income bar */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginBottom: '6px' }}>
                Income
              </p>
              <div
                style={{
                  height: '80px',
                  backgroundColor: 'var(--system-gray6)',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--system-green)',
                    height: `${Math.min(100, (income / Math.max(income, expenses)) * 100)}%`,
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.6s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--system-green)', marginTop: '6px' }}>
                {formatCurrency(income)}
              </p>
            </div>

            {/* Expenses bar */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginBottom: '6px' }}>
                Expenses
              </p>
              <div
                style={{
                  height: '80px',
                  backgroundColor: 'var(--system-gray6)',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--system-red)',
                    height: `${Math.min(100, (expenses / Math.max(income, expenses)) * 100)}%`,
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.6s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--system-red)', marginTop: '6px' }}>
                {formatCurrency(expenses)}
              </p>
            </div>

            {/* Net */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--system-gray)', marginBottom: '6px' }}>
                Net
              </p>
              <div
                style={{
                  height: '80px',
                  backgroundColor: 'var(--system-gray6)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: net >= 0 ? 'var(--system-green)' : 'var(--system-red)',
                  }}
                >
                  {net >= 0 ? '+' : ''}{formatCurrency(net)}
                </p>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: net >= 0 ? 'var(--system-green)' : 'var(--system-red)',
                  marginTop: '6px',
                }}
              >
                {net >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
