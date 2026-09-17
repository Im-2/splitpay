import { HeaderBack, IconWallet } from '../components/PhoneScreen'
import { PrimaryButton } from '../components/atoms'
import { ErrorBanner } from '../components/ErrorBanner'

/**
 * "Your balance" comes from a separate blockchain RPC call keyed off the
 * address returned by listAccounts() — the Nimiq Mini App SDK has no
 * getBalance() method itself. See Screen7 for the insufficient-balance case.
 */
export function Screen4PayShare({
  onBack,
  description,
  shareLabel,
  balanceLabel,
  centerText,
  onPay,
  payLabel,
  payDisabled,
  errorMessage,
}: {
  onBack: () => void
  description: string
  shareLabel: string
  balanceLabel: string | null
  centerText: string
  onPay: () => void
  payLabel: string
  payDisabled: boolean
  errorMessage?: string | null
}) {
  return (
    <>
      <HeaderBack title="Pay your share" onBack={onBack} />
      <div className="sp-body">
        <div className="sp-card">
          <p className="sp-label" style={{ marginBottom: 2 }}>
            {description}
          </p>
          <p style={{ fontSize: 12, color: 'var(--sp-text-secondary)', margin: 0 }}>Requested by the organizer</p>

          <hr className="sp-divider" />

          <div className="sp-row">
            <span className="sp-label" style={{ margin: 0 }}>
              Your share
            </span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{shareLabel}</span>
          </div>
          {balanceLabel && (
            <div className="sp-row">
              <span className="sp-label" style={{ margin: 0 }}>
                Your balance
              </span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{balanceLabel}</span>
            </div>
          )}
        </div>

        {errorMessage ? (
          <div style={{ marginTop: 16 }}>
            <ErrorBanner message={errorMessage} onRetry={onPay} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="sp-subtitle">{centerText}</p>
          </div>
        )}
      </div>
      <div className="sp-footer">
        <PrimaryButton onClick={onPay} disabled={payDisabled}>
          <IconWallet /> {payLabel}
        </PrimaryButton>
        <p className="sp-hint">Secure payments with Nimiq Pay</p>
      </div>
    </>
  )
}
