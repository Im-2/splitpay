import { useCallback, useEffect, useState } from 'react'
import type { Participant, Split } from '../lib/split'
import { shareLuna, splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { fetchPaymentStatuses, type PaymentStatus } from '../lib/reconcile'
import { Avatar } from './Avatar'
import { StatusBadge } from './StatusBadge'
import { ErrorBanner } from './ErrorBanner'
import { HeaderBack } from './Header'
import { IconCopy, IconKebab, IconShare } from './icons'

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
    <>
      <div className="sp-body" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 24 }}>
        <div className="sp-status-icon sp-status-icon-neutral">
          <IconShare />
        </div>
        <h1 className="sp-title-xl">Nudge {participant.name}</h1>
        <p className="sp-subtitle" style={{ marginBottom: 24 }}>
          {copied ? 'Link copied! ' : ''}Send this to {participant.name} to remind them to pay their share.
        </p>

        <div className="sp-card" style={{ width: '100%' }}>
          <div className="sp-row">
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <div className="sp-link-text">{link}</div>
              <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{participant.name}</div>
            </div>
            <button
              className="sp-icon-btn"
              aria-label="Copy reminder link"
              onClick={() => navigator.clipboard?.writeText(link).then(() => setCopied(true))}
            >
              <IconCopy />
            </button>
          </div>
        </div>
      </div>
      <div className="sp-footer">
        <button className="sp-btn sp-btn-primary" onClick={share}>
          Share via...
        </button>
        <button className="sp-btn sp-btn-secondary" onClick={onDone}>
          Done
        </button>
      </div>
    </>
  )
}

export function SplitStatus({
  split,
  isOrganizer,
  onBack,
}: {
  split: Split
  isOrganizer: boolean
  onBack: () => void
}) {
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
    const interval = setInterval(refresh, 20_000)
    return () => clearInterval(interval)
  }, [refresh])

  if (nudging) {
    return <NudgePanel split={split} participant={nudging} onDone={() => setNudging(null)} />
  }

  const shareLunaAmount = shareLuna(split)
  const paid = statuses?.filter((s) => s.paid) ?? []
  const pending = split.participants.filter((p) => !paid.some((s) => s.participantId === p.id))
  const paidTotal = paid.length * shareLunaAmount
  const pendingTotal = pending.length * shareLunaAmount
  const link = splitUrl(split)

  async function shareSplit() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SplitPay', text: `"${split.description}" split status`, url: link })
        return
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    navigator.clipboard?.writeText(link).catch(() => {})
  }

  return (
    <>
      <HeaderBack title="Split status" onBack={onBack} />
      <div className="sp-body">
        <div className="sp-card">
          <div className="sp-row">
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{split.description}</p>
              <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', margin: '2px 0 0' }}>
                {formatNim(split.totalLuna)} total &middot; {split.participants.length} people
              </p>
            </div>
            <button className="sp-icon-btn" aria-label="Share split" onClick={shareSplit}>
              <IconShare />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 10 }}>
            <ErrorBanner message={error} onRetry={refresh} />
          </div>
        )}

        <p className="sp-label" style={{ marginTop: 16 }}>
          Overview
        </p>
        <div className="sp-card">
          <div className="sp-row">
            <span style={{ fontSize: 13, color: 'var(--sp-success-text)' }}>Paid</span>
            <span style={{ fontSize: 13 }}>{formatNim(paidTotal)}</span>
          </div>
          <div className="sp-row">
            <span style={{ fontSize: 13, color: 'var(--sp-pending-text)' }}>Pending</span>
            <span style={{ fontSize: 13 }}>{formatNim(pendingTotal)}</span>
          </div>
        </div>

        <div className="sp-card" style={{ padding: 8, marginTop: 10 }}>
          {split.participants.map((p, i) => {
            const isPaid = paid.some((s) => s.participantId === p.id)
            return (
              <div
                key={p.id}
                className="sp-row"
                style={{
                  padding: '8px 6px',
                  borderBottom: i < split.participants.length - 1 ? '1px solid var(--sp-border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={p.name} />
                  <span style={{ fontSize: 13 }}>{p.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge paid={isPaid} />
                    <div style={{ fontSize: 11, color: 'var(--sp-text-muted)', marginTop: 2 }}>
                      {formatNim(shareLunaAmount)}
                    </div>
                  </div>
                  {isOrganizer && !isPaid && (
                    <button className="sp-icon-btn" aria-label={`Options for ${p.name}`} onClick={() => setNudging(p)}>
                      <IconKebab />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="sp-hint" style={{ marginTop: 10, textAlign: 'left' }}>
          {statuses ? `${paid.length} of ${split.participants.length} paid` : 'Checking payment status...'}
          {isOrganizer && pending.length > 0 ? ` — tap ⋮ to nudge someone.` : ''}
        </p>
      </div>
      <div className="sp-footer">
        <button onClick={refresh} className="sp-btn sp-btn-secondary" disabled={refreshing}>
          {refreshing ? 'Checking...' : 'Refresh'}
        </button>
      </div>
    </>
  )
}
