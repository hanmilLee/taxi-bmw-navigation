const REST_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

/**
 * 두 지점 간 자동차(택시) 경로 조회
 * @param {{ x: number, y: number }} origin - 출발지 (longitude, latitude)
 * @param {{ x: number, y: number }} destination - 도착지
 * @returns {Promise<{ duration: number, fare: number, distance: number, sections: Array }>}
 *   duration: 초, fare: 원, distance: 미터
 */
export async function getTaxiRoute(origin, destination) {
  const params = new URLSearchParams({
    origin: `${origin.x},${origin.y}`,
    destination: `${destination.x},${destination.y}`,
    priority: 'TIME',
    summary: 'false',
  })

  const res = await fetch(`/kakao-mobility/v1/directions?${params}`, {
    headers: { Authorization: `KakaoAK ${REST_KEY}` },
  })

  if (!res.ok) throw new Error(`Kakao Mobility API 오류: ${res.status}`)

  const data = await res.json()

  if (!data.routes || data.routes.length === 0) {
    throw new Error('택시 경로를 찾을 수 없습니다.')
  }

  const route = data.routes[0]

  if (route.result_code !== 0) {
    throw new Error(`택시 경로 오류: ${route.result_msg}`)
  }

  const summary = route.summary
  return {
    duration: summary.duration,       // 초
    fare: summary.fare?.taxi ?? 0,    // 원
    distance: summary.distance,       // 미터
    sections: route.sections ?? [],   // 경로 좌표 (지도 표시용)
  }
}
