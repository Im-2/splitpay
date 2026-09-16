import type { Split } from '../lib/split'
import { formatNim } from '../lib/format'
import { shareLuna } from '../lib/split'

export function ParticipantPicker({
  split,
  onPick,
}: {
  split: Split
  onPick: (participantId: string) => void
}) {
  return (
    <div className="card">
      <h1>{split.description}</h1>
      <p className="muted">
        Total {formatNim(split.totalLuna)} split {split.participants.length} ways &middot; each share is{' '}
        {formatNim(shareLuna(split))}
      </p>
      <p>Which one are you?</p>
      <div className="button-stack">
        {split.participants.map((p) => (
          <button key={p.id} className="pick-button" onClick={() => onPick(p.id)}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
