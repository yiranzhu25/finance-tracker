interface BudgetProgressBarProps {
  spent: number
  budget: number
  className?: string
}

export default function BudgetProgressBar({ spent, budget, className = '' }: BudgetProgressBarProps) {
  const rawPct = budget > 0 ? (spent / budget) * 100 : 0
  const displayPct = Math.min(rawPct, 100)

  const color =
    rawPct > 100
      ? 'var(--system-red)'
      : rawPct > 80
      ? 'var(--system-orange)'
      : 'var(--system-green)'

  return (
    <div className={className}>
      <div
        style={{
          height: '8px',
          borderRadius: '4px',
          backgroundColor: 'var(--system-gray5)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${displayPct}%`,
            backgroundColor: color,
            borderRadius: '4px',
            transition: 'width 0.6s ease, background-color 0.3s',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--system-gray)' }}>
          {rawPct.toFixed(0)}%
          {rawPct > 100 && (
            <span style={{ color: 'var(--system-red)', fontWeight: '600' }}> over budget</span>
          )}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--system-gray)' }}>
          ${spent.toLocaleString()} / ${budget.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
