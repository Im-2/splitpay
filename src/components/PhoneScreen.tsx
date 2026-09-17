import React from 'react'

/**
 * PhoneScreen — static device frame used to preview each screen in isolation.
 * This is a demo-only wrapper for reviewing the UI reference; it is NOT part
 * of the real mini app (a mini app just renders as a normal web page inside
 * the Nimiq Pay WebView, it doesn't need to draw its own phone chrome).
 */
export function PhoneScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="sp-phone">
      <div className="sp-screen">
        <div className="sp-statusbar" />
        {children}
      </div>
    </div>
  )
}

/** Top bar variant with the SplitPay logo + notification bell (home-style screens). */
export function HeaderLogo() {
  return (
    <div className="sp-header">
      <div className="sp-header-left">
        <img src="/logo.svg" className="sp-logo-avatar" alt="" />
      </div>
      <div className="sp-bell">
        <IconBell />
      </div>
    </div>
  )
}

/** Top bar variant with a back chevron + centered title (form / detail screens). */
export function HeaderBack({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: React.ReactNode
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

/* ---------- Minimal inline icon set (no external icon library dependency) ---------- */

export function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCheck() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconAlert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="8" x2="12" y2="13" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

export function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
    </svg>
  )
}

export function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconKebab() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  )
}

export function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- Bottom nav icons ---------- */

export function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9v11h14V9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconWallet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 012-2h13a1 1 0 011 1v3" strokeLinecap="round" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="16.5" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconCoin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 15.5c.5.7 1.4 1 2.5 1 1.8 0 3-1 3-2.2 0-3-5.5-1.3-5.5-4.1 0-1.3 1.3-2.2 3-2.2 1.1 0 2 .4 2.5 1" strokeLinecap="round" />
    </svg>
  )
}

export function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  )
}

/** Not in the original reference — History has no covered screen, so this icon was added to match the existing style. */
export function IconHistory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 109-9 9 9 0 00-7.5 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
