const REST_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

export class TaxiApiQuotaExceededError extends Error {
  constructor(message = '택시 API 사용량이 소진되었습니다.') {
    super(message)
    this.name = 'TaxiApiQuotaExceededError'
    this.code = 'TAXI_API_QUOTA_EXCEEDED'
  }
}

function isQuotaExceededPayload(status, payload) {
  if (status === 429) return true

  const rawMessage = [
    payload?.msg,
    payload?.error?.message,
    payload?.error_description,
    payload?.result_msg,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (!rawMessage) return false

  return ['quota', 'limit', 'exceed', 'too many', 'usage', '한도', '초과', '제한']
    .some((keyword) => rawMessage.includes(keyword))
}

export function isTaxiApiQuotaExceededError(error) {
  return error?.code === 'TAXI_API_QUOTA_EXCEEDED'
}

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

  if (!res.ok) {
    let errorPayload = null

    try {
      errorPayload = await res.clone().json()
    } catch {
      errorPayload = null
    }

    if (isQuotaExceededPayload(res.status, errorPayload)) {
      throw new TaxiApiQuotaExceededError()
    }

    throw new Error(`Kakao Mobility API 오류: ${res.status}`)
  }

  const data = await res.json()

  if (!data.routes || data.routes.length === 0) {
    throw new Error('택시 경로를 찾을 수 없습니다.')
  }

  const route = data.routes[0]

  if (route.result_code !== 0) {
    if (isQuotaExceededPayload(res.status, { result_msg: route.result_msg })) {
      throw new TaxiApiQuotaExceededError()
    }
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
