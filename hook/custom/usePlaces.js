// hook/custom/usePlaces.js
import { useEffect, useState } from 'react'

export function usePlaces(backendUrl) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${backendUrl}/api/places`)
        const data = await res.json()
        if (data.success) {
          setPlaces(data.data)
        } else {
          setError('無法載入景點資料')
        }
      } catch (err) {
        console.error('無法載入景點:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaces()
  }, [backendUrl])

  return { places, loading, error }
}
