import { useEffect, useRef } from 'react'
import { drawRoute, clearOverlays } from './RouteLayer'

function getViewportInsets(container) {
  const width = container?.clientWidth ?? window.innerWidth
  const height = container?.clientHeight ?? window.innerHeight
  const isMobile = width < 768

  if (isMobile) {
    return {
      top: Math.round(Math.max(108, height * 0.15)),
      right: 14,
      bottom: Math.round(height * 0.55),
      left: 14,
    }
  }

  return {
    top: 146,
    right: 24,
    bottom: 24,
    left: Math.round(Math.min(width * 0.38, 470)),
  }
}

/**
 * @param {{
 *   selectedRoute: object|null,
  *   origin: object|null,
 *   destination: object|null
 * }} props
 */
export function MapView({ selectedRoute, origin, destination }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const overlaysRef = useRef([])

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!containerRef.current || !window.kakao || mapRef.current) return

    const kakao = window.kakao
    const center = new kakao.maps.LatLng(37.5665, 126.978) // 서울 시청 기본값

    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center,
      level: 7,
    })
  }, [])

  // 경로 변경 시 지도에 그리기
  useEffect(() => {
    if (!mapRef.current || !selectedRoute || !origin || !destination) {
      if (mapRef.current) clearOverlays(overlaysRef.current)
      return
    }

    clearOverlays(overlaysRef.current)
    const viewportInsets = getViewportInsets(containerRef.current)
    drawRoute(
      mapRef.current,
      selectedRoute,
      origin,
      destination,
      overlaysRef.current,
      viewportInsets
    )
  }, [selectedRoute, origin, destination])

  // 화면 크기 변화 시 가시 영역 기준으로 재정렬
  useEffect(() => {
    if (!mapRef.current) return

    function handleResize() {
      mapRef.current.relayout()

      if (!selectedRoute || !origin || !destination) return

      clearOverlays(overlaysRef.current)
      const viewportInsets = getViewportInsets(containerRef.current)
      drawRoute(
        mapRef.current,
        selectedRoute,
        origin,
        destination,
        overlaysRef.current,
        viewportInsets
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedRoute, origin, destination])

  return <div className="h-full w-full bg-muted/40" ref={containerRef} />
}
