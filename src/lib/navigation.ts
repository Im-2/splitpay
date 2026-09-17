/** Goes to the browser's previous entry, or a given fallback if there isn't one. */
export function goBack(fallbackUrl: string) {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = fallbackUrl
  }
}
