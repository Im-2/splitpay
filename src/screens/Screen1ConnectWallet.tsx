import { HeaderLogo, IconCopy, IconWallet } from '../components/PhoneScreen'
import { PrimaryButton, SecondaryButton } from '../components/atoms'

/**
 * This screen mirrors the moment SplitPay calls nimiq.listAccounts().
 * In the real app this native confirmation dialog is drawn by Nimiq Pay
 * itself, not by SplitPay's own code — this static version exists so the
 * surrounding layout (what's on screen before/after the prompt) is clear.
 * Claude Code: do not build a custom modal for this step in production;
 * the real dialog is provided by the host app when listAccounts() is called.
 */
export function Screen1ConnectWallet() {
  return (
    <>
      <HeaderLogo />
      <div className="sp-body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="sp-status-icon sp-status-icon-neutral">
          <IconWallet />
        </div>
        <h1 className="sp-title-xl">Connect with Nimiq Pay</h1>
        <p className="sp-subtitle" style={{ marginBottom: 28 }}>
          SplitPay would like to access your wallet address.
        </p>
        <div className="sp-card" style={{ width: '100%' }}>
          <p className="sp-label" style={{ marginBottom: 4 }}>
            Address
          </p>
          <div className="sp-row">
            <span style={{ fontSize: 13, color: 'var(--sp-text-primary)' }}>NQ12 34A8 ... 89CD EF56</span>
            <button className="sp-icon-btn" aria-label="Copy address">
              <IconCopy />
            </button>
          </div>
        </div>
      </div>
      <div className="sp-footer">
        <div className="sp-btn-row">
          <SecondaryButton>Cancel</SecondaryButton>
          <PrimaryButton>Approve</PrimaryButton>
        </div>
      </div>
    </>
  )
}
