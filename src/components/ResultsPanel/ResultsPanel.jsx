import { RouteCard } from './RouteCard'
import { LoadingState } from './LoadingState'
import './ResultsPanel.css'

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
      <div className="results-panel__error">
        <p>⚠️ {error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="results-panel__empty">
        <p>출발지와 도착지를 입력하고 경로를 검색하세요.</p>
      </div>
    )
  }

  return (
    <div className="results-panel">
      <div className="results-panel__header">
        {results.length}개 경로 ({results.length > 1 ? '빠른 순' : ''})
      </div>
      <div className="results-panel__list">
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
