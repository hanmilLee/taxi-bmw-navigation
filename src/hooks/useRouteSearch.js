import { useState, useRef, useCallback } from 'react'
import { computeOptimalRoutes } from '../core/routeOptimizer'

/**
 * 경로 검색 훅
 * stale 결과 방지: 빠르게 두 번 검색해도 최신 결과만 반영됨
 */
export function useRouteSearch() {
  const [results, setResults] = useState([])
  const [notices, setNotices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const genRef = useRef(0)

  const search = useCallback(async (origin, destination) => {
    if (!origin || !destination) return

    const gen = ++genRef.current
    setIsLoading(true)
    setError(null)
    setResults([])
    setNotices([])

    try {
      const searchResult = await computeOptimalRoutes(origin, destination)
      const routeResults = Array.isArray(searchResult) ? searchResult : (searchResult?.routes ?? [])
      const nextNotices = Array.isArray(searchResult?.notices) ? searchResult.notices : []
      // 이전 검색 결과면 무시 (stale 방지)
      if (gen !== genRef.current) return
      setResults(routeResults)
      setNotices(nextNotices)
    } catch (e) {
      if (gen !== genRef.current) return
      setError(e.message || '경로 계산 중 오류가 발생했습니다.')
    } finally {
      if (gen === genRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  const reset = useCallback(() => {
    genRef.current++
    setResults([])
    setNotices([])
    setError(null)
    setIsLoading(false)
  }, [])

  return { results, notices, isLoading, error, search, reset }
}
