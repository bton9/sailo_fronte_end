/**
 * AuthContext - 全域身份驗證管理
 * 路徑: sailo/contexts/AuthContext.jsx
 *
 * 功能：
 * 1. 管理使用者登入狀態
 * 2. 儲存 JWT Token 到 localStorage
 * 3. 自動檢查 Token 有效性
 * 4. 提供登入、登出、註冊方法
 * 5. 自動刷新 Token 機制
 *
 * 使用方式：
 * import { useAuth } from '@/contexts/AuthContext'
 * const { user, login, logout, isAuthenticated } = useAuth()
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { authAPI } from '@/services/api'

// 建立 Context
const AuthContext = createContext(null)

/**
 * AuthProvider - 提供全域身份驗證狀態
 */
export function AuthProvider({ children }) {
  // ============ 狀態管理 ============
  const [user, setUser] = useState(null) // 使用者資料
  const [isAuthenticated, setIsAuthenticated] = useState(false) // 是否已登入
  const [isLoading, setIsLoading] = useState(true) // 是否正在載入
  const [token, setToken] = useState(null) // JWT Token

  /**
   * 從 localStorage 載入 Token 與使用者資料
   */
  const loadUserFromStorage = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error(' 載入使用者資料失敗:', error)
      // 清除無效資料
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 驗證 Token 有效性
   *
   * 此方法會呼叫後端 API 驗證 Token 是否仍然有效
   * 用於自動刷新機制，確保使用者的登入狀態
   *
   * @param {string} tokenToVerify - 要驗證的 JWT Token
   * @returns {Promise<boolean>} Token 是否有效
   */
  const verifyToken = useCallback(async (tokenToVerify) => {
    try {
      // 使用 authAPI.verify() 取代原本的 fetch
      const data = await authAPI.verify()

      // 檢查回應中的 valid 欄位
      return data.valid === true
    } catch (error) {
      console.error(' Token 驗證失敗:', error)
      // 發生錯誤時視為無效 Token
      return false
    }
  }, [])

  /**
   * 登入方法
   *
   * 處理使用者登入流程：
   * 1. 呼叫後端登入 API
   * 2. 儲存 Token 到 localStorage
   * 3. 更新全域狀態
   * 4. 處理圖形驗證需求
   * 5. 處理 2FA 驗證需求
   *
   * @param {string} email - Email 帳號
   * @param {string} password - 密碼
   * @param {string|null} token2fa - Google Authenticator 驗證碼 (選填)
   * @param {string|null} captchaToken - 圖形驗證 Token (失敗多次後需要)
   * @returns {Promise<Object>} { success, message, user, needsCaptcha, requires2FA }
   */
  const login = useCallback(
    async (email, password, token2fa = null, captchaToken = null) => {
      try {
        // 使用 authAPI.login() 取代原本的 fetch
        // authAPI 會自動處理 headers 和 JSON 轉換
        const data = await authAPI.login(
          email,
          password,
          token2fa,
          captchaToken
        )

        // 檢查登入是否成功
        if (data.success) {
          // 儲存 Token 與使用者資料到 localStorage
          // 這樣即使重新整理頁面，使用者仍保持登入狀態
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // 更新 React 狀態
          setToken(data.token)
          setUser(data.user)
          setIsAuthenticated(true)

          return {
            success: true,
            message: data.message || '登入成功',
            user: data.user,
          }
        } else {
          // 登入失敗，可能需要圖形驗證或 2FA
          return {
            success: false,
            message: data.message || '登入失敗',
            needsCaptcha: data.needsCaptcha, // 是否需要圖形驗證
            requires2FA: data.requires2FA, // 是否需要 2FA 驗證
          }
        }
      } catch (error) {
        // 網路錯誤或其他異常
        console.error(' 登入錯誤:', error)
        return {
          success: false,
          message: error.message || '網路錯誤，請稍後再試',
        }
      }
    },
    []
  )

  /**
   * 註冊方法
   *
   * 處理新使用者註冊流程：
   * 1. 驗證必填欄位 (email, password, name)
   * 2. 呼叫後端註冊 API
   * 3. 處理註冊結果 (成功/失敗)
   *
   * 注意：註冊成功後不會自動登入，需要使用者手動登入
   *
   * @param {Object} userData - 註冊資料
   * @param {string} userData.email - Email 帳號 (必填)
   * @param {string} userData.password - 密碼 (必填)
   * @param {string} userData.name - 真實姓名 (必填)
   * @param {string} userData.phone - 手機號碼 (選填)
   * @param {string} userData.nickname - 暱稱 (選填)
   * @returns {Promise<Object>} { success, message }
   */
  const register = useCallback(async (userData) => {
    try {
      // 使用 authAPI.register() 取代原本的 fetch
      // 傳入完整的使用者資料物件
      const data = await authAPI.register(userData)

      // 檢查註冊是否成功
      if (data.success) {
        return {
          success: true,
          message: data.message || '註冊成功，請登入',
        }
      } else {
        return {
          success: false,
          message: data.message || '註冊失敗',
        }
      }
    } catch (error) {
      // 網路錯誤或其他異常
      console.error(' 註冊錯誤:', error)
      return {
        success: false,
        message: error.message || '網路錯誤，請稍後再試',
      }
    }
  }, [])

  /**
   * 登出方法
   *
   * 處理使用者登出流程：
   * 1. 呼叫後端登出 API (記錄登出日誌)
   * 2. 清除 localStorage 中的 Token 和使用者資料
   * 3. 重置全域狀態
   *
   * 即使 API 呼叫失敗，也會清除本地資料確保使用者登出
   */
  const logout = useCallback(async () => {
    try {
      // 如果有 Token，呼叫後端登出 API
      // 這會在資料庫記錄登出時間，方便追蹤使用者活動
      if (token) {
        await authAPI.logout()
      }
    } catch (error) {
      // 即使 API 呼叫失敗，仍要繼續登出流程
      console.error(' 登出 API 呼叫失敗:', error)
    } finally {
      // 無論 API 是否成功，都要清除本地資料
      // finally 確保這段程式碼一定會執行

      // 清除 localStorage 中的認證資料
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')

      // 重置 React 狀態
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [token])

  /**
   * 更新使用者資料
   *
   * 重要：此方法也會同時更新 isAuthenticated 狀態
   * 用於 Google 登入等外部登入方式完成後更新狀態
   *
   * @param {Object} updatedData - 更新的資料
   */
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData }
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    })

    // 修正：更新使用者資料時，同時設定為已登入狀態
    // 這對 Google 登入等外部登入方式特別重要
    setIsAuthenticated(true)
  }, [])

  // ============ 生命週期 ============

  // 初始化：從 localStorage 載入使用者資料
  useEffect(() => {
    loadUserFromStorage()
  }, [loadUserFromStorage])

  // Token 自動驗證 (每 5 分鐘檢查一次)
  useEffect(() => {
    if (!token) return

    const interval = setInterval(
      async () => {
        const isValid = await verifyToken(token)
        if (!isValid) {
          console.warn(' Token 已失效，自動登出')
          logout()
        }
      },
      5 * 60 * 1000
    ) // 5 分鐘

    return () => clearInterval(interval)
  }, [token, verifyToken, logout])

  // ============ Context Value ============
  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook - 使用身份驗證功能
 * @returns {Object} AuthContext 值
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
