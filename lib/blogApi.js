// lib/blogApi.js
// Auth V2: 使用 httpOnly cookies, 不使用 localStorage

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ==================== 資料標準化函式 ====================

/**
 * 標準化使用者資料（統一使用 user_id）
 */
const normalizeUser = (user) => {
  if (!user) return null
  return {
    ...user,
    user_id: user.user_id || user.id, //  支援 id 和 user_id
  }
}

/**
 * 標準化文章資料
 */
const normalizePost = (post) => {
  if (!post) return null

  return {
    ...post,
    //  標準化作者資料
    author: post.author
      ? {
          ...post.author,
          user_id: post.author.user_id || post.author.id,
        }
      : null,
  }
}

/**
 * 標準化 API 回應（處理 posts 陣列）
 */
const normalizeApiResponse = (response) => {
  if (!response || !response.data) return response

  // 如果回應中有 posts 陣列，標準化每一篇文章
  if (response.data.posts && Array.isArray(response.data.posts)) {
    response.data.posts = response.data.posts.map(normalizePost)
  }

  // 如果回應中有單一 post，標準化它
  if (response.data.post) {
    response.data.post = normalizePost(response.data.post)
  }

  // 如果回應中有 user，標準化它
  if (response.data.user) {
    response.data.user = normalizeUser(response.data.user)
  }

  return response
}

/**
 * API 請求函式
 * Auth V2: 使用 httpOnly cookies (不使用 localStorage)
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 自動帶上 httpOnly cookies
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, finalOptions)

    // 401 錯誤處理 (Auth V2: 不需手動清除 cookie)
    if (response.status === 401) {
      const error = new Error('請重新登入')
      error.status = 401
      throw error
    }

    const data = await response.json()

    if (!response.ok) {
      const error = new Error(data.message || '請求失敗')
      error.status = response.status
      throw error
    }

    //  標準化回應資料
    return normalizeApiResponse(data)
  } catch (error) {
    console.error('API 請求失敗:', error)
    throw error
  }
}

// ==================== 認證相關 API ====================
//  認證功能由 AuthContext 處理 (使用 Auth V2)
// AuthContext 使用 httpOnly cookies, 不使用 localStorage

// ==================== 文章相關 API ====================

/**
 * 取得文章列表
 */
export const getPosts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(`/api/blog/posts${queryString ? '?' + queryString : ''}`)
}

/**
 * 取得單一文章
 */
export const getPostById = async (postId, options = {}) => {
  const { incrementView = false } = options

  //  建立 query 參數
  const params = new URLSearchParams()
  if (incrementView) {
    params.append('increment_view', 'true')
  }

  const queryString = params.toString()
  const url = `/api/blog/posts/${postId}${queryString ? '?' + queryString : ''}`

  return apiRequest(url)
}

/**
 * 建立文章
 */
export const createPost = async (postData) => {
  return apiRequest('/api/blog/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  })
}

/**
 * 更新文章
 */
export const updatePost = async (postId, postData) => {
  try {
    // 分離 tags 和其他資料
    const { tags, ...postDataWithoutTags } = postData

    // 更新文章基本資訊
    await apiRequest(`/api/blog/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postDataWithoutTags),
    })

    // 處理 tags 更新
    if (tags !== undefined) {
      const currentPostResult = await getPostById(postId)
      const currentTags = currentPostResult.data.post.tags || []

      const currentTagNames = currentTags
        .map((tag) =>
          typeof tag === 'string' ? tag : tag.tagname || tag.name || ''
        )
        .filter(Boolean)

      const tagsToAdd = tags.filter((tag) => !currentTagNames.includes(tag))
      const tagsToRemove = currentTagNames.filter((tag) => !tags.includes(tag))

      if (tagsToAdd.length > 0) {
        await addTagsToPost(postId, tagsToAdd)
      }

      for (const tagName of tagsToRemove) {
        const tagObj = currentTags.find((t) => {
          const name = typeof t === 'string' ? t : t.tagname || t.name || ''
          return name === tagName
        })

        if (tagObj && tagObj.tag_id) {
          await removeTagFromPost(postId, tagObj.tag_id)
        }
      }
    }

    return await getPostById(postId)
  } catch (error) {
    console.error('更新文章失敗:', error)
    throw error
  }
}

/**
 * 刪除文章
 */
export const deletePost = async (postId) => {
  return apiRequest(`/api/blog/posts/${postId}`, {
    method: 'DELETE',
  })
}

/**
 * 取得使用者的文章列表
 */
export const getUserPosts = async (userId, params = {}) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getUserPosts: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/users/${userId}/posts${queryString ? '?' + queryString : ''}`
  )
}

/**
 * 取得使用者按讚的文章列表
 */
export const getUserLikedPosts = async (userId, params = {}) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getUserLikedPosts: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/users/${userId}/liked${queryString ? '?' + queryString : ''}`
  )
}

// ==================== 留言相關 API ====================

/**
 * 取得文章的留言列表
 */
export const getComments = async (postId, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/posts/${postId}/comments${queryString ? '?' + queryString : ''}`
  )
}

/**
 * 新增留言
 */
export const createComment = async (postId, content) => {
  return apiRequest(`/api/blog/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

/**
 * 更新留言
 */
export const updateComment = async (commentId, content) => {
  return apiRequest(`/api/blog/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

/**
 * 刪除留言
 */
export const deleteComment = async (commentId) => {
  return apiRequest(`/api/blog/comments/${commentId}`, {
    method: 'DELETE',
  })
}

// ==================== 互動功能 API ====================

/**
 * 按讚/取消按讚文章
 */
export const togglePostLike = async (postId) => {
  return apiRequest(`/api/blog/interactions/posts/${postId}/like`, {
    method: 'POST',
  })
}

/**
 * 按讚/取消按讚留言
 */
export const toggleCommentLike = async (commentId) => {
  return apiRequest(`/api/blog/interactions/comments/${commentId}/like`, {
    method: 'POST',
  })
}

/**
 * 收藏/取消收藏文章
 */
export const toggleBookmark = async (postId) => {
  return apiRequest(`/api/blog/interactions/posts/${postId}/bookmark`, {
    method: 'POST',
  })
}

/**
 * 取得使用者收藏列表
 */
export const getUserBookmarks = async (userId, params = {}) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getUserBookmarks: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/users/${userId}/bookmarks${queryString ? '?' + queryString : ''}`
  )
}

// ==================== 追蹤功能 API ====================

/**
 * 追蹤/取消追蹤使用者
 */
export const toggleFollow = async (userId) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' toggleFollow: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  return apiRequest(`/api/blog/users/${userId}/follow`, {
    method: 'POST',
  })
}

/**
 * 檢查是否追蹤某使用者
 */
export const checkFollowStatus = async (userId) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' checkFollowStatus: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  return apiRequest(`/api/blog/users/${userId}/follow-status`)
}

/**
 * 取得使用者統計資料
 */
export const getUserStats = async (userId) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getUserStats: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  const result = await apiRequest(`/api/blog/users/${userId}/stats`)

  //  標準化 user 資料
  if (result.data && result.data.user) {
    result.data.user = normalizeUser(result.data.user)
  }

  return result
}

/**
 * 取得追蹤者列表
 */
export const getFollowers = async (userId, params = {}) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getFollowers: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/users/${userId}/followers${queryString ? '?' + queryString : ''}`
  )
}

/**
 * 取得追蹤中列表
 */
export const getFollowing = async (userId, params = {}) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getFollowing: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/users/${userId}/following${queryString ? '?' + queryString : ''}`
  )
}

// ==================== 標籤系統 API ====================

/**
 * 取得所有標籤列表
 */
export const getAllTags = async (limit) => {
  const queryString = limit ? `?limit=${limit}` : ''
  return apiRequest(`/api/blog/tags${queryString}`)
}

/**
 * 搜尋標籤
 */
export const searchTags = async (keyword) => {
  return apiRequest(`/api/blog/tags/search?q=${encodeURIComponent(keyword)}`)
}

/**
 * 取得指定標籤的文章列表
 */
export const getPostsByTag = async (tagId, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/tags/${tagId}/posts${queryString ? '?' + queryString : ''}`
  )
}

/**
 * 新增標籤到文章
 */
export const addTagsToPost = async (postId, tags) => {
  return apiRequest(`/api/blog/tags/posts/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  })
}

/**
 * 從文章移除標籤
 */
export const removeTagFromPost = async (postId, tagId) => {
  return apiRequest(`/api/blog/tags/posts/${postId}/${tagId}`, {
    method: 'DELETE',
  })
}

// ==================== 圖片上傳 API ====================

/**
 * 上傳圖片
 * Auth V2: 使用 httpOnly cookies
 */
export const uploadPhoto = async (file) => {
  // 將檔案轉換為 Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const base64 = await fileToBase64(file)

  const response = await fetch(`${API_BASE_URL}/api/blog/photos/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64 }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || '圖片上傳失敗')
  }

  return data
}
/**
 * 取得文章的所有圖片
 */
export const getPostPhotos = async (postId) => {
  return apiRequest(`/api/blog/photos/posts/${postId}`)
}

/**
 * 將圖片關聯到文章
 */
export const addPhotoToPost = async (postId, url) => {
  return apiRequest(`/api/blog/photos/posts/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

/**
 * 刪除圖片
 */
export const deletePhoto = async (photoId) => {
  return apiRequest(`/api/blog/photos/${photoId}`, {
    method: 'DELETE',
  })
}

// ==================== 搜尋功能 API ====================

/**
 * 全站搜尋
 */
export const search = async (keyword, type = 'all', params = {}) => {
  const allParams = { q: keyword, type, ...params }
  const queryString = new URLSearchParams(allParams).toString()
  return apiRequest(`/api/blog/search?${queryString}`)
}

/**
 * 取得熱門搜尋關鍵字
 */
export const getTrendingKeywords = async (limit = 10) => {
  return apiRequest(`/api/blog/search/trending?limit=${limit}`)
}

// ==================== 行程相關 API ====================

/**
 * 取得使用者的行程列表
 */
export const getUserItineraries = async (userId) => {
  if (!userId || isNaN(parseInt(userId))) {
    console.error(' getUserItineraries: userId 無效:', userId)
    throw new Error('使用者 ID 無效')
  }
  return apiRequest(`/api/blog/users/${userId}/itineraries`)
}

/**
 * 取得單一行程詳細資訊
 */
export const getItineraryById = async (tripId) => {
  return apiRequest(`/api/blog/itineraries/${tripId}`)
}

/**
 * 取得行程的文章列表
 */
export const getItineraryPosts = async (tripId, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/blog/itineraries/${tripId}/posts${queryString ? '?' + queryString : ''}`
  )
}

/**
 * 複製行程
 */
export const copyItinerary = async (tripId) => {
  return apiRequest(`/api/blog/itineraries/${tripId}/copy`, {
    method: 'POST',
  })
}

// ==================== 工具函式 ====================

/**
 * 檢查是否已登入
 * Auth V2: 使用 AuthContext 提供的 user 狀態
 * 此函式已廢棄,請改用 AuthContext 的 user 狀態
 * @deprecated 請使用 AuthContext 的 user 狀態
 */
export const isLoggedIn = () => {
  console.warn(' isLoggedIn() 已廢棄,請改用 AuthContext 的 user 狀態')
  return false
}

/**
 * 取得當前使用者資訊
 * Auth V2: 使用 AuthContext 提供的 user 狀態
 * 此函式已廢棄,請改用 AuthContext 的 user 狀態
 * @deprecated 請使用 AuthContext 的 user 狀態
 */
export const getCurrentUser = () => {
  console.warn(' getCurrentUser() 已廢棄,請改用 AuthContext 的 user 狀態')
  return null
}

// ==================== 景點相關 API ====================

/**
 * 取得景點列表
 * @param {Object} params - 查詢參數 { keyword, category, location_id }
 */
export const getPlaces = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(`/api/places${queryString ? '?' + queryString : ''}`)
}

/**
 * 取得單一景點（含地點名稱）
 */
export const getPlaceById = async (placeId) => {
  return apiRequest(`/api/places/with-location/${placeId}`)
}
