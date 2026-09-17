import React from 'react'
import { IconCoin, IconHome, IconUser, IconWallet } from './PhoneScreen'

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
 * Bottom nav shown on organizer-facing screens (split status, nudge).
 * `active` selects which of the four icons reads as the current tab.
 */
export function BottomNav({ active = 'wallet' }: { active?: 'home' | 'wallet' | 'coin' | 'user' }) {
  const cls = (name: string) => `sp-bottomnav-item${active === name ? ' active' : ''}`
  return (
    <div className="sp-bottomnav">
      <span className={cls('home')}>
        <IconHome />
      </span>
      <span className={cls('wallet')}>
        <IconWallet />
      </span>
      <span className={cls('coin')}>
        <IconCoin />
      </span>
      <span className={cls('user')}>
        <IconUser />
      </span>
    </div>
  )
}
