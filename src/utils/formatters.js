/**
 * 초를 "X시간 Y분" 형식으로 변환
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  const totalMinutes = Math.round(seconds / 60)
  if (totalMinutes < 60) return `${totalMinutes}분`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
}

/**
 * 원화 금액 포맷 (예: 12500 → "12,500원")
 * @param {number} amount
 * @returns {string}
 */
export function formatFare(amount) {
  if (!amount || amount <= 0) return '요금 정보 없음'
  return `${amount.toLocaleString('ko-KR')}원`
}

/**
 * 미터를 km 또는 m로 표시
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (!meters) return ''
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters)}m`
}
