import type { TransactionInfo } from '@nimiq/mini-app-sdk'
import { getNimiqProvider } from './nimiqProvider'
import { memoFor, shareLuna, type Split } from './split'

function hexToUtf8(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return new TextDecoder().decode(bytes)
}

export interface PaymentStatus {
  participantId: string
  paid: boolean
  txHash?: string
}

/**
 * Reconciles who has paid by scanning the organizer's incoming transactions
 * for memos of the form `splitpay:<splitId>:<participantId>` and matching
 * the expected per-participant share, in Luna, exactly.
 */
export async function fetchPaymentStatuses(split: Split): Promise<PaymentStatus[]> {
  const provider = await getNimiqProvider()
  const expectedLuna = shareLuna(split)
  const memoPrefix = memoFor(split.id, '')

  const transactions = await provider.request<TransactionInfo[]>({
    method: 'getTransactionsByAddress',
    params: [split.organizerAddress, 500, null],
  })

  const paidByParticipantId = new Map<string, string>()
  for (const tx of transactions) {
    if (tx.to !== split.organizerAddress || tx.value !== expectedLuna) continue
    if (!tx.recipientData) continue
    let memo: string
    try {
      memo = hexToUtf8(tx.recipientData)
    } catch {
      continue
    }
    if (!memo.startsWith(memoPrefix)) continue
    const participantId = memo.slice(memoPrefix.length)
    paidByParticipantId.set(participantId, tx.hash)
  }

  return split.participants.map((p) => ({
    participantId: p.id,
    paid: paidByParticipantId.has(p.id),
    txHash: paidByParticipantId.get(p.id),
  }))
}
