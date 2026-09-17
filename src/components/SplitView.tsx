import { useEffect, useState } from 'react'
import type { Split } from '../lib/split'
import { getNimiqProvider, isErrorResponse } from '../lib/nimiqProvider'
import { getStoredParticipantId, setStoredParticipantId } from '../lib/participantStore'
import { ParticipantPicker } from './ParticipantPicker'
import { PayShare } from './PayShare'
import { SplitStatus } from './SplitStatus'
import { goBack } from '../lib/navigation'

export function SplitView({ split }: { split: Split }) {
  const [viewerAddress, setViewerAddress] = useState<string | null>(null)
  const [addressResolved, setAddressResolved] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const wantsStatusView = params.get('view') === 'status'
  const linkedParticipantId = params.get('p')

  const [participantId, setParticipantId] = useState<string | null>(() => {
    if (linkedParticipantId && split.participants.some((p) => p.id === linkedParticipantId)) {
      setStoredParticipantId(split.id, linkedParticipantId)
      return linkedParticipantId
    }
    return getStoredParticipantId(split.id)
  })

  useEffect(() => {
    let cancelled = false
    getNimiqProvider()
      .then((provider) => provider.listAccounts())
      .then((accounts) => {
        if (cancelled) return
        if (!isErrorResponse(accounts) && accounts[0]) {
          setViewerAddress(accounts[0])
        }
      })
      .catch(() => {
        // Declined or unavailable — continue as an anonymous participant.
      })
      .finally(() => {
        if (!cancelled) setAddressResolved(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!addressResolved) {
    return (
      <div className="sp-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className="sp-subtitle">Connecting to Nimiq Pay...</p>
      </div>
    )
  }

  const isOrganizer = viewerAddress !== null && viewerAddress === split.organizerAddress
  const backToHome = () => goBack('/')

  if (isOrganizer) {
    return <SplitStatus split={split} isOrganizer onBack={backToHome} />
  }

  if (wantsStatusView) {
    return <SplitStatus split={split} isOrganizer={false} onBack={backToHome} />
  }

  const storedParticipant = participantId
    ? split.participants.find((p) => p.id === participantId)
    : undefined

  if (!storedParticipant) {
    return (
      <ParticipantPicker
        split={split}
        onPick={(id) => {
          setStoredParticipantId(split.id, id)
          setParticipantId(id)
        }}
      />
    )
  }

  return (
    <PayShare
      split={split}
      participantId={storedParticipant.id}
      viewerAddress={viewerAddress}
      onBack={backToHome}
    />
  )
}
