import { useCallback, useEffect, useState } from 'react'
import type { Participant, Split } from '../lib/split'
import { shareLuna, splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { fetchPaymentStatuses, type PaymentStatus } from '../lib/reconcile'
import { Avatar } from './Avatar'
import { ErrorBanner } from './ErrorBanner'

const POLL_INTERVAL_MS = 20_000

function nudgeLink(split: Split, participantId: string): string {
  const url = new URL(splitUrl(split))
  url.searchParams.set('p', participantId)
  return url.toString()
}

function NudgePanel({ split, participant, onDone }: { split: Split; participant: Participant; onDone: () => void }) {
  const link = nudgeLink(split, participant.id)
  const [copied, setCopied] = useState(false)

  async function share() {
    const shareData = { title: 'SplitPay', text: `Your share of "${split.description}" is ready to pay.`, url: link }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled the share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      // clipboard unavailable — link is still visible below to copy manually
    }
  }

  return (
    <div className="card theme-light">
      <div className="success-box">
        <span className="status-icon neutral">&#8594;</span>
        <h1>Nudge {participant.name}</h1>
        <p className="muted small">Send this link to remind them to pay their share.</p>
      </div>
      <div className="link-box">
        <code>{link}</code>
      </div>
      <div className="button-row">
        <button className="primary" onClick={share}>
          {copied ? 'Link copied!' : 'Share via...'}
        </button>
      </div>
      <button className="outline" onClick={onDone}>
        Done
      </button>
    </div>
  )
}

export function SplitStatus({ split, isOrganizer }: { split: Split; isOrganizer: boolean }) {
  const [statuses, setStatuses] = useState<PaymentStatus[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [nudging, setNudging] = useState<Participant | null>(null)

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

  if (nudging) {
    return <NudgePanel split={split} participant={nudging} onDone={() => setNudging(null)} />
  }

  const paidCount = statuses?.filter((s) => s.paid).length ?? 0
  const link = splitUrl(split)

  return (
    <div className="card theme-light">
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
              <span className="status-row-main">
                <Avatar name={p.name} size={32} />
                <span>{p.name}</span>
              </span>
              <span className="status-row-right">
                <span className={paid ? 'badge paid' : 'badge unpaid'}>{paid ? 'Paid' : 'Pending'}</span>
                {isOrganizer && !paid && (
                  <button className="nudge-link" title={`Nudge ${p.name}`} onClick={() => setNudging(p)}>
                    &#8599;
                  </button>
                )}
              </span>
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
