function resolveRouteMode(routeType) {
  if (routeType === 'PURE_TAXI') {
    return { kakao: 'car', naver: 'car' }
  }

  return { kakao: 'traffic', naver: 'transit' }
}

function safeName(name, fallback) {
  return encodeURIComponent(name || fallback)
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toWebMercator(lng, lat) {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat))
  const x = 6378137 * (lng * Math.PI / 180)
  const y = 6378137 * Math.log(Math.tan(Math.PI / 4 + (clampedLat * Math.PI / 360)))
  return { x, y }
}

export function buildKakaoRouteUrl(origin, destination, routeType) {
  if (!origin || !destination) return ''

  const { kakao } = resolveRouteMode(routeType)
  const originLng = toNumber(origin.x)
  const originLat = toNumber(origin.y)
  const destinationLng = toNumber(destination.x)
  const destinationLat = toNumber(destination.y)

  if (
    originLng === null ||
    originLat === null ||
    destinationLng === null ||
    destinationLat === null
  ) {
    return ''
  }

  const startName = safeName(origin.name, '출발지')
  const endName = safeName(destination.name, '도착지')

  return `https://map.kakao.com/link/by/${kakao}/${startName},${originLat.toFixed(6)},${originLng.toFixed(6)}/${endName},${destinationLat.toFixed(6)},${destinationLng.toFixed(6)}`
}

export function buildNaverRouteUrl(origin, destination, routeType) {
  if (!origin || !destination) return ''

  const { naver } = resolveRouteMode(routeType)
  const start = toWebMercator(toNumber(origin.x), toNumber(origin.y))
  const end = toWebMercator(toNumber(destination.x), toNumber(destination.y))

  if (!start || !end) return ''

  const startPath = `${start.x.toFixed(6)},${start.y.toFixed(6)},${safeName(origin.name, '출발지')},,`
  const endPath = `${end.x.toFixed(6)},${end.y.toFixed(6)},${safeName(destination.name, '도착지')},,`

  return `https://map.naver.com/p/directions/${startPath}/${endPath}/-/${naver}`
}
