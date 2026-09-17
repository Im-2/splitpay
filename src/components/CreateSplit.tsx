import { useState } from 'react'
import { getNimiqProvider, isErrorResponse, describeWalletError } from '../lib/nimiqProvider'
import { createSplit, splitUrl, type Split } from '../lib/split'
import { formatNim } from '../lib/format'
import { getDeviceId } from '../lib/deviceId'
import { recordCreatedSplit } from '../lib/history'
import { Screen2CreateSplit } from '../screens/Screen2CreateSplit'
import { Screen3ShareLink } from '../screens/Screen3ShareLink'

export function CreateSplit({
  onBack,
  onNavigateHome,
  onNavigateHistory,
}: {
  onBack: () => void
  onNavigateHome: () => void
  onNavigateHistory: () => void
}) {
  const [description, setDescription] = useState('')
  const [totalNim, setTotalNim] = useState('')
  const [names, setNames] = useState(['', ''])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<Split | null>(null)
  const [copied, setCopied] = useState(false)

  const validNames = names.map((n) => n.trim()).filter(Boolean)
  const totalValue = Number(totalNim)
  const canSubmit = description.trim().length > 0 && totalValue > 0 && validNames.length >= 1 && !busy

  async function handleCreate() {
    setError(null)
    setBusy(true)
    try {
      const provider = await getNimiqProvider()
      const accounts = await provider.listAccounts()
      if (isErrorResponse(accounts)) {
        setError(describeWalletError(accounts).message)
        return
      }
      const organizerAddress = accounts[0]
      if (!organizerAddress) {
        setError('No Nimiq account is available. Open this Mini App inside Nimiq Pay and try again.')
        return
      }
      const split = createSplit({
        description,
        totalNim: totalValue,
        organizerAddress,
        participantNames: validNames,
      })
      setCreated(split)
      getDeviceId().then((deviceId) => recordCreatedSplit(split, deviceId))
    } catch {
      setError('Could not reach Nimiq Pay. Make sure this app is running inside Nimiq Pay and try again.')
    } finally {
      setBusy(false)
    }
  }

  function copyLink(link: string) {
    navigator.clipboard?.writeText(link).then(() => setCopied(true))
  }

  async function shareLink(link: string, description: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SplitPay', text: `Pay your share of "${description}"`, url: link })
        return
      } catch {
        // user cancelled the share sheet — fall through to copy
      }
    }
    copyLink(link)
  }

  if (created) {
    const link = splitUrl(created)
    return (
      <Screen3ShareLink
        description={created.description}
        totalLabel={formatNim(created.totalLuna)}
        peopleCount={created.participants.length}
        link={link}
        copied={copied}
        onCopy={() => copyLink(link)}
        onShare={() => shareLink(link, created.description)}
      />
    )
  }

  return (
    <Screen2CreateSplit
      onBack={onBack}
      onNavigateHome={onNavigateHome}
      onNavigateHistory={onNavigateHistory}
      description={description}
      onDescriptionChange={setDescription}
      totalNim={totalNim}
      onTotalNimChange={setTotalNim}
      names={names}
      onNameChange={(i, value) => setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)))}
      onAddName={() => setNames((prev) => [...prev, ''])}
      onRemoveName={(i) => setNames((prev) => prev.filter((_, idx) => idx !== i))}
      eachPays={
        validNames.length > 0 && totalValue > 0
          ? formatNim(Math.floor((totalValue * 100_000) / validNames.length))
          : '—'
      }
      peopleCount={validNames.length}
      onCreate={handleCreate}
      canSubmit={canSubmit}
      busy={busy}
      error={error}
    />
  )
}
