const PALETTE = ['#7c6adf', '#3f8f6b', '#4a4a4a', '#b3562f', '#3a6ea5', '#8a3f6b', '#5f7a3f']

export function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function initialFor(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}
