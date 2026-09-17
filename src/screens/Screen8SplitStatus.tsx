import { HeaderBack, IconKebab, IconShare } from '../components/PhoneScreen'
import { Avatar, SecondaryButton, StatusBadge } from '../components/atoms'
import { ErrorBanner } from '../components/ErrorBanner'
import { initialFor, colorFor } from '../lib/avatarStyle'

export interface StatusParticipant {
  id: string
  name: string
  paid: boolean
  amountLabel: string
}

export function Screen8SplitStatus({
  onBack,
  description,
  totalLabel,
  participants,
  paidTotalLabel,
  pendingTotalLabel,
  onShare,
  isOrganizer,
  onNudge,
  hintText,
  error,
  onRefresh,
  refreshing,
}: {
  onBack: () => void
  description: string
  totalLabel: string
  participants: StatusParticipant[]
  paidTotalLabel: string
  pendingTotalLabel: string
  onShare: () => void
  isOrganizer: boolean
  onNudge: (participantId: string) => void
  hintText: string
  error: string | null
  onRefresh: () => void
  refreshing: boolean
}) {
  return (
    <>
      <HeaderBack title="Split status" onBack={onBack} />
      <div className="sp-body">
        <div className="sp-card">
          <div className="sp-row">
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{description}</p>
              <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', margin: '2px 0 0' }}>
                {totalLabel} total &middot; {participants.length} people
              </p>
            </div>
            <button className="sp-icon-btn" aria-label="Share split" onClick={onShare}>
              <IconShare />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 10 }}>
            <ErrorBanner message={error} onRetry={onRefresh} />
          </div>
        )}

        <p className="sp-label" style={{ marginTop: 16 }}>
          Overview
        </p>
        <div className="sp-card">
          <div className="sp-row">
            <span style={{ fontSize: 13, color: 'var(--sp-success-text)' }}>Paid</span>
            <span style={{ fontSize: 13 }}>{paidTotalLabel}</span>
          </div>
          <div className="sp-row">
            <span style={{ fontSize: 13, color: 'var(--sp-pending-text)' }}>Pending</span>
            <span style={{ fontSize: 13 }}>{pendingTotalLabel}</span>
          </div>
        </div>

        <div className="sp-card" style={{ padding: 8, marginTop: 10 }}>
          {participants.map((p, i) => (
            <div
              key={p.id}
              className="sp-row"
              style={{ padding: '8px 6px', borderBottom: i < participants.length - 1 ? '1px solid var(--sp-border)' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initial={initialFor(p.name)} color={colorFor(p.name)} />
                <div style={{ fontSize: 13 }}>{p.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={p.paid ? 'paid' : 'pending'} />
                  <div style={{ fontSize: 11, color: 'var(--sp-text-muted)', marginTop: 2 }}>{p.amountLabel}</div>
                </div>
                {isOrganizer && !p.paid && (
                  <button className="sp-icon-btn" aria-label={`Options for ${p.name}`} onClick={() => onNudge(p.id)}>
                    <IconKebab />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="sp-hint" style={{ marginTop: 10, textAlign: 'left' }}>
          {hintText}
        </p>
      </div>
      <div className="sp-footer">
        <SecondaryButton onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Checking...' : 'Refresh'}
        </SecondaryButton>
      </div>
    </>
  )
}
