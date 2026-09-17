import React from 'react'
import { IconHistory, IconHome } from './PhoneScreen'

/** A person in a split. Static shape used throughout the reference screens. */
export type Participant = {
  name: string
  handle: string
  amount: string
  status: 'paid' | 'pending' | 'you'
  initial: string
  color: string
}

export function Avatar({ initial, color }: { initial: string; color: string }) {
  return (
    <div className="sp-avatar" style={{ background: color }}>
      {initial}
    </div>
  )
}

export function StatusBadge({ status }: { status: 'paid' | 'pending' }) {
  return (
    <span className={`sp-badge ${status === 'paid' ? 'sp-badge-paid' : 'sp-badge-pending'}`}>
      {status === 'paid' ? 'Paid' : 'Pending'}
    </span>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button className="sp-btn sp-btn-primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button className="sp-btn sp-btn-secondary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/**
 * Bottom nav shown across the in-app screens. The reference showed four
 * icons (home/wallet/coin/user), but only two map to a real feature of this
 * app (new split, history) — the other two had no destination to click
 * through to, so they were dropped rather than left as dead buttons.
 */
export function BottomNav({
  active,
  onHome,
  onHistory,
}: {
  active: 'home' | 'history' | null
  onHome: () => void
  onHistory: () => void
}) {
  const itemStyle: React.CSSProperties = { background: 'none', border: 'none', padding: 0, cursor: 'pointer' }
  return (
    <div className="sp-bottomnav">
      <button
        className={`sp-bottomnav-item${active === 'home' ? ' active' : ''}`}
        style={itemStyle}
        onClick={onHome}
        aria-label="New split"
      >
        <IconHome />
      </button>
      <button
        className={`sp-bottomnav-item${active === 'history' ? ' active' : ''}`}
        style={itemStyle}
        onClick={onHistory}
        aria-label="History"
      >
        <IconHistory />
      </button>
    </div>
  )
}
