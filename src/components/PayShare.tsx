import { useEffect, useState } from 'react'
import type { Split } from '../lib/split'
import { shareLuna, memoFor, splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { getNimiqProvider, isErrorResponse, describeWalletError } from '../lib/nimiqProvider'
import { fetchBalanceLuna } from '../lib/balance'
import { fetchPaymentStatuses, type PaymentStatus } from '../lib/reconcile'
import { getDeviceId } from '../lib/deviceId'
import { recordPaidSplit } from '../lib/history'
import { ErrorBanner } from './ErrorBanner'
import { Screen4PayShare } from '../screens/Screen4PayShare'
import { Screen6PaymentSuccess } from '../screens/Screen6PaymentSuccess'
import { Screen7InsufficientFunds } from '../screens/Screen7InsufficientFunds'

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
        setState(mine?.paid ? 'success' : 'idle')
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
      <Screen7InsufficientFunds
        neededLabel={formatNim(owedLuna)}
        balanceLabel={formatNim(balanceLuna)}
        onDismiss={() => setWarningDismissed(true)}
      />
    )
  }

  if (state === 'success') {
    return (
      <Screen6PaymentSuccess
        amountLabel={formatNim(owedLuna)}
        description={split.description}
        participants={split.participants.map((p) => ({
          id: p.id,
          name: p.name,
          paid: statuses?.find((s) => s.participantId === p.id)?.paid ?? p.id === participantId,
        }))}
        onViewStatus={() => {
          const url = new URL(splitUrl(split))
          url.searchParams.set('view', 'status')
          window.location.href = url.toString()
        }}
      />
    )
  }

  return (
    <Screen4PayShare
      onBack={onBack}
      description={split.description}
      shareLabel={formatNim(owedLuna)}
      balanceLabel={!balanceLoading && balanceLuna !== null ? formatNim(balanceLuna) : null}
      centerText={state === 'checking' ? 'Checking payment status...' : "You're all set to pay!"}
      onPay={handlePay}
      payLabel={state === 'pending' ? 'Confirm in Nimiq Pay...' : 'Pay with Nimiq Pay'}
      payDisabled={state === 'pending'}
      errorMessage={state === 'error' ? errorMessage : null}
    />
  )
}
