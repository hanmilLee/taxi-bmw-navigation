import { useState, useRef, useEffect } from 'react'
import { usePlaceSearch } from '../../hooks/usePlaceSearch'
import './PlaceInput.css'

const SAVED_LABELS = [
  { key: '집', icon: '🏠' },
  { key: '직장', icon: '💼' },
]

/**
 * 장소 검색 자동완성 입력 컴포넌트
 * @param {{
 *   placeholder: string,
 *   value: object|null,
 *   onChange: (place) => void,
 *   savedLocations: object,
 *   onSaveLocation: (label, place) => void,
 * }} props
 */
export function PlaceInput({ placeholder, value, onChange, savedLocations = {}, onSaveLocation }) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const wrapperRef = useRef(null)

  const { suggestions, isLoading } = usePlaceSearch(open && query ? query : '')

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setShowSaveMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInputChange(e) {
    setQuery(e.target.value)
    setOpen(true)
    setShowSaveMenu(false)
    if (!e.target.value) onChange(null)
  }

  function handleSelect(place) {
    setQuery(place.name)
    onChange(place)
    setOpen(false)
  }

  function handleFocus() {
    setOpen(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false)
      setShowSaveMenu(false)
    }
  }

  const hasSavedItems = SAVED_LABELS.some(({ key }) => savedLocations[key])
  const showSavedDropdown = open && !query && hasSavedItems
  const showSuggestions = open && !!query && (isLoading || suggestions.length > 0)

  return (
    <div className="place-input" ref={wrapperRef}>
      <div className="place-input__row">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {value && onSaveLocation && (
          <button
            type="button"
            className={`place-input__save-btn${showSaveMenu ? ' active' : ''}`}
            onClick={() => setShowSaveMenu((v) => !v)}
            title="즐겨찾기에 저장"
          >
            ⭐
          </button>
        )}
      </div>

      {showSaveMenu && (
        <div className="place-input__save-menu">
          {SAVED_LABELS.map(({ key, icon }) => (
            <button
              key={key}
              type="button"
              className="place-input__save-item"
              onMouseDown={() => {
                onSaveLocation(key, value)
                setShowSaveMenu(false)
              }}
            >
              {icon} <strong>{key}</strong>으로 저장
            </button>
          ))}
        </div>
      )}

      {showSavedDropdown && (
        <ul className="place-input__dropdown">
          <li className="place-input__section-header">즐겨찾기</li>
          {SAVED_LABELS.filter(({ key }) => savedLocations[key]).map(({ key, icon }) => (
            <li
              key={key}
              className="place-input__item place-input__item--saved"
              onMouseDown={() => handleSelect(savedLocations[key])}
            >
              <span className="place-input__saved-icon">{icon}</span>
              <div>
                <span className="place-input__name">{key}</span>
                <span className="place-input__address">{savedLocations[key].name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && (
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
