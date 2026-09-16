export const LUNA_PER_NIM = 100_000

export function nimToLuna(nim: number): number {
  return Math.round(nim * LUNA_PER_NIM)
}

export function lunaToNim(luna: number): number {
  return luna / LUNA_PER_NIM
}

export function formatNim(luna: number): string {
  const nim = lunaToNim(luna)
  return `${nim.toLocaleString(undefined, { maximumFractionDigits: 5 })} NIM`
}

export function shortAddress(address: string): string {
  const parts = address.split(' ')
  if (parts.length <= 2) return address
  return `${parts[0]} ... ${parts[parts.length - 1]}`
}
