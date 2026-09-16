import { requestDeviceIdentifier } from '@nimiq/mini-app-sdk'

let deviceIdPromise: Promise<string | null> | null = null

/**
 * Requests Nimiq Pay's per-device identifier, used only to tag local history
 * entries with "this device". Resolves to null (not thrown) when denied or
 * unavailable (e.g. outside Nimiq Pay) — history degrades to untagged local
 * entries rather than breaking anything.
 */
export function getDeviceId(): Promise<string | null> {
  if (!deviceIdPromise) {
    deviceIdPromise = requestDeviceIdentifier({ reason: 'Save your split history on this device' }).catch(
      () => null,
    )
  }
  return deviceIdPromise
}
