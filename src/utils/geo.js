/**
 * 두 WGS84 좌표 간 거리 계산 (Haversine, 미터 단위)
 * @param {{ x: number, y: number }} a - {x: longitude, y: latitude}
 * @param {{ x: number, y: number }} b
 * @returns {number} 미터
 */
export function haversineMeters(a, b) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.y - a.y)
  const dLng = toRad(b.x - a.x)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.y)) * Math.cos(toRad(b.y)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
