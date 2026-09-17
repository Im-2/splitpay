import type { Split } from '../lib/split'
import { formatNim } from '../lib/format'
import { shareLuna } from '../lib/split'
import { Avatar } from './Avatar'
import { HeaderLogo } from './Header'

export function ParticipantPicker({
  split,
  onPick,
}: {
  split: Split
  onPick: (participantId: string) => void
}) {
  return (
    <>
      <HeaderLogo />
      <div className="sp-body">
        <h1 className="sp-title-xl" style={{ textAlign: 'left', marginTop: 8 }}>
          {split.description}
        </h1>
        <p className="sp-subtitle" style={{ textAlign: 'left', marginBottom: 20 }}>
          {formatNim(split.totalLuna)} total split {split.participants.length} ways &middot; each share is{' '}
          {formatNim(shareLuna(split))}
        </p>
        <p className="sp-label">Which one are you?</p>
        <div className="sp-card" style={{ padding: 8 }}>
          {split.participants.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className="sp-row"
              style={{
                width: '100%',
                padding: '10px 6px',
                background: 'none',
                border: 'none',
                borderBottom: i < split.participants.length - 1 ? '1px solid var(--sp-border)' : 'none',
                borderRadius: 0,
                cursor: 'pointer',
                justifyContent: 'flex-start',
              }}
            >
              <Avatar name={p.name} />
              <span style={{ fontSize: 14, color: 'var(--sp-text-primary)', fontWeight: 500 }}>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
