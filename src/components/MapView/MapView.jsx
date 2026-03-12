import { useEffect, useRef } from 'react'
import { drawRoute, clearOverlays } from './RouteLayer'
import './MapView.css'

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
    drawRoute(mapRef.current, selectedRoute, origin, destination, overlaysRef.current)
  }, [selectedRoute, origin, destination])

  return <div className="map-view" ref={containerRef} />
}
