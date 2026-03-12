import { useState, useRef, useEffect } from 'react'
import { usePlaceSearch } from '../../hooks/usePlaceSearch'
import './PlaceInput.css'

/**
 * 장소 검색 자동완성 입력 컴포넌트
 * @param {{ placeholder: string, value: object|null, onChange: (place) => void }} props
 */
export function PlaceInput({ placeholder, value, onChange }) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const { suggestions, isLoading } = usePlaceSearch(open ? query : '')

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInputChange(e) {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange(null)
  }

  function handleSelect(place) {
    setQuery(place.name)
    onChange(place)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="place-input" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => query && setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {open && (isLoading || suggestions.length > 0) && (
        <ul className="place-input__dropdown">
          {isLoading && (
            <li className="place-input__loading">검색 중...</li>
          )}
          {suggestions.map((place, i) => (
            <li
              key={i}
              className="place-input__item"
              onMouseDown={() => handleSelect(place)}
            >
              <span className="place-input__name">{place.name}</span>
              <span className="place-input__address">{place.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
