import { useCallback, useEffect, useState } from 'react'
import type { Participant, Split } from '../lib/split'
import { shareLuna, splitUrl } from '../lib/split'
import { formatNim } from '../lib/format'
import { fetchPaymentStatuses, type PaymentStatus } from '../lib/reconcile'
import { Screen8SplitStatus } from '../screens/Screen8SplitStatus'
import { Screen9NudgeParticipant } from '../screens/Screen9NudgeParticipant'

function nudgeLink(split: Split, participantId: string): string {
  const url = new URL(splitUrl(split))
  url.searchParams.set('p', participantId)
  return url.toString()
}

function NudgePanel({ split, participant, onDone }: { split: Split; participant: Participant; onDone: () => void }) {
  const link = nudgeLink(split, participant.id)
  const [copied, setCopied] = useState(false)

  async function share() {
    const shareData = { title: 'SplitPay', text: `Your share of "${split.description}" is ready to pay.`, url: link }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled the share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      // clipboard unavailable — link is still visible below to copy manually
    }
  }

  return (
    <Screen9NudgeParticipant
      participantName={participant.name}
      link={link}
      copied={copied}
      onShare={share}
      onCopy={() => navigator.clipboard?.writeText(link).then(() => setCopied(true))}
      onDone={onDone}
    />
  )
}

export function SplitStatus({
  split,
  isOrganizer,
  onBack,
}: {
  split: Split
  isOrganizer: boolean
  onBack: () => void
}) {
  const [statuses, setStatuses] = useState<PaymentStatus[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [nudging, setNudging] = useState<Participant | null>(null)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const result = await fetchPaymentStatuses(split)
      setStatuses(result)
      setError(null)
    } catch {
      setError('Could not check payment status right now.')
    } finally {
      setRefreshing(false)
    }
  }, [split])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 20_000)
    return () => clearInterval(interval)
  }, [refresh])

  if (nudging) {
    return <NudgePanel split={split} participant={nudging} onDone={() => setNudging(null)} />
  }

  const shareLunaAmount = shareLuna(split)
  const paid = statuses?.filter((s) => s.paid) ?? []
  const pending = split.participants.filter((p) => !paid.some((s) => s.participantId === p.id))
  const link = splitUrl(split)

  async function shareSplit() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SplitPay', text: `"${split.description}" split status`, url: link })
        return
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    navigator.clipboard?.writeText(link).catch(() => {})
  }

  return (
    <Screen8SplitStatus
      onBack={onBack}
      description={split.description}
      totalLabel={formatNim(split.totalLuna)}
      participants={split.participants.map((p) => ({
        id: p.id,
        name: p.name,
        paid: paid.some((s) => s.participantId === p.id),
        amountLabel: formatNim(shareLunaAmount),
      }))}
      paidTotalLabel={formatNim(paid.length * shareLunaAmount)}
      pendingTotalLabel={formatNim(pending.length * shareLunaAmount)}
      onShare={shareSplit}
      isOrganizer={isOrganizer}
      onNudge={(participantId) => {
        const p = split.participants.find((x) => x.id === participantId)
        if (p) setNudging(p)
      }}
      hintText={
        (statuses ? `${paid.length} of ${split.participants.length} paid` : 'Checking payment status...') +
        (isOrganizer && pending.length > 0 ? ' — tap ⋮ to nudge someone.' : '')
      }
      error={error}
      onRefresh={refresh}
      refreshing={refreshing}
    />
  )
}
