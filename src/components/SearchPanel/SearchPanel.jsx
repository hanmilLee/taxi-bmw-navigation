import { useState } from 'react'
import { ArrowRightLeft, CircleDot, Navigation } from 'lucide-react'
import { PlaceInput } from './PlaceInput'
import { useSavedLocations } from '../../hooks/useSavedLocations'
import { Button } from '@/components/ui/button'

/**
 * @param {{ onSearch: (origin, destination) => void, isLoading: boolean }} props
 */
export function SearchPanel({ onSearch, isLoading }) {
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const { locations, save } = useSavedLocations()

  function handleSubmit(e) {
    e.preventDefault()
    if (origin && destination) {
      onSearch(origin, destination)
    }
  }

  function handleSwap() {
    setOrigin(destination)
    setDestination(origin)
  }

  const canSearch = origin && destination && !isLoading
  const canSwap = (origin || destination) && !isLoading

  return (
    <form className="space-y-2 sm:space-y-0" onSubmit={handleSubmit}>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)_8rem] sm:items-center">
        <PlaceInput
          className="min-w-0"
          icon={CircleDot}
          placeholder="출발지를 입력하세요"
          value={origin}
          onChange={setOrigin}
          savedLocations={locations}
          onSaveLocation={save}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="hidden h-10 w-10 rounded-xl sm:inline-flex"
          onClick={handleSwap}
          disabled={!canSwap}
          title="출발지/도착지 바꾸기"
        >
          <ArrowRightLeft className="size-4" />
        </Button>
        <PlaceInput
          className="min-w-0"
          icon={Navigation}
          placeholder="도착지를 입력하세요"
          value={destination}
          onChange={setDestination}
          savedLocations={locations}
          onSaveLocation={save}
        />
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-xl px-5 text-sm font-semibold md:h-11 md:px-6 md:text-[15px]"
          disabled={!canSearch}
        >
          {isLoading ? '계산 중...' : '경로 검색'}
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full rounded-xl sm:hidden"
        onClick={handleSwap}
        disabled={!canSwap}
      >
        <ArrowRightLeft className="size-3.5" />
        출발지/도착지 바꾸기
      </Button>
    </form>
  )
}
