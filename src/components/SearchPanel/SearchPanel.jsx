import { useState } from 'react'
import { PlaceInput } from './PlaceInput'
import './SearchPanel.css'

/**
 * @param {{ onSearch: (origin, destination) => void, isLoading: boolean }} props
 */
export function SearchPanel({ onSearch, isLoading }) {
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (origin && destination) {
      onSearch(origin, destination)
    }
  }

  const canSearch = origin && destination && !isLoading

  return (
    <form className="search-panel" onSubmit={handleSubmit}>
      <PlaceInput
        placeholder="출발지를 입력하세요"
        value={origin}
        onChange={setOrigin}
      />
      <div className="search-panel__arrow">→</div>
      <PlaceInput
        placeholder="도착지를 입력하세요"
        value={destination}
        onChange={setDestination}
      />
      <button
        type="submit"
        className="search-panel__btn"
        disabled={!canSearch}
      >
        {isLoading ? '계산 중...' : '경로 검색'}
      </button>
    </form>
  )
}
