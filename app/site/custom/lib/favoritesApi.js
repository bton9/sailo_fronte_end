const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * 共用的收藏清單查詢邏輯，取代原本在 card.jsx、useFavoriteStatus.js、
 * useWishlist.js、MapWithMenu.jsx 四處各自重複的「先抓所有收藏清單，
 * 再逐一查詢每個清單內的景點」N+1 邏輯。
 *
 * 內部用 Promise.all 平行送出每個清單的查詢（原本四處實作皆用
 * for...of 依序 await，改成平行後總等待時間會明顯縮短，但實際
 * request 數量不變，N+1 的效能特性本身沒有改變）。
 */
async function fetchFavoriteListsWithPlaces(userId) {
  if (!userId) return []

  const res = await fetch(`${API_URL}/api/favorites/${userId}`)
  const data = await res.json()

  if (!data.success || !data.favorites) return []

  return Promise.all(
    data.favorites.map(async (list) => {
      const placesRes = await fetch(
        `${API_URL}/api/favorites/list/${list.list_id}`
      )
      const placesData = await placesRes.json()
      return {
        ...list,
        places: placesData.success && placesData.places ? placesData.places : [],
      }
    })
  )
}

/**
 * 檢查某個景點是否已被使用者加入任一收藏清單
 * （取代 card.jsx / useFavoriteStatus.js 的 fetchFavoriteStatus）
 */
export async function isPlaceFavorited(userId, placeId) {
  if (!userId) return false
  const targetId = parseInt(placeId)
  const lists = await fetchFavoriteListsWithPlaces(userId)
  return lists.some((list) => list.places.some((p) => p.place_id === targetId))
}

/**
 * 取得使用者所有收藏清單中，去重後的景點 ID 陣列
 * （取代 MapWithMenu.jsx 的 fetchUserFavorites）
 */
export async function getFavoritedPlaceIds(userId) {
  if (!userId) return []
  const lists = await fetchFavoriteListsWithPlaces(userId)
  const ids = new Set()
  lists.forEach((list) => list.places.forEach((p) => ids.add(p.place_id)))
  return Array.from(ids)
}

/**
 * 取得使用者所有收藏清單，並標註每個清單是否已包含指定景點
 * （取代 useWishlist.js 的 fetchLists）
 */
export async function getFavoriteListsWithStatus(userId, placeId) {
  if (!userId) return []
  const targetId = parseInt(placeId)
  const lists = await fetchFavoriteListsWithPlaces(userId)
  return lists.map(({ places, ...list }) => ({
    ...list,
    checked: places.some((p) => p.place_id === targetId),
  }))
}
