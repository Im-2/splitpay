import { HeaderBack, IconClose } from '../components/PhoneScreen'
import { Avatar, BottomNav, PrimaryButton } from '../components/atoms'
import { ErrorBanner } from '../components/ErrorBanner'
import { initialFor, colorFor } from '../lib/avatarStyle'

/**
 * Screen 2: organizer builds the split — title, total, participants.
 * NOTE: the reference showed "Add people" with @nimiq-style handles, but
 * that was not confirmed against the actual Nimiq Mini App Framework docs
 * (no handle/username lookup API exists there, only raw wallet addresses),
 * so this uses plain typed display names with no lookup — access happens
 * purely through the shared split link.
 */
export function Screen2CreateSplit({
  onBack,
  onNavigateHome,
  onNavigateHistory,
  description,
  onDescriptionChange,
  totalNim,
  onTotalNimChange,
  names,
  onNameChange,
  onAddName,
  onRemoveName,
  eachPays,
  peopleCount,
  onCreate,
  canSubmit,
  busy,
  error,
}: {
  onBack: () => void
  onNavigateHome: () => void
  onNavigateHistory: () => void
  description: string
  onDescriptionChange: (value: string) => void
  totalNim: string
  onTotalNimChange: (value: string) => void
  names: string[]
  onNameChange: (index: number, value: string) => void
  onAddName: () => void
  onRemoveName: (index: number) => void
  eachPays: string
  peopleCount: number
  onCreate: () => void
  canSubmit: boolean
  busy: boolean
  error?: string | null
}) {
  return (
    <>
      <HeaderBack title="New split" onBack={onBack} />
      <div className="sp-body">
        <p className="sp-label">Split title</p>
        <input
          className="sp-input"
          placeholder="Weekend trip"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />

        <p className="sp-label" style={{ marginTop: 16 }}>
          Total amount
        </p>
        <div className="sp-input-suffix">
          <input
            className="sp-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={totalNim}
            onChange={(e) => onTotalNimChange(e.target.value)}
          />
          <span>NIM</span>
        </div>

        <p className="sp-label" style={{ marginTop: 16 }}>
          Add people
        </p>
        <div className="sp-card" style={{ padding: 8 }}>
          {names.map((name, i) => (
            <div
              key={i}
              className="sp-row"
              style={{ padding: '8px 6px', borderBottom: i < names.length - 1 ? '1px solid var(--sp-border)' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <Avatar initial={initialFor(name || `P${i + 1}`)} color={colorFor(name || `person-${i}`)} />
                <input
                  value={name}
                  onChange={(e) => onNameChange(i, e.target.value)}
                  placeholder={`Person ${i + 1}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'none',
                    fontFamily: 'var(--sp-font)',
                    fontSize: 13,
                    color: 'var(--sp-text-primary)',
                  }}
                />
              </div>
              {names.length > 1 && (
                <button className="sp-icon-btn" aria-label={`Remove person ${i + 1}`} onClick={() => onRemoveName(i)}>
                  <IconClose />
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="sp-btn sp-btn-secondary" style={{ marginTop: 10, fontSize: 13 }} onClick={onAddName}>
          + Add another
        </button>

        {error && (
          <div style={{ marginTop: 16 }}>
            <ErrorBanner message={error} onRetry={onCreate} />
          </div>
        )}
      </div>
      <div className="sp-footer">
        <div className="sp-card" style={{ background: 'var(--sp-card-bg-raised)' }}>
          <div className="sp-row">
            <span className="sp-label" style={{ margin: 0 }}>
              Each pays
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{eachPays}</div>
              <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{peopleCount} people</div>
            </div>
          </div>
        </div>
        <PrimaryButton onClick={onCreate} disabled={!canSubmit}>
          {busy ? 'Connecting to Nimiq Pay...' : 'Create split'}
        </PrimaryButton>
      </div>
      <BottomNav active="home" onHome={onNavigateHome} onHistory={onNavigateHistory} />
    </>
  )
}
