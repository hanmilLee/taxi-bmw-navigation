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
