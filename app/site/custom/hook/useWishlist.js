// ==================== hooks/useWishlist.js ====================
import { useState, useEffect } from 'react'

const BACKEND_URL = 'http://localhost:5000'

export function useWishlist(userId, placeId, isOpen) {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchLists = async () => {
    if (!isOpen || !userId) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/favorites/${userId}`)
      const data = await res.json()

      if (!data.success || !data.favorites) {
        setLists([])
        return
      }

      const listsWithStatus = await Promise.all(
        data.favorites.map(async (list) => {
          const placesRes = await fetch(
            `${BACKEND_URL}/api/favorites/list/${list.list_id}`
          )
          const placesData = await placesRes.json()
          const isChecked =
            placesData.success &&
            placesData.places.some((p) => p.place_id === parseInt(placeId))
          return { ...list, checked: isChecked }
        })
      )
      setLists(listsWithStatus)
    } catch (err) {
      console.error('❌ 載入收藏清單失敗:', err)
      setLists([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists()
  }, [isOpen, userId, placeId])

  const toggleList = async (listId) => {
    const updatedLists = lists.map((list) =>
      list.list_id === listId ? { ...list, checked: !list.checked } : list
    )
    setLists(updatedLists)

    try {
      const res = await fetch(`${BACKEND_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, placeId: parseInt(placeId) }),
      })
      const data = await res.json()

      if (!data.success) {
        setLists(lists)
        return { success: false }
      }
      return { success: true, action: data.action }
    } catch (err) {
      setLists(lists)
      return { success: false }
    }
  }

  const createList = async (name, description) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/favorites/list/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, description }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchLists()
      }
      return data
    } catch {
      return { success: false }
    }
  }

  const deleteList = async (listId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/favorites/${userId}/list/${listId}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (data.success) {
        setLists((prev) => prev.filter((list) => list.list_id !== listId))
      }
      return data
    } catch (err) {
      return { success: false }
    }
  }

  return { lists, loading, toggleList, createList, deleteList }
}
