// hook/custom/useSearch.js
import { useEffect, useState } from 'react'

export function useSearch(places) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPlaces, setFilteredPlaces] = useState([])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlaces(places)
    } else {
      setFilteredPlaces(
        places.filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, places])

  return { searchTerm, setSearchTerm, filteredPlaces }
}
