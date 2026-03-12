import { useState } from 'react'
import { SearchPanel } from './components/SearchPanel/SearchPanel'
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel'
import { MapView } from './components/MapView/MapView'
import { useRouteSearch } from './hooks/useRouteSearch'
import { Badge } from '@/components/ui/badge'

export default function App() {
  const { results, isLoading, error, search } = useRouteSearch()
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const shouldShowResultsPanel = isLoading || !!error || results.length > 0

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
    <div className="min-h-screen p-3 md:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1500px] flex-col gap-3 md:h-[calc(100vh-2rem)] md:gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 px-1 pb-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Taxi + Transit Navigator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              택시와 대중교통을 조합해 빠르고 납득 가능한 경로를 보여줍니다.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full text-[11px]">
            Seoul Beta
          </Badge>
        </header>

        <main className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border bg-card">
          <MapView
            selectedRoute={selectedRoute}
            origin={origin}
            destination={destination}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-2 sm:p-3 md:p-5">
            <div className="pointer-events-auto mx-auto w-full max-w-full md:max-w-5xl">
              <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>

          {shouldShowResultsPanel && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[48%] p-2 pt-[5.5rem] sm:p-3 sm:pt-[6rem] md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-full md:max-w-md md:p-5 md:pt-32">
              <div className="pointer-events-auto h-full overflow-hidden rounded-xl border bg-card">
                <ResultsPanel
                  results={results}
                  isLoading={isLoading}
                  error={error}
                  selectedId={selectedRoute?.id ?? null}
                  onSelect={handleSelectRoute}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
