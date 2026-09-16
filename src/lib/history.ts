import type { Split } from './split'

const CREATED_KEY = 'splitpay:history:created'
const PAID_KEY = 'splitpay:history:paid'

export interface CreatedHistoryEntry {
  split: Split
  deviceId: string | null
  createdAt: number
}

export interface PaidHistoryEntry {
  split: Split
  participantId: string
  txHash: string
  amountLuna: number
  deviceId: string | null
  paidAt: number
}

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // Storage unavailable (private browsing etc.) — history just won't persist.
  }
}

export function recordCreatedSplit(split: Split, deviceId: string | null): void {
  const list = readList<CreatedHistoryEntry>(CREATED_KEY)
  if (list.some((e) => e.split.id === split.id)) return
  list.unshift({ split, deviceId, createdAt: Date.now() })
  writeList(CREATED_KEY, list)
}

export function recordPaidSplit(entry: Omit<PaidHistoryEntry, 'paidAt'>): void {
  const list = readList<PaidHistoryEntry>(PAID_KEY)
  if (list.some((e) => e.split.id === entry.split.id && e.participantId === entry.participantId)) return
  list.unshift({ ...entry, paidAt: Date.now() })
  writeList(PAID_KEY, list)
}

export function getCreatedHistory(): CreatedHistoryEntry[] {
  return readList<CreatedHistoryEntry>(CREATED_KEY)
}

export function getPaidHistory(): PaidHistoryEntry[] {
  return readList<PaidHistoryEntry>(PAID_KEY)
}
