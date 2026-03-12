import { getTaxiRoute } from '../api/kakaoMobility'
import { getTransitRoute, extractTransferPoints } from '../api/odsay'
import { haversineMeters } from '../utils/geo'

const MAX_TRANSFER_POINTS = 10
const MIN_TRANSFER_DISTANCE_M = 300 // 300m 이내 포인트는 스킵

/**
 * 전체 경로 최적화 계산
 * @param {{ name: string, x: number, y: number }} origin
 * @param {{ name: string, x: number, y: number }} destination
 * @returns {Promise<RouteOption[]>} totalDuration(초) 기준 오름차순 정렬
 */
export async function computeOptimalRoutes(origin, destination) {
  // 1. 순수 택시 + 대중교통 경로 병렬 조회
  const [pureTaxiResult, transitPaths] = await Promise.all([
    getTaxiRoute(origin, destination).catch(() => null),
    getTransitRoute(origin, destination).catch(() => []),
  ])

  const results = []

  if (pureTaxiResult) {
    results.push({
      id: 'pure_taxi',
      type: 'PURE_TAXI',
      label: '택시만',
      totalDuration: pureTaxiResult.duration,
      fare: pureTaxiResult.fare,
      distance: pureTaxiResult.distance,
      transferPoint: null,
      segments: [
        { mode: 'TAXI', duration: pureTaxiResult.duration, label: '택시' },
      ],
      taxiSections: pureTaxiResult.sections,
    })
  }

  const bestTransitPath = transitPaths[0] ?? null

  if (bestTransitPath) {
    // Odsay totalTime은 분 단위 → 초로 변환
    const totalSec = bestTransitPath.info.totalTime * 60
    results.push({
      id: 'pure_transit',
      type: 'PURE_TRANSIT',
      label: '대중교통만',
      totalDuration: totalSec,
      fare: bestTransitPath.info.payment,
      distance: bestTransitPath.info.totalDistance,
      transferPoint: null,
      segments: buildTransitSegments(bestTransitPath),
      transitPath: bestTransitPath,
    })
  }

  if (!bestTransitPath) {
    // 대중교통 경로 없음 → 택시만 반환
    return results
  }

  // 2. 환승 포인트 추출 및 필터링
  const rawPoints = extractTransferPoints(bestTransitPath)
  const transferPoints = rawPoints
    .filter(
      (p) =>
        haversineMeters(origin, p) > MIN_TRANSFER_DISTANCE_M &&
        haversineMeters(p, destination) > MIN_TRANSFER_DISTANCE_M
    )
    .slice(0, MAX_TRANSFER_POINTS)

  // 3. 각 환승 포인트에 대해 두 방향 조합 병렬 계산
  const hybridPromises = transferPoints.flatMap((point) => [
    // A: 택시(origin→P) + 대중교통(P→destination)
    buildTaxiThenTransit(origin, point, destination),
    // B: 대중교통(origin→P) + 택시(P→destination)
    buildTransitThenTaxi(origin, point, destination),
  ])

  const hybridResults = await Promise.all(hybridPromises)

  const all = [...results, ...hybridResults.filter(Boolean)]
  all.sort((a, b) => a.totalDuration - b.totalDuration)
  return all
}

async function buildTaxiThenTransit(origin, point, destination) {
  const [taxi, transitPaths] = await Promise.all([
    getTaxiRoute(origin, point).catch(() => null),
    getTransitRoute(point, destination).catch(() => []),
  ])

  if (!taxi || !transitPaths[0]) return null

  const transit = transitPaths[0]
  const transitSec = transit.info.totalTime * 60
  const totalDuration = taxi.duration + transitSec

  return {
    id: `taxi_transit_${point.name}`,
    type: 'TAXI_THEN_TRANSIT',
    label: `택시 → 대중교통 (${point.name})`,
    totalDuration,
    fare: taxi.fare + transit.info.payment,
    transferPoint: point,
    segments: [
      { mode: 'TAXI', duration: taxi.duration, label: `택시 → ${point.name}` },
      ...buildTransitSegments(transit),
    ],
    taxiSections: taxi.sections,
    transitPath: transit,
  }
}

async function buildTransitThenTaxi(origin, point, destination) {
  const [transitPaths, taxi] = await Promise.all([
    getTransitRoute(origin, point).catch(() => []),
    getTaxiRoute(point, destination).catch(() => null),
  ])

  if (!transitPaths[0] || !taxi) return null

  const transit = transitPaths[0]
  const transitSec = transit.info.totalTime * 60
  const totalDuration = transitSec + taxi.duration

  return {
    id: `transit_taxi_${point.name}`,
    type: 'TRANSIT_THEN_TAXI',
    label: `대중교통 → 택시 (${point.name})`,
    totalDuration,
    fare: transit.info.payment + taxi.fare,
    transferPoint: point,
    segments: [
      ...buildTransitSegments(transit),
      { mode: 'TAXI', duration: taxi.duration, label: `택시 → 목적지` },
    ],
    transitPath: transit,
    taxiSections: taxi.sections,
  }
}

// 지하철 호선 이름 (Odsay subwayCode 기준)
const SUBWAY_NAMES = {
  1: '1호선', 2: '2호선', 3: '3호선', 4: '4호선', 5: '5호선',
  6: '6호선', 7: '7호선', 8: '8호선', 9: '9호선',
  101: '공항철도', 104: '경의중앙선', 107: '인천1호선',
  108: '경춘선', 109: '수인분당선', 110: '신분당선',
  112: '우이신설선', 114: '서해선', 116: '경강선', 21: '인천2호선',
}

/**
 * Odsay subPath를 segment 배열로 변환
 * @param {Object} odsayPath
 * @returns {Array<{mode: string, duration: number, label: string, subwayCode: number|null}>}
 */
function buildTransitSegments(odsayPath) {
  const TYPE_MODE = { 1: 'SUBWAY', 2: 'BUS', 3: 'WALK' }

  return (odsayPath.subPath ?? []).map((seg) => {
    const mode = TYPE_MODE[seg.trafficType] ?? 'TRANSIT'
    const subwayCode = seg.trafficType === 1 ? (seg.lane?.[0]?.subwayCode ?? null) : null
    const busNo = seg.trafficType === 2 ? (seg.lane?.[0]?.busNo ?? null) : null

    let label
    if (seg.trafficType === 3) {
      label = `도보 ${seg.sectionTime}분`
    } else if (seg.trafficType === 1) {
      const lineName = subwayCode != null ? (SUBWAY_NAMES[subwayCode] ?? `${subwayCode}호선`) : '지하철'
      label = `${lineName} ${seg.startName} → ${seg.endName}`
    } else {
      label = `버스${busNo ? ` ${busNo}` : ''} ${seg.startName} → ${seg.endName}`
    }

    return { mode, duration: (seg.sectionTime ?? 0) * 60, label, subwayCode, busNo }
  })
}
