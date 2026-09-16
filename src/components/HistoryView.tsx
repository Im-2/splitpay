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

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function CreatedRow({ entry }: { entry: CreatedHistoryEntry }) {
  const [summary, setSummary] = useState<string>('checking...')

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
    <button className="history-row" onClick={() => (window.location.href = splitUrl(entry.split))}>
      <span className="history-row-main">
        <strong>{entry.split.description}</strong>
        <span className="muted small">
          {formatDate(entry.createdAt)} &middot; {formatNim(entry.split.totalLuna)}
        </span>
      </span>
      <span className="muted small">{summary}</span>
    </button>
  )
}

function PaidRow({ entry }: { entry: PaidHistoryEntry }) {
  return (
    <button className="history-row" onClick={() => (window.location.href = splitUrl(entry.split))}>
      <span className="history-row-main">
        <strong>{entry.split.description}</strong>
        <span className="muted small">{formatDate(entry.paidAt)}</span>
      </span>
      <span className="muted small">{formatNim(entry.amountLuna)}</span>
    </button>
  )
}

export function HistoryView() {
  const [created] = useState(() => getCreatedHistory())
  const [paid] = useState(() => getPaidHistory())

  return (
    <div className="card">
      <h1>History</h1>
      <div>
        <h2>Splits you created</h2>
        {created.length === 0 ? (
          <p className="muted small">No splits created on this device yet.</p>
        ) : (
          <div className="history-list">
            {created.map((entry) => (
              <CreatedRow key={entry.split.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
      <div>
        <h2>Splits you've paid into</h2>
        {paid.length === 0 ? (
          <p className="muted small">No payments from this device yet.</p>
        ) : (
          <div className="history-list">
            {paid.map((entry) => (
              <PaidRow key={`${entry.split.id}:${entry.participantId}`} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
