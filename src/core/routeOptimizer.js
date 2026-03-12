import { getTaxiRoute, isTaxiApiQuotaExceededError } from '../api/kakaoMobility'
import {
  getTransitRoute,
  extractTransferPoints,
  isTransitApiQuotaExceededError,
} from '../api/odsay'
import { haversineMeters } from '../utils/geo'

const MIN_TRANSFER_DISTANCE_M = 300 // 300m 이내 포인트는 스킵
const HYBRID_CONCURRENCY = 6

function formatTransferPointLabel(point) {
  const name = point?.name ?? ''
  if (!name) return ''
  if (!point?.isStation) return name
  return name.endsWith('역') ? name : `${name}역`
}

/**
 * 전체 경로 최적화 계산
 * @param {{ name: string, x: number, y: number }} origin
 * @param {{ name: string, x: number, y: number }} destination
 * @returns {Promise<{ routes: RouteOption[], notices: Array<{ id: string, type: string, message: string }> }>}
 * totalDuration(초) 기준 오름차순 정렬
 */
export async function computeOptimalRoutes(origin, destination) {
  const taxiState = { quotaExceeded: false }
  const transitState = { quotaExceeded: false }

  const safeTaxiRoute = async (from, to) =>
    getTaxiRoute(from, to).catch((error) => {
      if (isTaxiApiQuotaExceededError(error)) {
        taxiState.quotaExceeded = true
      }
      return null
    })

  const safeTransitRoute = async (from, to) =>
    getTransitRoute(from, to).catch((error) => {
      if (isTransitApiQuotaExceededError(error)) {
        transitState.quotaExceeded = true
      }
      return []
    })

  // 1. 순수 택시 + 대중교통 경로 병렬 조회
  const [pureTaxiResult, transitPaths] = await Promise.all([
    safeTaxiRoute(origin, destination),
    safeTransitRoute(origin, destination),
  ])

  const results = []

  if (pureTaxiResult) {
    const taxiFare = pureTaxiResult.fare ?? 0
    results.push({
      id: 'pure_taxi',
      type: 'PURE_TAXI',
      label: '택시만',
      totalDuration: pureTaxiResult.duration,
      fare: taxiFare,
      taxiFare,
      transitFare: 0,
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
    const transitFare = bestTransitPath.info.payment ?? 0
    results.push({
      id: 'pure_transit',
      type: 'PURE_TRANSIT',
      label: '대중교통만',
      totalDuration: totalSec,
      fare: transitFare,
      taxiFare: 0,
      transitFare,
      distance: bestTransitPath.info.totalDistance,
      transferPoint: null,
      segments: buildTransitSegments(bestTransitPath),
      transitPath: bestTransitPath,
    })
  }

  if (!bestTransitPath) {
    // 대중교통 경로 없음 → 택시만 반환
    return { routes: results, notices: buildNotices(taxiState, transitState) }
  }

  // 2. 환승 포인트 추출 및 필터링
  const rawPoints = extractTransferPoints(bestTransitPath)
  const transferPoints = rawPoints.filter(
    (p) =>
      haversineMeters(origin, p) > MIN_TRANSFER_DISTANCE_M &&
      haversineMeters(p, destination) > MIN_TRANSFER_DISTANCE_M
  )

  // 3. 각 환승 포인트에 대해 두 방향 조합 계산
  const hybridTasks = transferPoints.flatMap((point) => [
    // A: 택시(origin→P) + 대중교통(P→destination)
    () => buildTaxiThenTransit(origin, point, destination, safeTaxiRoute, safeTransitRoute),
    // B: 대중교통(origin→P) + 택시(P→destination)
    () => buildTransitThenTaxi(origin, point, destination, safeTaxiRoute, safeTransitRoute),
  ])

  const hybridResults = await runWithConcurrency(hybridTasks, HYBRID_CONCURRENCY)

  const all = [...results, ...hybridResults.filter(Boolean)]
  all.sort((a, b) => a.totalDuration - b.totalDuration)
  return { routes: all, notices: buildNotices(taxiState, transitState) }
}

function buildNotices(taxiState, transitState) {
  const notices = []

  if (taxiState.quotaExceeded) {
    notices.push({
      id: 'taxi-quota-exceeded',
      type: 'warning',
      message: '택시 API 사용량이 소진되어 택시 포함 경로 일부가 결과에서 제외되었어요.',
    })
  }

  if (transitState.quotaExceeded) {
    notices.push({
      id: 'transit-quota-exceeded',
      type: 'warning',
      message: '대중교통 API 사용량이 소진되어 대중교통 포함 경로 일부가 결과에서 제외되었어요.',
    })
  }

  return notices
}

async function runWithConcurrency(tasks, concurrency) {
  if (!tasks.length) return []
  const results = new Array(tasks.length)
  let cursor = 0

  async function worker() {
    while (true) {
      const i = cursor
      cursor += 1
      if (i >= tasks.length) return
      results[i] = await tasks[i]().catch(() => null)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}

async function buildTaxiThenTransit(origin, point, destination, safeTaxiRoute, safeTransitRoute) {
  const [taxi, transitPaths] = await Promise.all([
    safeTaxiRoute(origin, point),
    safeTransitRoute(point, destination),
  ])

  if (!taxi || !transitPaths[0]) return null

  const transit = transitPaths[0]
  const transitSec = transit.info.totalTime * 60
  const totalDuration = taxi.duration + transitSec
  const taxiFare = taxi.fare ?? 0
  const transitFare = transit.info.payment ?? 0
  const transferLabel = formatTransferPointLabel(point)

  return {
    id: `taxi_transit_${point.name}`,
    type: 'TAXI_THEN_TRANSIT',
    label: `택시 → (${transferLabel}) → 대중교통`,
    totalDuration,
    fare: taxiFare + transitFare,
    taxiFare,
    transitFare,
    transferPoint: point,
    segments: [
      { mode: 'TAXI', duration: taxi.duration, label: `택시 → ${point.name}` },
      ...buildTransitSegments(transit),
    ],
    taxiSections: taxi.sections,
    transitPath: transit,
  }
}

async function buildTransitThenTaxi(origin, point, destination, safeTaxiRoute, safeTransitRoute) {
  const [transitPaths, taxi] = await Promise.all([
    safeTransitRoute(origin, point),
    safeTaxiRoute(point, destination),
  ])

  if (!transitPaths[0] || !taxi) return null

  const transit = transitPaths[0]
  const transitSec = transit.info.totalTime * 60
  const totalDuration = transitSec + taxi.duration
  const taxiFare = taxi.fare ?? 0
  const transitFare = transit.info.payment ?? 0
  const transferLabel = formatTransferPointLabel(point)

  return {
    id: `transit_taxi_${point.name}`,
    type: 'TRANSIT_THEN_TAXI',
    label: `대중교통 → (${transferLabel}) → 택시`,
    totalDuration,
    fare: taxiFare + transitFare,
    taxiFare,
    transitFare,
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
      label = '도보'
    } else if (seg.trafficType === 1) {
      const lineName = subwayCode != null ? (SUBWAY_NAMES[subwayCode] ?? `${subwayCode}호선`) : '지하철'
      label = `${lineName} ${seg.startName} → ${seg.endName}`
    } else {
      label = `버스${busNo ? ` ${busNo}` : ''} ${seg.startName} → ${seg.endName}`
    }

    return { mode, duration: (seg.sectionTime ?? 0) * 60, label, subwayCode, busNo }
  })
}
