import { init, type NimiqProvider } from '@nimiq/mini-app-sdk'
import type { ErrorResponse } from '@nimiq/mini-app-sdk'

export const NIMIQ_NETWORK = (import.meta.env.VITE_NIMIQ_NETWORK === 'main' ? 'main' : 'test') as
  | 'main'
  | 'test'

// Public open RPC servers, see https://nimiq.dev/rpc/open-servers
// Used only for read-only reconciliation/balance queries; wallet actions
// (listAccounts, sendBasicTransactionWithData, ...) always go through the
// Nimiq Pay host via the SDK, never through this RPC connection.
export const RPC_URL =
  NIMIQ_NETWORK === 'main' ? 'https://rpc.nimiqwatch.com' : 'https://rpc.testnet.nimiqwatch.com'

let providerPromise: Promise<NimiqProvider> | null = null

/** Lazily initializes and caches the Nimiq Pay provider connection. Failures are not cached, so a later call (e.g. a user tapping Retry) gets a fresh attempt. */
export function getNimiqProvider(): Promise<NimiqProvider> {
  if (!providerPromise) {
    providerPromise = init()
      .then((provider) => {
        provider.setRPCUrl(RPC_URL)
        return provider
      })
      .catch((err) => {
        providerPromise = null
        throw err
      })
  }
  return providerPromise
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === 'object' && value !== null && 'error' in value
}

/** Produces a short, user-facing message for a failed/rejected wallet action. */
export function describeWalletError(value: ErrorResponse): { message: string; retryable: boolean } {
  const type = value.error?.type ?? ''
  if (/permissiondenied/i.test(type)) {
    return { message: 'You declined the request in Nimiq Pay.', retryable: true }
  }
  if (/invalidtransaction/i.test(type)) {
    return {
      message: 'That transaction was invalid, often because of an insufficient balance. Check your balance and try again.',
      retryable: true,
    }
  }
  return { message: value.error?.message || 'Something went wrong talking to Nimiq Pay.', retryable: true }
}
