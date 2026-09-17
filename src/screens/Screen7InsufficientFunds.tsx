import { HeaderLogo, IconAlert } from '../components/PhoneScreen'
import { PrimaryButton } from '../components/atoms'

/**
 * The proactive warning from the balance-check feature — shown BEFORE the
 * participant attempts to pay, not as a caught error after a failed
 * sendBasicTransaction call. "Got it" dismisses this once; it never blocks
 * the pay screen behind it, since a stale balance read shouldn't stop a
 * real payment attempt.
 */
export function Screen7InsufficientFunds({
  neededLabel,
  balanceLabel,
  onDismiss,
}: {
  neededLabel: string
  balanceLabel: string
  onDismiss: () => void
}) {
  return (
    <>
      <HeaderLogo />
      <div className="sp-body" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div className="sp-status-icon sp-status-icon-danger">
          <IconAlert />
        </div>
        <h1 className="sp-title-xl">Insufficient balance</h1>
        <p className="sp-subtitle" style={{ marginBottom: 20 }}>
          You need
        </p>
        <p className="sp-value-lg" style={{ marginBottom: 2 }}>
          {neededLabel}
        </p>
        <p className="sp-subtitle" style={{ marginBottom: 20 }}>
          to join this split
        </p>

        <div className="sp-card" style={{ width: '100%', marginBottom: 12 }}>
          <p className="sp-label" style={{ marginBottom: 2 }}>
            Your balance
          </p>
          <p style={{ fontSize: 20, fontWeight: 500, color: 'var(--sp-danger-text)', margin: 0 }}>{balanceLabel}</p>
        </div>

        <div
          className="sp-card"
          style={{ width: '100%', background: 'var(--sp-danger-bg)', border: 'none', textAlign: 'left' }}
        >
          <p style={{ fontSize: 13, color: 'var(--sp-danger-text)', margin: 0, lineHeight: 1.5 }}>
            Not enough NIM to cover this payment. Please top up your wallet and try again.
          </p>
        </div>
      </div>
      <div className="sp-footer">
        <PrimaryButton onClick={onDismiss}>Got it</PrimaryButton>
      </div>
    </>
  )
}
