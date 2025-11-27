/**
 * 行程管理 API - 完整修正版 (Auth V2)
 */

// ========== API Base URLs ==========
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const API_BASE_URL = `${BACKEND_URL}/api/trip-management`
const FAVORITE_BASE_URL = `${BACKEND_URL}/api/trip-favorites`
const UPLOAD_BASE_URL = `${BACKEND_URL}/api/trip-upload`

// ========== 統一錯誤處理 ==========
const handleResponse = async (response) => {
  const data = await response.json()

  // ✅ 若後端回傳「此行程已收藏」，不當成錯誤
  if (!response.ok) {
    if (data.message && data.message.includes('已收藏')) {
      return data // 不丟出例外，只回傳
    }
    throw new Error(data.message || '請求失敗')
  }

  return data
}

// ==================== 行程管理 API ====================

/**
 * 建立新行程
 */
export const createTrip = async (tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('建立行程錯誤:', error)
    throw error
  }
}

/**
 * 取得使用者的所有行程
 * @param {number} userId - 使用者 ID
 * @param {string} sortBy - 排序欄位 (created_at, start_date, trip_name)
 */
export const getUserTrips = async (userId, sortBy = 'created_at') => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trips/user/${userId}?sort=${sortBy}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error('取得使用者行程錯誤:', error)
    throw error
  }
}

/**
 * 取得單一行程詳細資料
 */
export const getTripDetail = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('取得行程詳細錯誤:', error)
    throw error
  }
}

/**
 * 更新行程
 */
export const updateTrip = async (tripId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('更新行程錯誤:', error)
    throw error
  }
}

/**
 * 刪除行程
 */
export const deleteTrip = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('刪除行程錯誤:', error)
    throw error
  }
}

/**
 * 複製行程
 */
export const copyTrip = async (tripId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('複製行程錯誤:', error)
    throw error
  }
}

/**
 * 搜尋行程
 */
export const searchTrips = async (
  keyword,
  locationId = null,
  isPublic = null
) => {
  try {
    const params = new URLSearchParams()

    if (keyword) params.append('keyword', keyword)
    if (locationId) params.append('location_id', locationId)
    if (isPublic !== null) params.append('is_public', isPublic ? '1' : '0')

    const response = await fetch(
      `${API_BASE_URL}/trips/search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error('搜尋行程錯誤:', error)
    throw error
  }
}

/**
 * 取得公開行程列表
 */
export const getPublicTrips = async (
  locationId = null,
  sortBy = 'created_at'
) => {
  try {
    const params = new URLSearchParams()

    if (locationId) params.append('location_id', locationId)
    params.append('sort', sortBy)

    const response = await fetch(
      `${API_BASE_URL}/trips/public?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error('取得公開行程錯誤:', error)
    throw error
  }
}

// ==================== 景點管理 API ====================

/**
 * 新增景點到某一天
 */
export const addPlaceToDay = async (tripDayId, placeData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trips/days/${tripDayId}/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placeData),
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error('新增景點錯誤:', error)
    throw error
  }
}

/**
 * 刪除景點
 */
export const removePlaceFromTrip = async (tripItemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/items/${tripItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('刪除景點錯誤:', error)
    throw error
  }
}

/**
 * 更新景點順序
 */
export const updatePlaceOrder = async (tripItemId, sortOrder) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trips/items/${tripItemId}/order`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sort_order: sortOrder }),
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error('更新景點順序錯誤:', error)
    throw error
  }
}

// ==================== 收藏功能 API ====================

/**
 * ✅ 收藏行程 - 修正版
 * 檢查後端 API 格式,可能需要調整
 */
export const addFavorite = async (userId, tripId) => {
  try {
    console.log('🔄 addFavorite 呼叫:', { userId, tripId })
    console.log('📍 API URL:', FAVORITE_BASE_URL)

    const response = await fetch(FAVORITE_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        trip_id: tripId,
      }),
    })

    console.log('📦 Response status:', response.status)
    const result = await handleResponse(response)
    console.log('✅ addFavorite 成功:', result)

    return result
  } catch (error) {
    console.error('❌ 收藏行程錯誤:', error)
    console.error('錯誤詳情:', {
      message: error.message,
      userId,
      tripId,
      url: FAVORITE_BASE_URL,
    })
    throw error
  }
}

/**
 * ✅ 取消收藏 - 修正版
 * 方案 1: URL 參數 (RESTful 標準)
 * 方案 2: Query 參數
 * 方案 3: Request Body (如果後端支援)
 */
export const removeFavorite = async (userId, tripId) => {
  try {
    console.log('🔄 removeFavorite 呼叫:', { userId, tripId })

    // ✅ 方案 1: 使用 URL 參數 (推薦,符合 RESTful)
    const url = `${FAVORITE_BASE_URL}/${userId}/${tripId}`
    console.log('📍 DELETE URL:', url)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      // ⚠️ DELETE 通常不帶 body
    })

    console.log('📦 Response status:', response.status)
    const result = await handleResponse(response)
    console.log('✅ removeFavorite 成功:', result)

    return result

    /* 
    // ❌ 方案 2: 使用 Query 參數 (如果後端這樣設計)
    const url = `${FAVORITE_BASE_URL}?user_id=${userId}&trip_id=${tripId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    */

    /*
    // ❌ 方案 3: 使用 Request Body (不標準,但有些 API 這樣設計)
    const response = await fetch(FAVORITE_BASE_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, trip_id: tripId }),
    })
    */
  } catch (error) {
    console.error('❌ 取消收藏錯誤:', error)
    console.error('錯誤詳情:', {
      message: error.message,
      userId,
      tripId,
      url: `${FAVORITE_BASE_URL}/${userId}/${tripId}`,
    })
    throw error
  }
}

/**
 * 取得使用者收藏的行程列表
 */
export const getUserFavorites = async (userId) => {
  try {
    const response = await fetch(`${FAVORITE_BASE_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('取得收藏列表錯誤:', error)
    throw error
  }
}

// ==================== 圖片上傳 API ====================

/**
 * 上傳行程封面圖
 */
export const uploadTripCover = async (file) => {
  try {
    const formData = new FormData()
    formData.append('cover_image', file)

    const response = await fetch(`${UPLOAD_BASE_URL}/cover`, {
      method: 'POST',
      body: formData,
      // 注意: 不要設定 Content-Type header,讓瀏覽器自動設定
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('上傳封面圖錯誤:', error)
    throw error
  }
}

/**
 * 刪除圖片
 */
export const deleteImage = async (fileId) => {
  try {
    const response = await fetch(`${UPLOAD_BASE_URL}/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('刪除圖片錯誤:', error)
    throw error
  }
}

// ==================== 導出所有 API ====================
export default {
  // 行程管理
  createTrip,
  getUserTrips,
  getTripDetail,
  updateTrip,
  deleteTrip,
  copyTrip,
  searchTrips,
  getPublicTrips,
  // 景點管理
  addPlaceToDay,
  removePlaceFromTrip,
  updatePlaceOrder,
  // 收藏功能
  addFavorite,
  removeFavorite,
  getUserFavorites,
  // 圖片上傳
  uploadTripCover,
  deleteImage,
}
