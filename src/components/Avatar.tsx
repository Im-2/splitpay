const PALETTE = ['#7c6adf', '#3f8f6b', '#4a4a4a', '#b3562f', '#3a6ea5', '#8a3f6b', '#5f7a3f']

function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '?'
  return (
    <span
      className="sp-avatar"
      style={{
        background: colorFor(name),
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
    >
      {initial}
    </span>
  )
}
