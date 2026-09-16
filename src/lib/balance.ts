import { getNimiqProvider } from './nimiqProvider'

interface AccountResult {
  address: string
  balance: number
  type: string
}

/**
 * Reads an address's current balance (in Luna) straight from the chain via
 * public RPC. This is a read-only lookup separate from wallet actions, so a
 * failure here must never block the payment flow — callers should treat a
 * thrown error as "balance unknown" and just hide the balance line.
 */
export async function fetchBalanceLuna(address: string): Promise<number> {
  const provider = await getNimiqProvider()
  const account = await provider.request<AccountResult>({
    method: 'getAccountByAddress',
    params: [address],
  })
  return account.balance
}
