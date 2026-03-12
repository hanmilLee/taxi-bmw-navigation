import { formatDuration, formatFare } from '../../utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BusFront, CarFront, ChevronRight, Footprints, TrainFront } from 'lucide-react'

const MODE_META = {
  TAXI: { Icon: CarFront, fallback: '택시' },
  SUBWAY: { Icon: TrainFront, fallback: '지하철' },
  BUS: { Icon: BusFront, fallback: '버스' },
  WALK: { Icon: Footprints, fallback: '도보' },
  TRANSIT: { Icon: BusFront, fallback: '대중교통' },
}

const TYPE_LABEL = {
  PURE_TAXI: '택시만',
  PURE_TRANSIT: '대중교통만',
  TAXI_THEN_TRANSIT: '택시 후 대중교통',
  TRANSIT_THEN_TAXI: '대중교통 후 택시',
}

function formatBreakdownFare(amount) {
  const value = Number.isFinite(amount) ? amount : 0
  return `${value.toLocaleString('ko-KR')}원`
}

function resolveSegmentMeta(segment) {
  const mode = MODE_META[segment.mode] ?? MODE_META.TRANSIT
  const duration = Number(segment.duration)
  const hasDuration = Number.isFinite(duration) && duration > 0

  return {
    Icon: mode.Icon,
    label: segment.label || mode.fallback,
    durationLabel: hasDuration ? formatDuration(duration) : '',
  }
}

/**
 * @param {{ route: object, isSelected: boolean, isBest: boolean, onClick: () => void }} props
 */
export function RouteCard({ route, isSelected, isBest, onClick }) {
  const routeType = TYPE_LABEL[route.type] ?? '조합 경로'
  const taxiFare = route.taxiFare ?? 0
  const transitFare = route.transitFare ?? 0

  return (
    <Card
      className={cn(
        'cursor-pointer gap-3 py-3 transition',
        'hover:bg-muted/40',
        isSelected ? 'ring-2 ring-primary/35' : 'ring-1 ring-border/80'
      )}
      onClick={onClick}
    >
      <CardHeader className="gap-2 px-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="rounded-full text-[10px]">
                {routeType}
              </Badge>
              {isBest && (
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] tracking-wide">
                  최단
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm leading-snug font-semibold tracking-tight text-foreground">
              {route.label}
            </CardTitle>
          </div>
          <p className="shrink-0 text-[1.3rem] leading-none font-semibold tracking-tight text-foreground md:text-[1.45rem]">
            {formatDuration(route.totalDuration)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 px-4 pb-0">
        <div className="rounded-lg border bg-muted/45 p-2.5">
          <p className="text-xs font-medium text-foreground">총 {formatFare(route.fare)}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span>택시 {formatBreakdownFare(taxiFare)}</span>
            <span>대중교통 {formatBreakdownFare(transitFare)}</span>
          </div>
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          {route.segments.map((seg, i) => {
            const segment = resolveSegmentMeta(seg)
            return (
              <div key={i} className="flex max-w-full items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground/70" />}
                <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-1 text-[11px] text-muted-foreground">
                  <segment.Icon className="size-3.5 shrink-0" />
                  <span className="max-w-[9rem] truncate sm:max-w-[12rem]">
                    {segment.label}
                  </span>
                  {segment.durationLabel && (
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">
                      {segment.durationLabel}
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
