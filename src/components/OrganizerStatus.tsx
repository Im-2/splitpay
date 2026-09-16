import { useCallback, useEffect, useState } from 'react'
import type { Split } from '../lib/split'
import { shareLuna, splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { fetchPaymentStatuses, type PaymentStatus } from '../lib/reconcile'
import { ErrorBanner } from './ErrorBanner'

const POLL_INTERVAL_MS = 20_000

export function OrganizerStatus({ split }: { split: Split }) {
  const [statuses, setStatuses] = useState<PaymentStatus[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const result = await fetchPaymentStatuses(split)
      setStatuses(result)
      setError(null)
    } catch {
      setError('Could not check payment status right now.')
    } finally {
      setRefreshing(false)
    }
  }, [split])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  const paidCount = statuses?.filter((s) => s.paid).length ?? 0
  const link = splitUrl(split)

  return (
    <div className="card">
      <h1>{split.description}</h1>
      <p className="muted">
        {formatNim(split.totalLuna)} total &middot; {formatNim(shareLuna(split))} per person
      </p>
      {statuses && (
        <p className="muted small">
          {paidCount} of {split.participants.length} paid
        </p>
      )}

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      <div className="status-list">
        {split.participants.map((p) => {
          const status = statuses?.find((s) => s.participantId === p.id)
          const paid = status?.paid ?? false
          return (
            <div className="status-row" key={p.id}>
              <span>{p.name}</span>
              <span className={paid ? 'badge paid' : 'badge unpaid'}>{paid ? 'Paid' : 'Unpaid'}</span>
            </div>
          )
        })}
      </div>

      <button onClick={refresh} disabled={refreshing}>
        {refreshing ? 'Checking...' : 'Refresh'}
      </button>

      <div className="link-box">
        <code>{link}</code>
      </div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(link).catch(() => {})
        }}
      >
        Copy share link
      </button>
    </div>
  )
}
