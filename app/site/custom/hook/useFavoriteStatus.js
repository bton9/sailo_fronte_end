import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export function useFavoriteStatus(placeId, isOpen, userId) {
  const [isFavorited, setIsFavorited] = useState(false)

  const fetchFavoriteStatus = async () => {
    if (!userId) return

    try {
      const res = await fetch(`${API_URL}/api/favorites/${userId}`)
      const data = await res.json()

      if (!data.success || !data.favorites) {
        setIsFavorited(false)
        return
      }

      let isInAnyList = false
      for (const list of data.favorites) {
        const placesRes = await fetch(
          `${API_URL}/api/favorites/list/${list.list_id}`
        )
        const placesData = await placesRes.json()

        if (
          placesData.success &&
          placesData.places.some((p) => p.place_id === parseInt(placeId))
        ) {
          isInAnyList = true
          break
        }
      }

      setIsFavorited(isInAnyList)
    } catch (err) {
      console.error('載入收藏狀態失敗:', err)
      setIsFavorited(false)
    }
  }

  useEffect(() => {
    if (placeId && isOpen) {
      fetchFavoriteStatus()
    }
  }, [placeId, isOpen, userId])

  return { isFavorited, fetchFavoriteStatus }
}
