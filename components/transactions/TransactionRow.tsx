import Badge from '@/components/ui/Badge'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import type { Transaction } from '@/types/database'

interface TransactionRowProps {
  transaction: Transaction
  onEdit: (t: Transaction) => void
}

export default function TransactionRow({ transaction: t, onEdit }: TransactionRowProps) {
  return (
    <div
      onClick={() => onEdit(t)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
        borderBottom: '1px solid var(--system-gray6)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--system-gray6)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
      }}
    >
      {/* Date */}
      <span
        style={{
          fontSize: '13px',
          color: 'var(--system-gray)',
          minWidth: '52px',
          flexShrink: 0,
        }}
      >
        {formatShortDate(t.date)}
      </span>

      {/* Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--label)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {t.merchant_name || t.description}
        </p>
        {t.merchant_name && t.merchant_name !== t.description && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--system-gray)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t.description}
          </p>
        )}
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <Badge variant={t.top_level_type as 'expense' | 'income' | 'transfer'}>
          {t.top_level_type}
        </Badge>
        {t.is_recurring && <Badge variant="recurring">Recurring</Badge>}
        {t.pending && <Badge variant="pending">Pending</Badge>}
        {t.transfer_pair_id && <Badge variant="transfer">Transfer</Badge>}
      </div>

      {/* Amount */}
      <span
        style={{
          fontSize: '15px',
          fontWeight: '600',
          color:
            t.top_level_type === 'income'
              ? 'var(--system-green)'
              : t.top_level_type === 'expense'
              ? 'var(--system-red)'
              : 'var(--system-gray)',
          minWidth: '90px',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {t.top_level_type === 'expense' ? '-' : t.top_level_type === 'income' ? '+' : ''}
        {formatCurrency(t.amount)}
      </span>
    </div>
  )
}
