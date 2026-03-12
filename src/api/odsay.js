const ODSAY_KEY = import.meta.env.VITE_ODSAY_API_KEY

export class TransitApiQuotaExceededError extends Error {
  constructor(message = '대중교통 API 사용량이 소진되었습니다.') {
    super(message)
    this.name = 'TransitApiQuotaExceededError'
    this.code = 'TRANSIT_API_QUOTA_EXCEEDED'
  }
}

export class TransitApiRateLimitedError extends Error {
  constructor(message = '대중교통 API 요청량 제한에 도달했습니다.') {
    super(message)
    this.name = 'TransitApiRateLimitedError'
    this.code = 'TRANSIT_API_RATE_LIMITED'
  }
}

function parseOdsayMessage(payload) {
  return [
    payload?.error?.msg,
    payload?.error?.message,
    payload?.msg,
    payload?.message,
    payload?.error_description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function isQuotaExceededPayload(payload) {
  const rawMessage = parseOdsayMessage(payload)
  if (!rawMessage) return false

  return ['quota', 'exhaust', 'insufficient', '사용량', '소진', '잔여', '일일']
    .some((keyword) => rawMessage.includes(keyword))
}

function isRateLimitedPayload(status, payload) {
  if (status === 429) return true
  const rawMessage = parseOdsayMessage(payload)
  if (!rawMessage) return false

  return ['rate limit', 'too many', '요청량', '호출 제한', '초당', '분당', '제한']
    .some((keyword) => rawMessage.includes(keyword))
}

export function isTransitApiQuotaExceededError(error) {
  return error?.code === 'TRANSIT_API_QUOTA_EXCEEDED'
}

export function isTransitApiRateLimitedError(error) {
  return error?.code === 'TRANSIT_API_RATE_LIMITED'
}

/**
 * 대중교통 경로 검색 (Odsay API)
 * @param {{ x: number, y: number }} origin - 출발지 (WGS84 longitude, latitude)
 * @param {{ x: number, y: number }} destination - 도착지
 * @returns {Promise<Array>} Odsay path 배열 (없으면 빈 배열)
 */
export async function getTransitRoute(origin, destination) {
  const params = new URLSearchParams({
    SX: origin.x,
    SY: origin.y,
    EX: destination.x,
    EY: destination.y,
    apiKey: ODSAY_KEY,
  })

  // Odsay는 Referer 기반 도메인 인증 → 브라우저에서 직접 호출 (프록시 사용 안 함)
  const res = await fetch(`https://api.odsay.com/v1/api/searchPubTransPathT?${params}`)

  if (!res.ok) {
    let errorPayload = null

    try {
      errorPayload = await res.clone().json()
    } catch {
      errorPayload = null
    }

    if (isQuotaExceededPayload(errorPayload)) {
      throw new TransitApiQuotaExceededError()
    }
    if (isRateLimitedPayload(res.status, errorPayload)) {
      throw new TransitApiRateLimitedError()
    }

    throw new Error(`Odsay API 오류: ${res.status}`)
  }

  const data = await res.json()

  if (data?.error) {
    if (isQuotaExceededPayload(data)) {
      throw new TransitApiQuotaExceededError()
    }
    if (isRateLimitedPayload(res.status, data)) {
      throw new TransitApiRateLimitedError()
    }
    throw new Error(`Odsay API 오류: ${data.error.msg ?? '응답 오류'}`)
  }

  // Odsay: 경로 없음 = result.path가 없거나 빈 배열
  if (!data.result || !data.result.path) {
    return []
  }

  return data.result.path
}

/**
 * Odsay path에서 환승 포인트 추출
 * - non-walk subPath의 시작/종료 지점을 수집
 * - 지하철(trafficType=1)은 passStopList의 중간역까지 모두 수집
 * @param {Object} odsayPath - Odsay path 객체
 * @returns {Array<{name: string, x: number, y: number, isStation: boolean}>}
 */
export function extractTransferPoints(odsayPath) {
  const subPaths = odsayPath.subPath ?? []
  const seen = new Map()

  function upsertPoint(name, x, y, isStation) {
    if (!name) return
    const lng = Number.parseFloat(x)
    const lat = Number.parseFloat(y)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return

    if (!seen.has(name)) {
      seen.set(name, { name, x: lng, y: lat, isStation })
      return
    }

    if (isStation) {
      seen.get(name).isStation = true
    }
  }

  for (const seg of subPaths) {
    // trafficType: 1=지하철, 2=버스, 3=도보
    if (seg.trafficType === 3) continue

    const isStation = seg.trafficType === 1
    upsertPoint(seg.startName, seg.startX, seg.startY, isStation)
    upsertPoint(seg.endName, seg.endX, seg.endY, isStation)

    // 지하철 구간은 경유 역 전체를 환승 후보로 포함
    if (seg.trafficType === 1) {
      const stations = seg.passStopList?.stations ?? []
      for (const station of stations) {
        const stationName =
          station.stationName ??
          station.stationNm ??
          station.name ??
          station.localStationName ??
          ''
        upsertPoint(stationName, station.x, station.y, true)
      }
    }
  }

  return [...seen.values()]
}
