const PALETTE = ['#f3c332', '#6bd394', '#7aa2f7', '#f6a3a8', '#c792ea', '#4fd1c5', '#f0975a']

function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        background: colorFor(name),
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initialsFor(name)}
    </span>
  )
}
