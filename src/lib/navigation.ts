/** Goes to the browser's previous entry, or a given fallback if there isn't one. */
export function goBack(fallbackUrl: string) {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = fallbackUrl
  }
}

/**
 * Bottom-nav taps from a split-flow screen (reached via a shared link) live
 * outside the home app's React state entirely, so getting to "New split" or
 * "History" from there is a real navigation, not a state change.
 */
export function navigateToTab(tab: 'create' | 'history') {
  window.location.href = `/?tab=${tab}`
}
