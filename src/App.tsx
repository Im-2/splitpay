import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { decodeSplit } from './lib/split'
import { getDeviceId } from './lib/deviceId'
import { CreateSplit } from './components/CreateSplit'
import { SplitView } from './components/SplitView'
import { HistoryView } from './components/HistoryView'
import { ErrorBanner } from './components/ErrorBanner'

type Tab = 'create' | 'history'

function App() {
  const [tab, setTab] = useState<Tab>('create')

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

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="/logo.svg" className="logo" alt="" />
        <h2>SplitPay</h2>
      </header>
      <main>
        {hasSplitParam && !split && (
          <div className="card">
            <ErrorBanner message="This split link looks broken or incomplete." />
          </div>
        )}
        {split && <SplitView split={split} />}
        {!hasSplitParam && tab === 'create' && <CreateSplit />}
        {!hasSplitParam && tab === 'history' && <HistoryView />}
      </main>
      {!hasSplitParam && (
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>
              <span className="nav-icon">+</span>
              New split
            </button>
            <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
              <span className="nav-icon">&#9776;</span>
              History
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

export default App
