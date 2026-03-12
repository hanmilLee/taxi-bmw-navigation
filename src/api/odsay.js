const ODSAY_KEY = import.meta.env.VITE_ODSAY_API_KEY

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

  if (!res.ok) throw new Error(`Odsay API 오류: ${res.status}`)

  const data = await res.json()

  // Odsay: 경로 없음 = result.path가 없거나 빈 배열
  if (!data.result || !data.result.path) {
    return []
  }

  return data.result.path
}

/**
 * Odsay path에서 환승 포인트 추출
 * non-walk subPath의 startName/startX/startY 수집
 * @param {Object} odsayPath - Odsay path 객체
 * @returns {Array<{name: string, x: number, y: number, isStation: boolean}>}
 */
export function extractTransferPoints(odsayPath) {
  const subPaths = odsayPath.subPath ?? []
  const seen = new Map()

  for (const seg of subPaths) {
    // trafficType: 1=지하철, 2=버스, 3=도보
    if (seg.trafficType === 3) continue

    const name = seg.startName
    const isStation = seg.trafficType === 1
    if (!name) continue

    if (!seen.has(name)) {
      seen.set(name, {
        name,
        x: parseFloat(seg.startX), // longitude
        y: parseFloat(seg.startY), // latitude
        isStation,
      })
      continue
    }

    if (isStation) {
      seen.get(name).isStation = true
    }
  }

  return [...seen.values()]
}
