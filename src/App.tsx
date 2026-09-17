import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { decodeSplit } from './lib/split'
import { getDeviceId } from './lib/deviceId'
import { CreateSplit } from './components/CreateSplit'
import { SplitView } from './components/SplitView'
import { HistoryView } from './components/HistoryView'
import { ErrorBanner } from './components/ErrorBanner'
import { LandingPage } from './marketing/LandingPage'

type Screen = 'create' | 'history'

function App() {
  const [entered, setEntered] = useState(false)
  const [screen, setScreen] = useState<Screen>('create')

  const split = useMemo(() => {
    const encoded = new URLSearchParams(window.location.search).get('s')
    if (!encoded) return undefined
    return decodeSplit(encoded)
  }, [])

  const hasSplitParam = new URLSearchParams(window.location.search).has('s')

  useEffect(() => {
    // Warm the device-identifier permission prompt once, up front, so it
    // doesn't interrupt split creation or payment later.
    getDeviceId()
  }, [])

  // A shared split link should open straight into the pay/status view, never
  // behind the welcome screen — only a fresh, link-less open shows it.
  if (!hasSplitParam && !entered) {
    return <LandingPage onEnter={() => setEntered(true)} />
  }

  if (hasSplitParam && !split) {
    return (
      <div className="app-shell">
        <div className="sp-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <ErrorBanner message="This split link looks broken or incomplete." />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {split ? (
        <SplitView split={split} />
      ) : screen === 'create' ? (
        <CreateSplit onBack={() => setEntered(false)} onOpenHistory={() => setScreen('history')} />
      ) : (
        <HistoryView onBack={() => setScreen('create')} />
      )}
    </div>
  )
}

export default App
