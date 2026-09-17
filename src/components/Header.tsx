import type { ReactNode } from 'react'
import { IconBell, IconChevronLeft } from './icons'

/** Top bar with the SplitPay logo + notification bell (home-style screens). */
export function HeaderLogo({ right }: { right?: ReactNode }) {
  return (
    <div className="sp-header">
      <div className="sp-header-left">
        <img src="/logo.svg" className="sp-logo-avatar" alt="" />
      </div>
      {right ?? (
        <div className="sp-bell">
          <IconBell />
        </div>
      )}
    </div>
  )
}

/** Top bar with a back chevron + centered title (form / detail screens). */
export function HeaderBack({
  title,
  onBack,
  right,
}: {
  title: string
  onBack: () => void
  right?: ReactNode
}) {
  return (
    <div className="sp-header">
      <div className="sp-header-left">
        <button className="sp-back" onClick={onBack} aria-label="Go back">
          <IconChevronLeft />
        </button>
      </div>
      <div className="sp-header-title">{title}</div>
      {right ?? <div style={{ width: 28 }} />}
    </div>
  )
}

/** Goes to the browser's previous entry, or a given fallback if there isn't one. */
export function goBack(fallbackUrl: string) {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = fallbackUrl
  }
}
