import './landing.css'
import heroBackground from './hero-background.png'

/**
 * SplitPay's welcome screen — the first thing shown when the mini app opens
 * fresh (no `?s=` split link). `onEnter` moves into the real app (create
 * split / history). Also built as its own static entry (landing.html) so
 * the same screen works as a plain shareable teaser URL outside Nimiq Pay.
 */
export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="lp-shell">
      <div className="lp-card" style={{ backgroundImage: `url(${heroBackground})` }}>
        <div className="lp-overlay" />

        <div className="lp-copy">
          <div className="lp-brand">
            <img src="/logo.svg" className="lp-brand-logo" alt="" />
            <div>
              <div className="lp-brand-name">SplitPay</div>
              <div className="lp-brand-tagline">Split. Pay. Simple.</div>
            </div>
          </div>

          <p className="lp-eyebrow">Split bills. Get paid back.</p>
          <h1 className="lp-headline">
            Splitting made
            <br />
            simple. Getting
            <br />
            paid back, <span className="lp-headline-muted">easy.</span>
          </h1>
          <p className="lp-subtext">
            Create a split, share the link, and get paid back instantly on Nimiq. No signups. No
            hassle. Just real payments.
          </p>

          <button className="lp-cta" onClick={onEnter}>
            Open SplitPay →
          </button>

          <div className="lp-pills">
            <span className="lp-pill">👥 Create Split</span>
            <span className="lp-pill">🔗 Share Link</span>
            <span className="lp-pill">⇄ Get Paid</span>
            <span className="lp-pill">📈 Track Status</span>
          </div>

          <div className="lp-footer-note">
            Secured by <span className="lp-nimiq-badge">◆ NIMIQ</span>{' '}
            <span className="lp-dot">|</span> Real on-chain payments.
          </div>
        </div>
      </div>
    </div>
  )
}
