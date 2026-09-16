import { useEffect, useState } from 'react'
import type { Split } from '../lib/split'
import { shareLuna, memoFor } from '../lib/split'
import { formatNim } from '../lib/format'
import { getNimiqProvider, isErrorResponse, describeWalletError } from '../lib/nimiqProvider'
import { fetchBalanceLuna } from '../lib/balance'
import { fetchPaymentStatuses } from '../lib/reconcile'
import { getDeviceId } from '../lib/deviceId'
import { recordPaidSplit } from '../lib/history'
import { ErrorBanner } from './ErrorBanner'

type PayState = 'checking' | 'idle' | 'pending' | 'success' | 'error'

export function PayShare({
  split,
  participantId,
  viewerAddress,
}: {
  split: Split
  participantId: string
  viewerAddress: string | null
}) {
  const participant = split.participants.find((p) => p.id === participantId)
  const owedLuna = shareLuna(split)

  const [state, setState] = useState<PayState>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [balanceLuna, setBalanceLuna] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchPaymentStatuses(split)
      .then((statuses) => {
        if (cancelled) return
        const mine = statuses.find((s) => s.participantId === participantId)
        if (mine?.paid) {
          setTxHash(mine.txHash ?? null)
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
      setTxHash(result)
      setState('success')
      getDeviceId().then((deviceId) =>
        recordPaidSplit({
          split,
          participantId,
          txHash: result,
          amountLuna: owedLuna,
          deviceId,
        }),
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

  return (
    <div className="card">
      <h1>{split.description}</h1>
      <p className="muted">Hi {participant.name}, here's what you owe</p>
      <p className="amount">{formatNim(owedLuna)}</p>
      {!balanceLoading && balanceLuna !== null && (
        <p className={insufficientBalance ? 'balance-line insufficient' : 'balance-line'}>
          Your balance: {formatNim(balanceLuna)}
        </p>
      )}
      {insufficientBalance && state !== 'success' && (
        <ErrorBanner message="Not enough NIM to cover this." />
      )}

      {state === 'checking' && <p className="muted small">Checking payment status...</p>}

      {state === 'success' && (
        <div className="success-box">
          <p>Paid!</p>
          {txHash && <p className="muted small">Transaction {txHash.slice(0, 16)}...</p>}
        </div>
      )}

      {(state === 'idle' || state === 'pending' || state === 'error') && (
        <>
          {state === 'error' && errorMessage && (
            <ErrorBanner message={errorMessage} onRetry={handlePay} />
          )}
          <button
            className={insufficientBalance ? 'primary muted-button' : 'primary'}
            disabled={state === 'pending'}
            onClick={handlePay}
          >
            {state === 'pending' ? 'Confirm in Nimiq Pay...' : 'Pay now'}
          </button>
        </>
      )}
    </div>
  )
}
