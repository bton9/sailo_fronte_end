/**
 * API 服務模組 (OAuth 2.0 版本)
 * 路徑: sailo/services/apiV2.js
 *
 * 功能：
 * - 使用 httpOnly cookie 進行認證
 * - 自動處理 Token Refresh
 * - 不使用 localStorage
 * - 支援 OAuth 2.0 標準流程
 *
 * 重要改變：
 * 1. 移除所有 localStorage 操作
 * 2. 改用 credentials: 'include' 傳送 cookies
 * 3. Token 由後端透過 httpOnly cookie 管理
 * 4. 新增 Token Refresh 自動處理
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const API_VERSION = '/api/v2' // OAuth 2.0 版本端點

/**
 * 通用 API 請求函數 (OAuth 2.0 版本)
 *
 * 改進：
 * - 使用 credentials: 'include' 自動傳送 httpOnly cookies
 * - 不再從 localStorage 讀取 token
 * - 自動處理 401 錯誤並嘗試刷新 token
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${API_VERSION}${endpoint}`

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 重要：允許傳送 httpOnly cookies
  }

  try {
    let response = await fetch(url, config)

    // 如果是 401 錯誤，嘗試刷新 token
    if (response.status === 401) {
      const refreshSuccess = await refreshToken()

      if (refreshSuccess) {
        // Token 刷新成功，重新發送請求
        response = await fetch(url, config)
      } else {
        // Token 刷新失敗，拋出錯誤
        console.log('Token 已過期，請重新登入')
      }
    }

    // 檢查 Content-Type 是否為 JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // 如果不是 JSON，可能是 HTML 錯誤頁面
      const text = await response.text()
      console.error(' API 返回非 JSON 內容:', text.substring(0, 200))
      throw new Error(`API 錯誤 (${response.status}): 端點不存在或伺服器錯誤`)
    }

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
 * 刷新 Access Token
 *
 * OAuth 2.0 Token Refresh 流程：
 * 1. 呼叫後端 /api/v2/auth/refresh
 * 2. 後端從 httpOnly cookie 讀取 Refresh Token
 * 3. 驗證並產生新的 Access Token 和 Refresh Token
 * 4. 更新 httpOnly cookies
 *
 * @returns {Promise<boolean>} 是否刷新成功
 */
async function refreshToken() {
  try {
    const response = await fetch(`${API_BASE_URL}${API_VERSION}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // 重要：傳送 Refresh Token cookie
    })

    if (response.ok) {
      console.log('✅ Token 刷新成功')
      return true
    } else {
      console.warn('⚠️ Token 刷新失敗')
      return false
    }
  } catch (error) {
    console.error(' Token refresh error:', error)
    return false
  }
}

/**
 * 認證 API (OAuth 2.0 版本)
 */
export const authAPI = {
  /**
   * 登入
   *
   * OAuth 2.0 流程：
   * 1. 發送登入請求
   * 2. 後端驗證成功後設定 httpOnly cookies
   * 3. 前端不需要手動儲存 token
   *
   * @param {string} email - Email 帳號
   * @param {string} password - 密碼
   * @param {string|null} token2fa - Google Authenticator 驗證碼 (選填)
   * @param {string|null} captchaToken - 圖形驗證 Token (選填)
   * @returns {Promise<Object>} { success, message, user, requires2FA }
   */
  login: async (email, password, token2fa = null, captchaToken = null) => {
    return apiRequest('/auth/login', {
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
   */
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  /**
   * 登出
   *
   * OAuth 2.0 流程：
   * 1. 呼叫後端登出 API
   * 2. 後端撤銷 Session 和 Refresh Token
   * 3. 後端清除所有 httpOnly cookies
   *
   * @returns {Promise<Object>} { success, message }
   */
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  /**
   * 驗證 Token
   *
   * 改進：從 httpOnly cookie 讀取 token
   *
   * @returns {Promise<Object>} { valid, user }
   */
  verify: async () => {
    return apiRequest('/auth/verify', {
      method: 'POST',
    })
  },

  /**
   * 刷新 Access Token
   *
   * @returns {Promise<Object>} { success, message }
   */
  refresh: refreshToken,

  /**
   * 取得所有活躍 Sessions
   *
   * @returns {Promise<Object>} { success, sessions }
   */
  getSessions: async () => {
    return apiRequest('/auth/sessions', {
      method: 'GET',
    })
  },

  /**
   * 撤銷指定 Session
   *
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} { success, message }
   */
  revokeSession: async (sessionId) => {
    return apiRequest(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  },

  /**
   * 撤銷所有 Sessions (全部登出)
   *
   * @returns {Promise<Object>} { success, message, count }
   */
  revokeAllSessions: async () => {
    return apiRequest('/auth/sessions/revoke-all', {
      method: 'POST',
    })
  },

  /**
   * ========================================
   * 忘記密碼 - 發送 OTP 到信箱
   * ========================================
   *
   * 流程：發送 6 位數 OTP 到使用者信箱（有效期 10 分鐘）
   *
   * @param {string} email - Email 帳號
   * @returns {Promise<Object>} { success, message }
   */
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  /**
   * ========================================
   * 驗證 OTP - 確認 6 位數驗證碼
   * ========================================
   *
   * 流程：驗證 OTP 是否正確，成功後才能重設密碼
   *
   * @param {string} email - Email 帳號
   * @param {string} otp - 6 位數 OTP
   * @returns {Promise<Object>} { success, message, verified }
   */
  verifyOTP: async (email, otp) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
  },

  /**
   * ========================================
   * 重置密碼 - 使用已驗證的 OTP 設定新密碼
   * ========================================
   *
   * 流程：必須先通過 OTP 驗證，才能重置密碼
   *
   * @param {string} email - Email 帳號
   * @param {string} otp - 6 位數 OTP (已驗證)
   * @param {string} newPassword - 新密碼
   * @returns {Promise<Object>} { success, message }
   */
  resetPassword: async (email, otp, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    })
  },

  /**
   * Google 登入 - 導向 Google OAuth
   *
   * 注意：此方法會直接導向，不是 API 呼叫
   */
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/api/v2/auth/google`
  },
}

/**
 * 使用者資料 API (使用 OAuth 2.0 認證)
 */
export const userAPI = {
  /**
   * 更新暱稱
   * @param {string} nickname - 新暱稱
   * @returns {Promise<Object>} { success, message, user }
   */
  updateNickname: async (nickname) => {
    return apiRequest('/user/update-nickname', {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    })
  },

  /**
   * 更新個人資料
   * @param {Object} profileData - 個人資料
   * @returns {Promise<Object>} { success, message, user }
   */
  updateProfile: async (profileData) => {
    return apiRequest('/user/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  /**
   * 上傳頭像
   *
   * 注意：FormData 不需要設定 Content-Type
   *
   * @param {File} file - 圖片檔案
   * @returns {Promise<Object>} { success, message, avatarUrl }
   */
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)

    const url = `${API_BASE_URL}${API_VERSION}/user/upload-avatar`

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include', // 傳送 httpOnly cookies
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '上傳失敗')
      }

      return data
    } catch (error) {
      console.error(' Upload avatar error:', error)
      throw error
    }
  },

  /**
   * 更新密碼
   * @param {Object} passwordData - 密碼資料物件
   * @param {string} passwordData.currentPassword - 當前密碼
   * @param {string} passwordData.newPassword - 新密碼
   * @param {string} passwordData.confirmPassword - 確認新密碼
   * @returns {Promise<Object>} { success, message }
   */
  updatePassword: async (passwordData) => {
    return apiRequest('/user/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  },

  /**
   * 刪除頭像
   *
   * @returns {Promise<Object>} { success, message }
   */
  deleteAvatar: async () => {
    return apiRequest('/user/delete-avatar', {
      method: 'DELETE',
    })
  },
}

/**
 * Google Authenticator (2FA) API
 */
export const twoFactorAPI = {
  /**
   * 啟用 Google Authenticator
   *
   * @returns {Promise<Object>} { success, qrCode, secret, backupCodes }
   */
  enable: async () => {
    return apiRequest('/auth/2fa/enable', {
      method: 'POST',
    })
  },

  /**
   * 驗證並確認啟用 2FA
   *
   * @param {string} token - 6 位數驗證碼
   * @returns {Promise<Object>} { success, message }
   */
  verify: async (token) => {
    return apiRequest('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },

  /**
   * 停用 Google Authenticator
   *
   * @param {string} password - 使用者密碼
   * @returns {Promise<Object>} { success, message }
   */
  disable: async (password) => {
    return apiRequest('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  /**
   * 取得 2FA 狀態
   *
   * @returns {Promise<Object>} { success, enabled, hasBackupCodes }
   */
  getStatus: async () => {
    return apiRequest('/auth/2fa/status', {
      method: 'GET',
    })
  },
}

// ============ 預設匯出 ============
const api = {
  auth: authAPI,
  user: userAPI,
  twoFactor: twoFactorAPI,
  refreshToken,
}

export default api
