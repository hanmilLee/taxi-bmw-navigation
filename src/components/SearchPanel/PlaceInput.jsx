import { useState, useRef, useEffect } from 'react'
import { usePlaceSearch } from '../../hooks/usePlaceSearch'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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
 *   className?: string,
 *   savedLocations: object,
 *   onSaveLocation: (label, place) => void,
 * }} props
 */
export function PlaceInput({
  placeholder,
  value,
  onChange,
  className,
  savedLocations = {},
  onSaveLocation,
}) {
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
    <div className={cn('relative w-full', className)} ref={wrapperRef}>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="h-12 rounded-lg px-4 text-sm md:h-14 md:text-base"
        />
        {value && onSaveLocation && (
          <button
            type="button"
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-sm transition md:h-14 md:w-14 md:text-base',
              showSaveMenu && 'border-amber-400 bg-amber-50'
            )}
            onClick={() => setShowSaveMenu((v) => !v)}
            title="즐겨찾기에 저장"
          >
            ⭐
          </button>
        )}
      </div>

      {showSaveMenu && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-[130] overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {SAVED_LABELS.map(({ key, icon }) => (
            <button
              key={key}
              type="button"
              className="block w-full cursor-pointer whitespace-nowrap px-4 py-2.5 text-left text-sm text-popover-foreground hover:bg-muted"
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
        <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-[120] max-h-64 list-none overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md">
          <li className="px-3 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            즐겨찾기
          </li>
          {SAVED_LABELS.filter(({ key }) => savedLocations[key]).map(({ key, icon }) => (
            <li
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              onMouseDown={() => handleSelect(savedLocations[key])}
            >
              <span className="text-base leading-none">{icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-popover-foreground">{key}</span>
                <span className="text-xs text-muted-foreground">{savedLocations[key].name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && (
        <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-[120] max-h-64 list-none overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md">
          {isLoading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">검색 중...</li>
          )}
          {suggestions.map((place, i) => (
            <li
              key={i}
              className="flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-muted"
              onMouseDown={() => handleSelect(place)}
            >
              <span className="text-sm font-medium text-popover-foreground">{place.name}</span>
              <span className="text-xs text-muted-foreground">{place.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
