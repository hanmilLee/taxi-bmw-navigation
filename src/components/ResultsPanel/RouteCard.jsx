import { formatDuration, formatFare } from '../../utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
    <Card
      className={cn(
        'cursor-pointer border-l-4 py-3 transition-colors',
        'hover:bg-muted/40',
        isSelected && 'border-primary/40 bg-muted/30'
      )}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <CardHeader className="gap-2 px-4 pb-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm leading-snug font-semibold tracking-tight text-foreground">
            {route.label}
          </CardTitle>
          {isBest && (
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] tracking-wide">
              최단
            </Badge>
          )}
        </div>
        <p className="text-[1.35rem] leading-none font-semibold tracking-tight text-foreground md:text-[1.6rem]">
          {formatDuration(route.totalDuration)}
        </p>
      </CardHeader>

      <CardContent className="space-y-2 px-4 pb-1">
        <div className="rounded-lg bg-muted/55 p-2.5">
          <p className="text-xs font-medium text-foreground">총 {formatFare(route.fare)}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span>택시 {formatBreakdownFare(taxiFare)}</span>
            <span>대중교통 {formatBreakdownFare(transitFare)}</span>
          </div>
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          {route.segments.map((seg, i) => (
            <span key={i} className="inline-flex max-w-full items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-1 text-[11px] text-muted-foreground">
              {i > 0 && <span className="text-muted-foreground/70">›</span>}
              <span className="text-[12px]">{MODE_ICON[seg.mode]}</span>
              <span className="max-w-[9rem] truncate sm:max-w-[12rem]">{seg.label}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
