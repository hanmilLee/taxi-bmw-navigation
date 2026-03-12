/**
 * Kakao Maps에 선택된 경로 폴리라인 + 마커를 그리는 유틸
 * map 인스턴스와 overlays 배열(cleanup용)을 받아서 그린다.
 */

const ROUTE_COLORS = {
  PURE_TAXI: '#f59e0b',
  PURE_TRANSIT: '#10b981',
  TAXI_THEN_TRANSIT: '#3b82f6',
  TRANSIT_THEN_TAXI: '#8b5cf6',
}

/**
 * 기존 오버레이 전부 제거
 * @param {Array} overlays
 */
export function clearOverlays(overlays) {
  overlays.forEach((o) => o.setMap(null))
  overlays.length = 0
}

/**
 * 경로 그리기
 * @param {window.kakao.maps.Map} map
 * @param {object} route - RouteOption
 * @param {{ x: number, y: number }} origin
 * @param {{ x: number, y: number }} destination
 * @param {Array} overlays - mutable 배열 (cleanup용)
 */
export function drawRoute(map, route, origin, destination, overlays) {
  const kakao = window.kakao
  const color = ROUTE_COLORS[route.type] ?? '#666'

  // 택시 구간 폴리라인 (Kakao Mobility sections)
  if (route.taxiSections?.length) {
    for (const section of route.taxiSections) {
      const coords = chunkVertexes(section.roads?.flatMap((r) => r.vertexes) ?? [])
      if (coords.length < 2) continue

      const path = coords.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng))
      const poly = new kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: color,
        strokeOpacity: 0.85,
        strokeStyle: 'solid',
      })
      poly.setMap(map)
      overlays.push(poly)
    }
  }

  // 마커: 출발, 도착, 환승 포인트
  const markers = [
    { pos: origin, title: '출발', color: '#22c55e' },
    { pos: destination, title: '도착', color: '#ef4444' },
  ]

  if (route.transferPoint) {
    markers.push({ pos: route.transferPoint, title: '환승', color: color })
  }

  for (const { pos, title, color: mc } of markers) {
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(pos.y, pos.x),
      title,
    })

    // 커스텀 오버레이로 라벨 표시
    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(pos.y, pos.x),
      content: `<div style="
        background:${mc};color:#fff;font-size:11px;font-weight:700;
        padding:3px 8px;border-radius:12px;white-space:nowrap;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
        transform:translateY(-28px);
      ">${title}</div>`,
      yAnchor: 0,
    })

    marker.setMap(map)
    overlay.setMap(map)
    overlays.push(marker, overlay)
  }

  // 지도 범위를 경로에 맞게 자동 조정
  const bounds = new kakao.maps.LatLngBounds()
  bounds.extend(new kakao.maps.LatLng(origin.y, origin.x))
  bounds.extend(new kakao.maps.LatLng(destination.y, destination.x))
  if (route.transferPoint) {
    bounds.extend(new kakao.maps.LatLng(route.transferPoint.y, route.transferPoint.x))
  }
  map.setBounds(bounds)
}

/**
 * Kakao Mobility vertexes 배열([lng, lat, lng, lat, ...]) → [[lng, lat], ...] 변환
 */
function chunkVertexes(flat) {
  const pairs = []
  for (let i = 0; i + 1 < flat.length; i += 2) {
    pairs.push([flat[i], flat[i + 1]])
  }
  return pairs
}
