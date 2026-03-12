import { formatDuration, formatFare } from '../../utils/formatters'
import './RouteCard.css'

const MODE_ICON = {
  TAXI: '🚕',
  SUBWAY: '🚇',
  BUS: '🚌',
  WALK: '🚶',
  TRANSIT: '🚌',
}

const TYPE_COLOR = {
  PURE_TAXI: '#f59e0b',
  PURE_TRANSIT: '#10b981',
  TAXI_THEN_TRANSIT: '#3b82f6',
  TRANSIT_THEN_TAXI: '#8b5cf6',
}

function formatBreakdownFare(amount) {
  const value = Number.isFinite(amount) ? amount : 0
  return `${value.toLocaleString('ko-KR')}원`
}

/**
 * @param {{ route: object, isSelected: boolean, isBest: boolean, onClick: () => void }} props
 */
export function RouteCard({ route, isSelected, isBest, onClick }) {
  const color = TYPE_COLOR[route.type] ?? '#666'
  const taxiFare = route.taxiFare ?? 0
  const transitFare = route.transitFare ?? 0

  return (
    <div
      className={`route-card ${isSelected ? 'route-card--selected' : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="route-card__header">
        <span className="route-card__label">{route.label}</span>
        {isBest && <span className="route-card__badge">최단</span>}
      </div>

      <div className="route-card__time">
        {formatDuration(route.totalDuration)}
      </div>

      <div className="route-card__fare">
        <div className="route-card__fare-total">총 {formatFare(route.fare)}</div>
        <div className="route-card__fare-breakdown">
          <span>택시 {formatBreakdownFare(taxiFare)}</span>
          <span>대중교통 {formatBreakdownFare(transitFare)}</span>
        </div>
      </div>

      <div className="route-card__segments">
        {route.segments.map((seg, i) => (
          <span key={i} className="route-card__segment">
            {i > 0 && <span className="route-card__arrow">›</span>}
            <span>
              {MODE_ICON[seg.mode]} {seg.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
