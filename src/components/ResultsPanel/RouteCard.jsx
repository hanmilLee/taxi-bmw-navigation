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

/**
 * @param {{ route: object, isSelected: boolean, isBest: boolean, onClick: () => void }} props
 */
export function RouteCard({ route, isSelected, isBest, onClick }) {
  const color = TYPE_COLOR[route.type] ?? '#666'

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

      <div className="route-card__fare">{formatFare(route.fare)}</div>

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
