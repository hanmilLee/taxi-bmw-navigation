import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
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

  const canSearch = origin && destination && !isLoading

  return (
    <form
      className="rounded-xl border bg-card p-2.5 md:p-3"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:items-center sm:gap-2.5">
        <PlaceInput
          className="min-w-0"
          placeholder="출발지를 입력하세요"
          value={origin}
          onChange={setOrigin}
          savedLocations={locations}
          onSaveLocation={save}
        />
        <div className="hidden h-12 w-12 items-center justify-center rounded-lg border bg-muted text-muted-foreground sm:flex md:h-14 md:w-14">
          <ArrowRightLeft className="size-4" />
        </div>
        <PlaceInput
          className="min-w-0"
          placeholder="도착지를 입력하세요"
          value={destination}
          onChange={setDestination}
          savedLocations={locations}
          onSaveLocation={save}
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl px-5 text-sm font-semibold sm:w-auto md:h-14 md:px-6 md:text-[15px]"
          disabled={!canSearch}
        >
          {isLoading ? '계산 중...' : '경로 검색'}
        </Button>
      </div>
    </form>
  )
}
