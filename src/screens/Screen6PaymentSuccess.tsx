import { HeaderLogo, IconCheck } from '../components/PhoneScreen'
import { Avatar, PrimaryButton, StatusBadge } from '../components/atoms'
import { initialFor, colorFor } from '../lib/avatarStyle'

export interface SuccessParticipant {
  id: string
  name: string
  paid: boolean
}

export function Screen6PaymentSuccess({
  amountLabel,
  description,
  participants,
  onViewStatus,
}: {
  amountLabel: string
  description: string
  participants: SuccessParticipant[]
  onViewStatus: () => void
}) {
  const paidCount = participants.filter((p) => p.paid).length

  return (
    <>
      <HeaderLogo />
      <div className="sp-body" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div className="sp-status-icon sp-status-icon-success">
          <IconCheck />
        </div>
        <h1 className="sp-title-xl">Payment successful</h1>
        <p className="sp-subtitle" style={{ marginBottom: 2 }}>
          You paid
        </p>
        <p className="sp-value-lg" style={{ marginBottom: 2 }}>
          {amountLabel}
        </p>
        <p className="sp-subtitle" style={{ marginBottom: 20 }}>
          {description}
        </p>

        <div className="sp-card" style={{ width: '100%', textAlign: 'left' }}>
          <div className="sp-row" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Split status</span>
            <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
              {paidCount} of {participants.length} paid
            </span>
          </div>
          {participants.map((p) => (
            <div key={p.id} className="sp-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initial={initialFor(p.name)} color={colorFor(p.name)} />
                <span style={{ fontSize: 13 }}>{p.name}</span>
              </div>
              <StatusBadge status={p.paid ? 'paid' : 'pending'} />
            </div>
          ))}
        </div>
      </div>
      <div className="sp-footer">
        <PrimaryButton onClick={onViewStatus}>View split status</PrimaryButton>
      </div>
    </>
  )
}
