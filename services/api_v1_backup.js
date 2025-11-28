const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * 通用 API 請求函數
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // 如果有 token，加入 Authorization header
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      console.log(data.message || 'API request failed')
    }

    return data
  } catch (error) {
    console.error(' API Error:', error)
    throw error
  }
}

/**
 * 認證 API
 */
export const authAPI = {
  /**
   * 登入
   * @param {string} email - Email 帳號
   * @param {string} password - 密碼
   * @param {string|null} token2fa - Google Authenticator 驗證碼 (選填)
   * @param {string|null} captchaToken - 圖形驗證 Token (選填)
   * @returns {Promise<Object>} { success, message, token, user, requires2FA }
   */
  login: async (email, password, token2fa = null, captchaToken = null) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, token2fa, captchaToken }),
    })
  },

  /**
   * 註冊新帳號
   *
   * @param {Object} userData - 註冊資料
   * @param {string} userData.email - Email (必填)
   * @param {string} userData.password - 密碼 (必填)
   * @param {string} [userData.nickname] - 暱稱 (選填)
   * @param {string} [userData.phone] - 電話 (選填)
   * @returns {Promise<Object>} { success, message }
   *
   * 更新說明：
   * - 已移除 name 欄位
   * - nickname 為選填，將作為使用者顯示名稱
   * - 後端會自動產生預設名稱 (nickname 或 email 前綴)
   */
  register: async (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  /**
   * 登出
   * @returns {Promise<Object>} { success, message }
   */
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    })
  },

  /**
   * 驗證 Token
   * @returns {Promise<Object>} { valid, user }
   */
  verify: async () => {
    return apiRequest('/api/auth/verify', {
      method: 'POST',
    })
  },

  /**
   * 忘記密碼 - 發送重置郵件
   * @param {string} email - Email 帳號
   * @returns {Promise<Object>} { success, message }
   */
  forgotPassword: async (email) => {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  /**
   * 重置密碼
   * @param {string} token - 重置 Token
   * @param {string} newPassword - 新密碼
   * @returns {Promise<Object>} { success, message }
   */
  resetPassword: async (token, newPassword) => {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  },

  /**
   * Google 登入 - 導向 Google OAuth
   * 注意：此方法會直接導向，不是 API 呼叫
   */
  googleLogin: () => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.location.href = `${API_BASE_URL}/api/auth/google`
  },
}

/**
 * 使用者資料 API
 */
export const userAPI = {
  /**
   * 更新暱稱
   * @param {string} nickname - 新暱稱
   * @returns {Promise<Object>} { success, message, user }
   */
  updateNickname: async (nickname) => {
    return apiRequest('/api/user/update-nickname', {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    })
  },

  /**
   * 更新個人資料
   * @param {Object} profileData - 個人資料
   * @param {string} profileData.name - 姓名 (必填)
   * @param {string} [profileData.phone] - 手機號碼 (選填)
   * @param {string} [profileData.birthday] - 生日 YYYY-MM-DD (選填)
   * @param {string} [profileData.gender] - 性別 male/female/other (選填)
   * @returns {Promise<Object>} { success, message, user }
   */
  updateProfile: async (profileData) => {
    return apiRequest('/api/user/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  /**
   * 上傳頭像
   * @param {File} file - 圖片檔案
   * @returns {Promise<Object>} { success, message, avatarUrl }
   *
   * 注意：
   * - 使用 FormData 傳送檔案
   * - 不需要設定 Content-Type（瀏覽器會自動設定為 multipart/form-data）
   * - 需要 Bearer Token 驗證
   */
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = localStorage.getItem('authToken')
    const url = `${API_BASE_URL}/api/user/upload-avatar`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // 不設定 Content-Type，讓瀏覽器自動設定
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '上傳失敗')
      }

      return data
    } catch (error) {
      console.error(' 上傳頭像錯誤:', error)
      throw error
    }
  },

  /**
   * 刪除頭像
   * @returns {Promise<Object>} { success, message }
   */
  deleteAvatar: async () => {
    return apiRequest('/api/user/delete-avatar', {
      method: 'DELETE',
    })
  },

  /**
   * 更新密碼
   * @param {Object} passwordData - 密碼資料
   * @param {string} passwordData.currentPassword - 目前密碼 (必填)
   * @param {string} passwordData.newPassword - 新密碼 (必填，至少8字元)
   * @param {string} passwordData.confirmPassword - 確認新密碼 (必填)
   * @returns {Promise<Object>} { success, message }
   *
   * @example
   * await userAPI.updatePassword({
   *   currentPassword: 'OldPass123',
   *   newPassword: 'NewPass456',
   *   confirmPassword: 'NewPass456'
   * })
   */
  updatePassword: async (passwordData) => {
    return apiRequest('/api/user/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  },
}

/**
 * Google Authenticator (2FA) API
 */
export const twoFactorAPI = {
  /**
   * 啟用 Google Authenticator
   * @returns {Promise<Object>} { success, qrCode, secret, backupCodes }
   */
  enable: async () => {
    return apiRequest('/api/auth/2fa/enable', {
      method: 'POST',
    })
  },

  /**
   * 驗證並確認啟用
   * @param {string} token - 6 位數驗證碼
   * @returns {Promise<Object>} { success, message }
   */
  verify: async (token) => {
    return apiRequest('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },

  /**
   * 停用 Google Authenticator
   * @param {string} password - 使用者密碼
   * @returns {Promise<Object>} { success, message }
   */
  disable: async (password) => {
    return apiRequest('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  /**
   * 取得 2FA 狀態
   * @returns {Promise<Object>} { success, enabled, hasBackupCodes }
   */
  getStatus: async () => {
    return apiRequest('/api/auth/2fa/status', {
      method: 'GET',
    })
  },
}

// ============ 預設匯出 ============
const api = {
  auth: authAPI,
  user: userAPI,
  twoFactor: twoFactorAPI,
}

export default api
