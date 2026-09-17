import { HeaderBack } from '../components/PhoneScreen'
import { PrimaryButton } from '../components/atoms'

/**
 * This is the on-chain transaction preview shown before Nimiq Pay's own
 * native confirmation dialog fires for sendBasicTransactionWithData().
 * The fee shown here is illustrative — the real fee is whatever Nimiq
 * Pay resolves at send time (it auto-selects one, using 0 if possible).
 * Don't hardcode "0.01 NIM" as an actual fee in the real app.
 */
export function Screen5ReviewPayment() {
  return (
    <>
      <HeaderBack title="Review payment" />
      <div className="sp-body">
        <p className="sp-label">You're paying</p>
        <p className="sp-value-lg" style={{ textAlign: 'left', marginBottom: 2 }}>
          112.5 NIM
        </p>
        <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', margin: '0 0 16px' }}>≈ $18.42</p>

        <div className="sp-card">
          <p className="sp-label" style={{ marginBottom: 2 }}>
            To
          </p>
          <p style={{ fontSize: 13, margin: '0 0 10px' }}>you@nimiq (Organizer)</p>
          <p className="sp-label" style={{ marginBottom: 2 }}>
            For
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>Weekend trip</p>
        </div>

        <div className="sp-card">
          <div className="sp-row">
            <span className="sp-label" style={{ margin: 0 }}>
              From
            </span>
            <span style={{ fontSize: 13 }}>aria@nimiq</span>
          </div>
          <div className="sp-row">
            <span className="sp-label" style={{ margin: 0 }}>
              Balance
            </span>
            <span style={{ fontSize: 13 }}>200 NIM</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="sp-row">
          <span className="sp-label" style={{ margin: 0 }}>
            Network fee
          </span>
          <span style={{ fontSize: 13 }}>0.01 NIM</span>
        </div>
        <div className="sp-row">
          <span style={{ fontSize: 13, fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>112.51 NIM</span>
        </div>
      </div>
      <div className="sp-footer">
        <PrimaryButton>Approve Payment</PrimaryButton>
      </div>
    </>
  )
}
