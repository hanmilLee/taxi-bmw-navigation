import { useState, useRef, useEffect } from 'react'
import { BookmarkPlus, BriefcaseBusiness, House } from 'lucide-react'
import { usePlaceSearch } from '../../hooks/usePlaceSearch'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SAVED_LABELS = [
  { key: '집', Icon: House },
  { key: '직장', Icon: BriefcaseBusiness },
]

/**
 * 장소 검색 자동완성 입력 컴포넌트
 * @param {{
 *   placeholder: string,
 *   value: object|null,
 *   onChange: (place) => void,
 *   icon?: React.ComponentType<{ className?: string }>,
 *   className?: string,
 *   savedLocations: object,
 *   onSaveLocation: (label, place) => void,
 * }} props
 */
export function PlaceInput({
  placeholder,
  value,
  onChange,
  icon: LeadingIcon = null,
  className,
  savedLocations = {},
  onSaveLocation,
}) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const wrapperRef = useRef(null)

  const { suggestions, isLoading } = usePlaceSearch(open && query ? query : '')

  // 외부 상태(예: 출발지/도착지 스왑) 변경 시 입력창 텍스트 동기화
  useEffect(() => {
    const nextQuery = value?.name ?? ''
    setQuery((prev) => (prev === nextQuery ? prev : nextQuery))
  }, [value?.name])

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
      <div className="relative">
        {LeadingIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3 z-[2] -translate-y-1/2 text-muted-foreground">
            <LeadingIcon className="size-4" />
          </span>
        )}
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={cn(
            'h-11 rounded-xl border-border/80 bg-background/95 text-[15px] shadow-xs md:h-11 md:text-base',
            LeadingIcon ? 'pl-9' : 'pl-4',
            value && onSaveLocation ? 'pr-12 md:pr-14' : 'pr-4'
          )}
        />
        {value && onSaveLocation && (
          <button
            type="button"
            className={cn(
              'absolute top-1/2 right-2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground md:h-9 md:w-9',
              showSaveMenu && 'border-border bg-muted text-foreground'
            )}
            onClick={() => setShowSaveMenu((v) => !v)}
            title="즐겨찾기에 저장"
          >
            <BookmarkPlus className="size-4" />
          </button>
        )}
      </div>

      {showSaveMenu && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-[130] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {SAVED_LABELS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap px-4 py-2.5 text-left text-sm text-popover-foreground hover:bg-muted"
              onMouseDown={() => {
                onSaveLocation(item.key, value)
                setShowSaveMenu(false)
              }}
            >
              <item.Icon className="size-4 text-muted-foreground" />
              <span><strong>{item.key}</strong>으로 저장</span>
            </button>
          ))}
        </div>
      )}

      {showSavedDropdown && (
        <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-[120] max-h-64 list-none overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          <li className="px-3 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            즐겨찾기
          </li>
          {SAVED_LABELS.filter((item) => savedLocations[item.key]).map((item) => (
            <li
              key={item.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              onMouseDown={() => handleSelect(savedLocations[item.key])}
            >
              <item.Icon className="size-4 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-popover-foreground">{item.key}</span>
                <span className="text-xs text-muted-foreground">{savedLocations[item.key].name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && (
        <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-[120] max-h-64 list-none overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
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
