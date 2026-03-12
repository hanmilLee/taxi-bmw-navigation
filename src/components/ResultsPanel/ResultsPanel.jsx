import { RouteCard } from './RouteCard'
import { LoadingState } from './LoadingState'
import { Badge } from '@/components/ui/badge'

/**
 * @param {{
 *   results: Array,
 *   isLoading: boolean,
 *   error: string|null,
 *   selectedId: string|null,
 *   onSelect: (route) => void
 * }} props
 */
export function ResultsPanel({ results, isLoading, error, selectedId, onSelect }) {
  if (isLoading) return <LoadingState />

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-5">
        <p className="text-sm font-medium text-destructive">⚠️ {error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <p className="text-sm font-medium text-foreground">{results.length}개 경로</p>
        <Badge variant="outline" className="rounded-full text-[11px] text-muted-foreground">
          {results.length > 1 ? '빠른 순' : '단일 결과'}
        </Badge>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {results.map((route, i) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={selectedId === route.id}
            isBest={i === 0}
            onClick={() => onSelect(route)}
          />
        ))}
      </div>
    </div>
  )
}
