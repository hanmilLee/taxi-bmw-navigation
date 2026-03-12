const REST_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

/**
 * 키워드로 장소 검색 (자동완성용)
 * @param {string} keyword
 * @returns {Promise<Array<{name: string, address: string, x: number, y: number}>>}
 */
export async function searchPlaces(keyword) {
  if (!keyword.trim()) return []

  const params = new URLSearchParams({ query: keyword, size: 5 })
  const res = await fetch(`/kakao-local/v2/local/search/keyword.json?${params}`, {
    headers: { Authorization: `KakaoAK ${REST_KEY}` },
  })

  if (!res.ok) throw new Error(`Kakao Local API 오류: ${res.status}`)

  const data = await res.json()
  return data.documents.map((d) => ({
    name: d.place_name,
    address: d.road_address_name || d.address_name,
    x: parseFloat(d.x), // longitude
    y: parseFloat(d.y), // latitude
  }))
}
