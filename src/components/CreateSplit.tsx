import { useState } from 'react'
import { getNimiqProvider, isErrorResponse, describeWalletError } from '../lib/nimiqProvider'
import { createSplit, splitUrl, type Split } from '../lib/split'
import { formatNim } from '../lib/format'
import { getDeviceId } from '../lib/deviceId'
import { recordCreatedSplit } from '../lib/history'
import { Avatar } from './Avatar'
import { ErrorBanner } from './ErrorBanner'
import { HeaderBack, HeaderLogo } from './Header'
import { IconCheck, IconClose, IconCopy, IconHistory } from './icons'

export function CreateSplit({
  onBack,
  onOpenHistory,
}: {
  onBack: () => void
  onOpenHistory: () => void
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

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  function addNameField() {
    setNames((prev) => [...prev, ''])
  }

  function removeNameField(index: number) {
    setNames((prev) => prev.filter((_, i) => i !== index))
  }

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

  if (created) {
    const link = splitUrl(created)
    return (
      <>
        <HeaderLogo />
        <div className="sp-body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="sp-status-icon sp-status-icon-success">
            <IconCheck />
          </div>
          <h1 className="sp-title-xl">Split created!</h1>
          <p className="sp-subtitle" style={{ marginBottom: 24 }}>
            {created.description}
            <br />
            {formatNim(created.totalLuna)} total &middot; {created.participants.length} people
          </p>
          <div className="sp-card" style={{ width: '100%' }}>
            <p className="sp-label" style={{ marginBottom: 4 }}>
              Split link
            </p>
            <div className="sp-row">
              <span className="sp-link-text">{link}</span>
              <button
                className="sp-icon-btn"
                aria-label="Copy split link"
                onClick={() => {
                  navigator.clipboard?.writeText(link).then(() => setCopied(true))
                }}
              >
                <IconCopy />
              </button>
            </div>
          </div>
          <p className="sp-hint" style={{ marginTop: 12 }}>
            Anyone with this link can pay their share.
          </p>
        </div>
        <div className="sp-footer">
          <button
            className="sp-btn sp-btn-primary"
            onClick={() => {
              navigator.clipboard?.writeText(link).then(() => setCopied(true))
            }}
          >
            {copied ? 'Link copied!' : 'Copy split link'}
          </button>
          <button
            className="sp-btn sp-btn-secondary"
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({ title: 'SplitPay', text: `Pay your share of "${created.description}"`, url: link })
                  return
                } catch {
                  // user cancelled the share sheet — fall through to copy
                }
              }
              navigator.clipboard?.writeText(link).then(() => setCopied(true))
            }}
          >
            Share link
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <HeaderBack
        title="New split"
        onBack={onBack}
        right={
          <button className="sp-header-icon-btn" aria-label="History" onClick={onOpenHistory}>
            <IconHistory />
          </button>
        }
      />
      <div className="sp-body">
        <p className="sp-label">Split title</p>
        <input
          className="sp-input"
          placeholder="Weekend trip"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <p className="sp-label" style={{ marginTop: 16 }}>
          Total amount
        </p>
        <div className="sp-input-suffix">
          <input
            className="sp-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={totalNim}
            onChange={(e) => setTotalNim(e.target.value)}
          />
          <span>NIM</span>
        </div>

        <p className="sp-label" style={{ marginTop: 16 }}>
          Add people
        </p>
        <div className="sp-card" style={{ padding: 8 }}>
          {names.map((name, i) => (
            <div
              key={i}
              className="sp-row"
              style={{ padding: '8px 6px', borderBottom: i < names.length - 1 ? '1px solid var(--sp-border)' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <Avatar name={name || `Person ${i + 1}`} size={30} />
                <input
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: '2px 0',
                    outline: 'none',
                    color: 'var(--sp-text-primary)',
                    fontFamily: 'var(--sp-font)',
                    fontSize: 13,
                    flex: 1,
                    minWidth: 0,
                  }}
                  placeholder={`Person ${i + 1}`}
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                />
              </div>
              {names.length > 1 && (
                <button className="sp-icon-btn" aria-label="Remove" onClick={() => removeNameField(i)}>
                  <IconClose />
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="sp-btn sp-btn-secondary" style={{ marginTop: 10, fontSize: 13 }} onClick={addNameField}>
          + Add another
        </button>

        {error && <div style={{ marginTop: 16 }}><ErrorBanner message={error} onRetry={handleCreate} /></div>}
      </div>
      <div className="sp-footer">
        <div className="sp-card" style={{ background: 'var(--sp-card-bg-raised)' }}>
          <div className="sp-row">
            <span className="sp-label" style={{ margin: 0 }}>
              Each pays
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>
                {validNames.length > 0 && totalValue > 0
                  ? formatNim(Math.floor((totalValue * 100_000) / validNames.length))
                  : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{validNames.length} people</div>
            </div>
          </div>
        </div>
        <button className="sp-btn sp-btn-primary" disabled={!canSubmit} onClick={handleCreate}>
          {busy ? 'Connecting to Nimiq Pay...' : 'Create split'}
        </button>
      </div>
    </>
  )
}
