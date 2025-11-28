import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export function usePlaceDetail(placeId, isOpen) {
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !placeId) return

    const fetchPlace = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_URL}/api/places/with-location/${placeId}`
        )

        if (!res.ok) {
          console.error('API 錯誤:', res.status)
          setPlace(null)
          return
        }

        const data = await res.json()

        if (data.success && data.data) {
          setPlace(data.data)
        } else {
          setPlace(null)
        }
      } catch (err) {
        console.error('載入景點資料失敗:', err)
        setPlace(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [placeId, isOpen])

  return { place, loading }
}
