import { useState, useEffect } from 'react'
import { isPlaceFavorited } from '@/app/site/custom/lib/favoritesApi'

export function useFavoriteStatus(placeId, isOpen, userId) {
  const [isFavorited, setIsFavorited] = useState(false)

  const fetchFavoriteStatus = async () => {
    if (!userId) return
    try {
      setIsFavorited(await isPlaceFavorited(userId, placeId))
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
