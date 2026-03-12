import { useState } from 'react'
import { SearchPanel } from './components/SearchPanel/SearchPanel'
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel'
import { MapView } from './components/MapView/MapView'
import { useRouteSearch } from './hooks/useRouteSearch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Navigation } from 'lucide-react'

export default function App() {
  const { results, notices, isLoading, error, search } = useRouteSearch()
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const shouldShowResultsPanel = isLoading || !!error || results.length > 0
  const activeRoute = selectedRoute ?? results[0] ?? null

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
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Navigation className="size-4" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Taxi + Transit Navigator
              </h1>
              <p className="hidden text-xs text-muted-foreground md:block">
                택시와 대중교통 조합 경로를 빠르게 비교합니다.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full px-3 text-[11px]">
            Seoul Beta
          </Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] p-2 sm:p-3 md:p-5">
        <section className="relative h-[calc(100dvh-5.75rem)] min-h-[620px] overflow-hidden rounded-2xl border bg-card shadow-sm">
          <MapView
            selectedRoute={activeRoute}
            origin={origin}
            destination={destination}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 p-2 sm:p-3 md:p-4">
            <Card className="pointer-events-auto mx-auto w-full max-w-5xl gap-0 overflow-visible py-0 bg-background/88 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/78">
              <CardContent className="p-3 sm:p-3.5 md:p-3.5">
                <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>

          {shouldShowResultsPanel && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 h-[52%] p-2 pt-[7.25rem] sm:p-3 sm:pt-[7.75rem] md:pointer-events-none md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[27rem] md:p-4 md:pt-[7rem]">
              <Card className="pointer-events-auto h-full overflow-hidden bg-background/90 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-background/82">
                <ResultsPanel
                  results={results}
                  notices={notices}
                  isLoading={isLoading}
                  error={error}
                  selectedId={activeRoute?.id ?? null}
                  selectedRoute={activeRoute}
                  origin={origin}
                  destination={destination}
                  onSelect={handleSelectRoute}
                />
              </Card>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
