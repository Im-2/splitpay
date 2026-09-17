import { IconCopy, IconShare } from '../components/PhoneScreen'
import { PrimaryButton, SecondaryButton } from '../components/atoms'

/**
 * Reached by tapping a pending row's kebab menu on Screen8. This does NOT
 * send a push notification — the Mini App Framework has no notification
 * API. It copies a reminder link (with that participant's own payment
 * link) to the clipboard, or opens the native share sheet, so the
 * organizer sends it through whatever channel they already use.
 */
export function Screen9NudgeParticipant({
  participantName,
  link,
  copied,
  onShare,
  onCopy,
  onDone,
}: {
  participantName: string
  link: string
  copied: boolean
  onShare: () => void
  onCopy: () => void
  onDone: () => void
}) {
  return (
    <>
      <div className="sp-body" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 24 }}>
        <div className="sp-status-icon sp-status-icon-neutral">
          <IconShare />
        </div>
        <h1 className="sp-title-xl">Nudge {participantName}</h1>
        <p className="sp-subtitle" style={{ marginBottom: 24 }}>
          {copied ? 'Link copied! ' : ''}Send this to {participantName} to remind them to pay their share.
        </p>

        <div className="sp-card" style={{ width: '100%' }}>
          <div className="sp-row">
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--sp-text-primary)', wordBreak: 'break-all' }}>{link}</div>
              <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{participantName}</div>
            </div>
            <button className="sp-icon-btn" aria-label="Copy reminder link" onClick={onCopy}>
              <IconCopy />
            </button>
          </div>
        </div>
      </div>
      <div className="sp-footer">
        <PrimaryButton onClick={onShare}>Share via...</PrimaryButton>
        <SecondaryButton onClick={onDone}>Done</SecondaryButton>
      </div>
    </>
  )
}
