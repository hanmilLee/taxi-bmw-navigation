import { useState, useEffect, useRef } from 'react'
import { searchPlaces } from '../api/kakaoLocal'

/**
 * 장소 검색 자동완성 훅 (300ms 디바운스)
 * @param {string} query - 검색 키워드
 * @returns {{ suggestions: Array, isLoading: boolean, error: string|null }}
 */
export function usePlaceSearch(query) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setError(null)
      return
    }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const results = await searchPlaces(query)
        setSuggestions(results)
      } catch (e) {
        setError(e.message)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [query])

  return { suggestions, isLoading, error }
}
