import { useState } from 'react'

const STORAGE_KEY = 'tsm_saved_locations'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

/**
 * 집/직장 위치를 localStorage에 저장/불러오는 훅
 * @returns {{ locations: object, save: (label, place) => void, remove: (label) => void }}
 */
export function useSavedLocations() {
  const [locations, setLocations] = useState(load)

  function save(label, place) {
    const next = { ...locations, [label]: place }
    setLocations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function remove(label) {
    const { [label]: _, ...next } = locations
    setLocations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return { locations, save, remove }
}
