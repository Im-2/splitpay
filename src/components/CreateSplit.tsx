import { useState } from 'react'
import { getNimiqProvider, isErrorResponse, describeWalletError } from '../lib/nimiqProvider'
import { createSplit, splitUrl, type Split } from '../lib/split'
import { formatNim } from '../lib/format'
import { getDeviceId } from '../lib/deviceId'
import { recordCreatedSplit } from '../lib/history'
import { Avatar } from './Avatar'
import { ErrorBanner } from './ErrorBanner'

export function CreateSplit() {
  const [description, setDescription] = useState('')
  const [totalNim, setTotalNim] = useState('')
  const [names, setNames] = useState(['', ''])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<Split | null>(null)

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
      <div className="card">
        <div className="success-box">
          <span className="status-icon neutral">&#10003;</span>
          <h1>Split created!</h1>
          <p className="muted">{created.description}</p>
          <p className="amount">{formatNim(created.totalLuna)}</p>
          <p className="muted small">{created.participants.length} people</p>
        </div>
        <div className="link-box">
          <code>{link}</code>
        </div>
        <p className="muted small">Anyone with this link can pay their share.</p>
        <div className="button-row">
          <button
            className="primary"
            onClick={() => {
              navigator.clipboard?.writeText(link).catch(() => {})
            }}
          >
            Copy split link
          </button>
          <button className="outline" onClick={() => (window.location.href = link)}>
            Open live status
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h1>New split</h1>
      <label className="field">
        <span>What's it for?</span>
        <input
          type="text"
          placeholder="Cabin trip, June rent, team gift..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Total amount (NIM)</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={totalNim}
          onChange={(e) => setTotalNim(e.target.value)}
        />
      </label>
      <div className="field">
        <span>Who owes you?</span>
        {names.map((name, i) => (
          <div className="name-row" key={i}>
            <Avatar name={name || `Person ${i + 1}`} size={28} />
            <input
              type="text"
              placeholder={`Person ${i + 1}`}
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
            />
            {names.length > 1 && (
              <button className="icon-button" aria-label="Remove" onClick={() => removeNameField(i)}>
                &times;
              </button>
            )}
          </div>
        ))}
        <button className="link-button" onClick={addNameField}>
          + Add person
        </button>
      </div>
      {validNames.length > 0 && totalValue > 0 && (
        <p className="muted small">
          Each person owes {formatNim(Math.floor((totalValue * 100_000) / validNames.length))}
        </p>
      )}
      {error && <ErrorBanner message={error} onRetry={handleCreate} />}
      <button className="primary" disabled={!canSubmit} onClick={handleCreate}>
        {busy ? 'Connecting to Nimiq Pay...' : 'Create split'}
      </button>
    </div>
  )
}
