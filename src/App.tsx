import { useMemo } from 'react'
import './App.css'
import { decodeSplit } from './lib/split'
import { CreateSplit } from './components/CreateSplit'
import { SplitView } from './components/SplitView'
import { ErrorBanner } from './components/ErrorBanner'

function App() {
  const split = useMemo(() => {
    const encoded = new URLSearchParams(window.location.search).get('s')
    if (!encoded) return undefined
    return decodeSplit(encoded)
  }, [])

  const hasSplitParam = new URLSearchParams(window.location.search).has('s')

  return (
    <div className="app-shell">
      <header className="app-header">
        <h2>SplitPay</h2>
      </header>
      <main>
        {hasSplitParam && !split && (
          <div className="card">
            <ErrorBanner message="This split link looks broken or incomplete." />
          </div>
        )}
        {split && <SplitView split={split} />}
        {!hasSplitParam && <CreateSplit />}
      </main>
    </div>
  )
}

export default App
