import { HeaderLogo, IconCheck, IconCopy } from '../components/PhoneScreen'
import { PrimaryButton, SecondaryButton } from '../components/atoms'

export function Screen3ShareLink({
  description,
  totalLabel,
  peopleCount,
  link,
  onCopy,
  copied,
  onShare,
}: {
  description: string
  totalLabel: string
  peopleCount: number
  link: string
  onCopy: () => void
  copied: boolean
  onShare: () => void
}) {
  return (
    <>
      <HeaderLogo />
      <div className="sp-body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="sp-status-icon sp-status-icon-success">
          <IconCheck />
        </div>
        <h1 className="sp-title-xl">Split created!</h1>
        <p className="sp-subtitle" style={{ marginBottom: 24 }}>
          {description}
          <br />
          {totalLabel} total &middot; {peopleCount} people
        </p>
        <div className="sp-card" style={{ width: '100%' }}>
          <p className="sp-label" style={{ marginBottom: 4 }}>
            Split link
          </p>
          <div className="sp-row">
            <span style={{ fontSize: 12, color: 'var(--sp-text-primary)', wordBreak: 'break-all', textAlign: 'left' }}>
              {link}
            </span>
            <button className="sp-icon-btn" aria-label="Copy split link" onClick={onCopy}>
              <IconCopy />
            </button>
          </div>
        </div>
        <p className="sp-hint" style={{ marginTop: 12 }}>
          Anyone with this link can pay their share.
        </p>
      </div>
      <div className="sp-footer">
        <PrimaryButton onClick={onCopy}>{copied ? 'Link copied!' : 'Copy split link'}</PrimaryButton>
        <SecondaryButton onClick={onShare}>Share link</SecondaryButton>
      </div>
    </>
  )
}
