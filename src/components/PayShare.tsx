import { useEffect, useState } from 'react'
import type { Split } from '../lib/split'
import { shareLuna, memoFor, splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { getNimiqProvider, isErrorResponse, describeWalletError } from '../lib/nimiqProvider'
import { fetchBalanceLuna } from '../lib/balance'
import { fetchPaymentStatuses, type PaymentStatus } from '../lib/reconcile'
import { getDeviceId } from '../lib/deviceId'
import { recordPaidSplit } from '../lib/history'
import { Avatar } from './Avatar'
import { StatusBadge } from './StatusBadge'
import { ErrorBanner } from './ErrorBanner'
import { HeaderBack, HeaderLogo } from './Header'
import { IconAlert, IconCheck, IconWallet } from './icons'

type PayState = 'checking' | 'idle' | 'pending' | 'success' | 'error'

export function PayShare({
  split,
  participantId,
  viewerAddress,
  onBack,
}: {
  split: Split
  participantId: string
  viewerAddress: string | null
  onBack: () => void
}) {
  const participant = split.participants.find((p) => p.id === participantId)
  const owedLuna = shareLuna(split)

  const [state, setState] = useState<PayState>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<PaymentStatus[] | null>(null)
  const [balanceLuna, setBalanceLuna] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [warningDismissed, setWarningDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPaymentStatuses(split)
      .then((result) => {
        if (cancelled) return
        setStatuses(result)
        const mine = result.find((s) => s.participantId === participantId)
        if (mine?.paid) {
          setState('success')
        } else {
          setState('idle')
        }
      })
      .catch(() => {
        if (!cancelled) setState('idle')
      })
    return () => {
      cancelled = true
    }
  }, [split, participantId])

  useEffect(() => {
    if (!viewerAddress) {
      setBalanceLoading(false)
      return
    }
    let cancelled = false
    fetchBalanceLuna(viewerAddress)
      .then((luna) => {
        if (!cancelled) setBalanceLuna(luna)
      })
      .catch(() => {
        // Balance is a nice-to-have; never block payment on it failing.
      })
      .finally(() => {
        if (!cancelled) setBalanceLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [viewerAddress])

  async function handlePay() {
    setErrorMessage(null)
    setState('pending')
    try {
      const provider = await getNimiqProvider()
      const result = await provider.sendBasicTransactionWithData({
        recipient: split.organizerAddress,
        value: owedLuna,
        data: memoFor(split.id, participantId),
      })
      if (isErrorResponse(result)) {
        setErrorMessage(describeWalletError(result).message)
        setState('error')
        return
      }
      // Optimistic update: the chain won't have this transaction indexed yet,
      // so mark it paid locally rather than waiting on a reconciliation query
      // that would still show everyone as pending right after paying.
      setStatuses((prev) => {
        const rest = (prev ?? split.participants.map((p) => ({ participantId: p.id, paid: false }))).filter(
          (s) => s.participantId !== participantId,
        )
        return [...rest, { participantId, paid: true, txHash: result }]
      })
      setState('success')
      getDeviceId().then((deviceId) =>
        recordPaidSplit({ split, participantId, txHash: result, amountLuna: owedLuna, deviceId }),
      )
    } catch {
      setErrorMessage('Could not reach Nimiq Pay to send the payment. Check your connection and try again.')
      setState('error')
    }
  }

  if (!participant) {
    return <ErrorBanner message="That participant isn't part of this split." />
  }

  const insufficientBalance = balanceLuna !== null && balanceLuna < owedLuna

  // A one-time proactive heads-up before the pay screen, not a hard block:
  // dismissing it always leads back to a pay button that still works.
  if (insufficientBalance && !warningDismissed && state !== 'success') {
    return (
      <>
        <HeaderLogo />
        <div className="sp-body" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="sp-status-icon sp-status-icon-danger">
            <IconAlert />
          </div>
          <h1 className="sp-title-xl">Insufficient balance</h1>
          <p className="sp-subtitle" style={{ marginBottom: 20 }}>
            You need
          </p>
          <p className="sp-value-lg" style={{ marginBottom: 2 }}>
            {formatNim(owedLuna)}
          </p>
          <p className="sp-subtitle" style={{ marginBottom: 20 }}>
            to join this split
          </p>

          <div className="sp-card" style={{ width: '100%', marginBottom: 12 }}>
            <p className="sp-label" style={{ marginBottom: 2 }}>
              Your balance
            </p>
            <p style={{ fontSize: 20, fontWeight: 500, color: 'var(--sp-danger-text)', margin: 0 }}>
              {formatNim(balanceLuna)}
            </p>
          </div>

          <div className="sp-card" style={{ width: '100%', background: 'var(--sp-danger-bg)', border: 'none', textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: 'var(--sp-danger-text)', margin: 0, lineHeight: 1.5 }}>
              Not enough NIM to cover this payment. Please top up your wallet and try again.
            </p>
          </div>
        </div>
        <div className="sp-footer">
          <button className="sp-btn sp-btn-primary" onClick={() => setWarningDismissed(true)}>
            Got it
          </button>
        </div>
      </>
    )
  }

  if (state === 'success') {
    const paidCount = statuses?.filter((s) => s.paid).length ?? 0
    return (
      <>
        <HeaderLogo />
        <div className="sp-body" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="sp-status-icon sp-status-icon-success">
            <IconCheck />
          </div>
          <h1 className="sp-title-xl">Payment successful</h1>
          <p className="sp-subtitle" style={{ marginBottom: 2 }}>
            You paid
          </p>
          <p className="sp-value-lg" style={{ marginBottom: 2 }}>
            {formatNim(owedLuna)}
          </p>
          <p className="sp-subtitle" style={{ marginBottom: 20 }}>
            {split.description}
          </p>

          <div className="sp-card" style={{ width: '100%', textAlign: 'left' }}>
            <div className="sp-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Split status</span>
              <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
                {paidCount} of {split.participants.length} paid
              </span>
            </div>
            {split.participants.map((p) => {
              const paid = statuses?.find((s) => s.participantId === p.id)?.paid ?? p.id === participantId
              return (
                <div key={p.id} className="sp-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={p.name} />
                    <span style={{ fontSize: 13 }}>{p.name}</span>
                  </div>
                  <StatusBadge paid={paid} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="sp-footer">
          <button
            className="sp-btn sp-btn-primary"
            onClick={() => {
              const url = new URL(splitUrl(split))
              url.searchParams.set('view', 'status')
              window.location.href = url.toString()
            }}
          >
            View split status
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <HeaderBack title="Pay your share" onBack={onBack} />
      <div className="sp-body">
        <div className="sp-card">
          <p className="sp-label" style={{ marginBottom: 2 }}>
            {split.description}
          </p>
          <p style={{ fontSize: 12, color: 'var(--sp-text-secondary)', margin: 0 }}>Requested by the organizer</p>

          <hr className="sp-divider" />

          <div className="sp-row">
            <span className="sp-label" style={{ margin: 0 }}>
              Your share
            </span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{formatNim(owedLuna)}</span>
          </div>
          {!balanceLoading && balanceLuna !== null && (
            <div className="sp-row">
              <span className="sp-label" style={{ margin: 0 }}>
                Your balance
              </span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{formatNim(balanceLuna)}</span>
            </div>
          )}
        </div>

        {state === 'error' && errorMessage ? (
          <div style={{ marginTop: 16 }}>
            <ErrorBanner message={errorMessage} onRetry={handlePay} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="sp-subtitle">
              {state === 'checking' ? 'Checking payment status...' : "You're all set to pay!"}
            </p>
          </div>
        )}
      </div>
      <div className="sp-footer">
        <button className="sp-btn sp-btn-primary" disabled={state === 'pending'} onClick={handlePay}>
          <IconWallet /> {state === 'pending' ? 'Confirm in Nimiq Pay...' : 'Pay with Nimiq Pay'}
        </button>
        <p className="sp-hint">Secure payments with Nimiq Pay</p>
      </div>
    </>
  )
}
