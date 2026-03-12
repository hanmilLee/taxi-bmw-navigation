import { RouteCard } from './RouteCard'
import { LoadingState } from './LoadingState'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildKakaoRouteUrl, buildNaverRouteUrl } from '@/utils/externalMaps'
import { ExternalLink, TriangleAlert } from 'lucide-react'

/**
 * @param {{
 *   results: Array,
 *   notices?: Array<{ id?: string, type?: string, message?: string }>,
 *   isLoading: boolean,
 *   error: string|null,
  *   selectedId: string|null,
 *   selectedRoute?: object|null,
 *   origin?: object|null,
 *   destination?: object|null,
 *   onSelect: (route) => void
 * }} props
 */
export function ResultsPanel({
  results,
  notices = [],
  isLoading,
  error,
  selectedId,
  selectedRoute = null,
  origin = null,
  destination = null,
  onSelect,
}) {
  if (isLoading && results.length === 0) return <LoadingState />

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-5">
        <p className="text-sm font-medium text-destructive">⚠️ {error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    if (!notices.length) return null

    return (
      <div className="space-y-2 p-4">
        {notices.map((notice) => (
          <div
            key={notice.id ?? notice.message}
            className="flex items-start gap-2 rounded-lg border border-amber-300/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900"
          >
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            <p>{notice.message}</p>
          </div>
        ))}
      </div>
    )
  }

  const activeRoute = selectedRoute ?? results[0]
  const kakaoUrl = buildKakaoRouteUrl(origin, destination, activeRoute?.type)
  const naverUrl = buildNaverRouteUrl(origin, destination, activeRoute?.type)
  const linkClass = (enabled) => cn(
    buttonVariants({ variant: 'outline', size: 'sm' }),
    'h-8 rounded-md px-2.5 text-[11px] font-medium',
    !enabled && 'pointer-events-none opacity-45'
  )

  return (
    <div className="flex h-full min-h-0 touch-pan-y flex-col overflow-y-auto overscroll-y-contain [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] md:overflow-hidden">
      <div className="space-y-3 border-b border-border/70 px-4 py-4 md:shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Search Results</p>
            <p className="text-sm font-semibold tracking-tight text-foreground">{results.length}개 경로</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isLoading && (
              <Badge variant="secondary" className="rounded-full text-[10px] font-medium">
                추가 계산중
              </Badge>
            )}
            <Badge variant="outline" className="rounded-full text-[11px] font-medium text-muted-foreground">
              {results.length > 1 ? '빠른 순' : '단일 결과'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={naverUrl}
            target="_blank"
            rel="noreferrer"
            className={linkClass(Boolean(naverUrl))}
            title="네이버 지도로 열기"
          >
            네이버 지도 <ExternalLink className="size-3" />
          </a>
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noreferrer"
            className={linkClass(Boolean(kakaoUrl))}
            title="카카오 지도로 열기"
          >
            카카오 지도 <ExternalLink className="size-3" />
          </a>
        </div>
        {notices.length > 0 && (
          <div className="space-y-1.5">
            {notices.map((notice) => (
              <div
                key={notice.id ?? notice.message}
                className="flex items-start gap-2 rounded-lg border border-amber-300/80 bg-amber-50/80 px-2.5 py-2 text-[11px] leading-4 text-amber-900"
              >
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                <p>{notice.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2.5 p-3 pb-5 md:flex-1 md:min-h-0 md:overflow-y-auto md:p-4">
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
