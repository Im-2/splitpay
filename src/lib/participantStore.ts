const STORAGE_PREFIX = 'splitpay:participant:'

/** Remembers which participant a viewer identified as for a given split, so they don't have to re-pick on return visits. */
export function getStoredParticipantId(splitId: string): string | null {
  try {
    return localStorage.getItem(STORAGE_PREFIX + splitId)
  } catch {
    return null
  }
}

export function setStoredParticipantId(splitId: string, participantId: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + splitId, participantId)
  } catch {
    // Private browsing / storage disabled — non-fatal, picker just reappears next visit.
  }
}
