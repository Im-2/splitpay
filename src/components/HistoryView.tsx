import { useEffect, useState } from 'react'
import {
  getCreatedHistory,
  getPaidHistory,
  type CreatedHistoryEntry,
  type PaidHistoryEntry,
} from '../lib/history'
import { splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { fetchPaymentStatuses } from '../lib/reconcile'
import { HeaderBack, IconChevronRight } from './PhoneScreen'

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function Row({
  title,
  subtitle,
  right,
  onClick,
  isLast,
}: {
  title: string
  subtitle: string
  right: string
  onClick: () => void
  isLast: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="sp-row"
      style={{
        width: '100%',
        padding: '8px 6px',
        background: 'none',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--sp-border)',
        borderRadius: 0,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--sp-text-muted)', marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)' }}>{right}</span>
        <IconChevronRight />
      </div>
    </button>
  )
}

function CreatedRow({ entry, isLast }: { entry: CreatedHistoryEntry; isLast: boolean }) {
  const [summary, setSummary] = useState('checking...')

  useEffect(() => {
    let cancelled = false
    fetchPaymentStatuses(entry.split)
      .then((statuses) => {
        if (cancelled) return
        const paid = statuses.filter((s) => s.paid).length
        setSummary(`${paid}/${entry.split.participants.length} paid`)
      })
      .catch(() => {
        if (!cancelled) setSummary('status unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [entry.split])

  return (
    <Row
      title={entry.split.description}
      subtitle={`${formatDate(entry.createdAt)} · ${formatNim(entry.split.totalLuna)}`}
      right={summary}
      isLast={isLast}
      onClick={() => (window.location.href = splitUrl(entry.split))}
    />
  )
}

function PaidRow({ entry, isLast }: { entry: PaidHistoryEntry; isLast: boolean }) {
  return (
    <Row
      title={entry.split.description}
      subtitle={formatDate(entry.paidAt)}
      right={formatNim(entry.amountLuna)}
      isLast={isLast}
      onClick={() => (window.location.href = splitUrl(entry.split))}
    />
  )
}

export function HistoryView({ onBack }: { onBack: () => void }) {
  const [created] = useState(() => getCreatedHistory())
  const [paid] = useState(() => getPaidHistory())

  return (
    <>
      <HeaderBack title="History" onBack={onBack} />
      <div className="sp-body">
        <p className="sp-label">Splits you created</p>
        {created.length === 0 ? (
          <p className="sp-subtitle" style={{ textAlign: 'left', marginBottom: 16 }}>
            No splits created on this device yet.
          </p>
        ) : (
          <div className="sp-card" style={{ padding: 8, marginBottom: 16 }}>
            {created.map((entry, i) => (
              <CreatedRow key={entry.split.id} entry={entry} isLast={i === created.length - 1} />
            ))}
          </div>
        )}

        <p className="sp-label">Splits you've paid into</p>
        {paid.length === 0 ? (
          <p className="sp-subtitle" style={{ textAlign: 'left' }}>
            No payments from this device yet.
          </p>
        ) : (
          <div className="sp-card" style={{ padding: 8 }}>
            {paid.map((entry, i) => (
              <PaidRow key={`${entry.split.id}:${entry.participantId}`} entry={entry} isLast={i === paid.length - 1} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
