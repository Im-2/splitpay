import { nimToLuna } from './format'

export interface Participant {
  id: string
  name: string
}

export interface Split {
  id: string
  description: string
  totalLuna: number
  organizerAddress: string
  participants: Participant[]
  createdAt: number
}

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomId(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('')
}

export function shareLuna(split: Split): number {
  return Math.floor(split.totalLuna / split.participants.length)
}

export function memoFor(splitId: string, participantId: string): string {
  return `splitpay:${splitId}:${participantId}`
}

export function createSplit(input: {
  description: string
  totalNim: number
  organizerAddress: string
  participantNames: string[]
}): Split {
  return {
    id: randomId(8),
    description: input.description.trim(),
    totalLuna: nimToLuna(input.totalNim),
    organizerAddress: input.organizerAddress,
    participants: input.participantNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({ id: randomId(6), name })),
    createdAt: Date.now(),
  }
}

function toBase64Url(json: string): string {
  const base64 = btoa(unescape(encodeURIComponent(json)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return decodeURIComponent(escape(atob(padded)))
}

export function encodeSplit(split: Split): string {
  return toBase64Url(JSON.stringify(split))
}

export function decodeSplit(encoded: string): Split | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded))
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.id !== 'string' ||
      typeof parsed.totalLuna !== 'number' ||
      typeof parsed.organizerAddress !== 'string' ||
      !Array.isArray(parsed.participants)
    ) {
      return null
    }
    return parsed as Split
  } catch {
    return null
  }
}

export function splitUrl(split: Split): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('s', encodeSplit(split))
  return url.toString()
}
