import { useState } from 'react'
import { SearchPanel } from './components/SearchPanel/SearchPanel'
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel'
import { MapView } from './components/MapView/MapView'
import { useRouteSearch } from './hooks/useRouteSearch'
import './App.css'

export default function App() {
  const { results, isLoading, error, search } = useRouteSearch()
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)

  function handleSearch(orig, dest) {
    setOrigin(orig)
    setDestination(dest)
    setSelectedRoute(null)
    search(orig, dest)
  }

  function handleSelectRoute(route) {
    setSelectedRoute(route)
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">🚕 택시 + 대중교통 최적 경로</h1>
        <p className="app__subtitle">택시와 대중교통을 조합해 가장 빠른 경로를 찾아드립니다</p>
      </header>

      <SearchPanel onSearch={handleSearch} isLoading={isLoading} />

      <div className="app__body">
        <aside className="app__sidebar">
          <ResultsPanel
            results={results}
            isLoading={isLoading}
            error={error}
            selectedId={selectedRoute?.id ?? null}
            onSelect={handleSelectRoute}
          />
        </aside>
        <main className="app__map">
          <MapView
            selectedRoute={selectedRoute}
            origin={origin}
            destination={destination}
          />
        </main>
      </div>
    </div>
  )
}
