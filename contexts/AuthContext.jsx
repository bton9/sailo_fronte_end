/**
 * AuthContext - 全域身份驗證管理 (OAuth 2.0 版本)
 * 路徑: sailo/contexts/AuthContextV2.jsx
 *
 * 功能：
 * 1. 管理使用者登入狀態
 * 2. 使用 httpOnly cookie 儲存 Token (安全)
 * 3. 自動檢查 Token 有效性
 * 4. 提供登入、登出、註冊方法
 * 5. 自動刷新 Token 機制
 * 6. 不使用 localStorage
 *
 * 重要改變：
 * - 移除所有 localStorage 操作
 * - Token 由後端透過 httpOnly cookie 管理
 * - 前端只儲存使用者資料到 state
 * - 更安全，防止 XSS 攻擊
 *
 * 使用方式：
 * import { useAuth } from '@/contexts/AuthContextV2'
 * const { user, login, logout, isAuthenticated } = useAuth()
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { authAPI } from '@/services/api'

// API 基礎 URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// 建立 Context
const AuthContext = createContext(null)

/**
 * AuthProvider - 提供全域身份驗證狀態 (OAuth 2.0 版本)
 */
export function AuthProvider({ children }) {
  // ============ 狀態管理 ============
  const [user, setUser] = useState(null) // 使用者資料
  const [isAuthenticated, setIsAuthenticated] = useState(false) // 是否已登入
  const [isLoading, setIsLoading] = useState(true) // 是否正在載入
  const [showLoginModal, setShowLoginModal] = useState(false) // 登入視窗狀態 (全域共享)

  /**
   * 載入使用者資料
   *
   * 改進：從後端驗證 Token (httpOnly cookie)
   * 不再從 localStorage 載入
   */
  const loadUser = useCallback(async () => {
    try {
      // 呼叫後端驗證 API (會自動從 httpOnly cookie 讀取 token)
      const data = await authAPI.verify()

      console.log('🔍 AuthContext - verify API 返回:', data)
      console.log('🔍 AuthContext - data.user:', data.user)
      console.log(
        '🔍 AuthContext - data.user keys:',
        data.user ? Object.keys(data.user) : 'no user'
      )

      if (data.valid && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        console.log('✅ 使用者已登入:', data.user.email)
        console.log('✅ user.user_id:', data.user.user_id)
        console.log('✅ user.id:', data.user.id)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error(' 載入使用者資料失敗:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 登入方法
   *
   * OAuth 2.0 流程：
   * 1. 呼叫後端登入 API
   * 2. 後端設定 httpOnly cookies (access_token, refresh_token, session_token)
   * 3. 更新前端狀態
   *
   * @param {string} email - Email 帳號
   * @param {string} password - 密碼
   * @param {string|null} token2fa - Google Authenticator 驗證碼 (選填)
   * @returns {Promise<Object>} { success, message, user, requires2FA }
   */
  const login = useCallback(async (email, password, token2fa = null) => {
    try {
      const data = await authAPI.login(email, password, token2fa)

      if (data.success) {
        // 登入成功，更新狀態
        setUser(data.user)
        setIsAuthenticated(true)

        console.log('✅ 登入成功:', data.user.email)

        return {
          success: true,
          message: data.message || '登入成功',
          user: data.user,
        }
      } else {
        // 登入失敗，可能需要 2FA
        return {
          success: false,
          message: data.message || '登入失敗',
          requires2FA: data.requires2FA,
        }
      }
    } catch (error) {
      console.error(' 登入錯誤:', error)
      return {
        success: false,
        message: error.message || '網路錯誤，請稍後再試',
      }
    }
  }, [])

  /**
   * 註冊方法
   *
   * @param {Object} userData - 註冊資料
   * @returns {Promise<Object>} { success, message }
   */
  const register = useCallback(async (userData) => {
    try {
      const data = await authAPI.register(userData)

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
   * OAuth 2.0 流程：
   * 1. 呼叫後端登出 API
   * 2. 後端撤銷 Session 和 Refresh Token
   * 3. 後端清除所有 httpOnly cookies
   * 4. 重置前端狀態
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
      console.log('✅ 登出成功')
    } catch (error) {
      console.error(' 登出 API 呼叫失敗:', error)
    } finally {
      // 無論 API 是否成功，都重置前端狀態
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  /**
   * 更新使用者資料
   *
   * 注意：僅更新前端狀態，不儲存到 localStorage
   *
   * @param {Object} updatedData - 更新的資料
   */
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }))

    // 如果更新了使用者資料，視為已登入
    setIsAuthenticated(true)
  }, [])

  /**
   * 刷新 Token
   *
   * OAuth 2.0 Token Refresh 流程：
   * 1. 呼叫後端 /api/v2/auth/refresh
   * 2. 後端驗證 Refresh Token (從 httpOnly cookie)
   * 3. 後端產生新的 Access Token 和 Refresh Token
   * 4. 後端更新 httpOnly cookies
   *
   * @returns {Promise<boolean>} 是否刷新成功
   */
  const refreshToken = useCallback(async () => {
    try {
      await authAPI.refresh()
      console.log('✅ Token 已自動刷新')
      return true
    } catch (error) {
      console.error(' Token 刷新失敗:', error)
      // Token 刷新失敗，登出使用者
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  // ============ 生命週期 ============

  // 初始化：載入使用者資料
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Token 自動刷新 (每 10 分鐘檢查一次)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(
      async () => {
        console.log('🔄 檢查 Token 狀態...')
        await refreshToken()
      },
      10 * 60 * 1000
    ) // 10 分鐘

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshToken])

  // ============ Context Value ============
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      refreshToken,
      // 重新載入使用者資料 (用於 Google 登入回調等場景)
      reloadUser: loadUser,
      // 登入視窗狀態管理 (全域共享，避免重複開啟)
      showLoginModal,
      setShowLoginModal,
      // 🆕 取得 Access Token (用於 WebSocket 認證)
      getAccessToken: async () => {
        // Token 存在 httpOnly Cookie 中,前端無法直接讀取
        // 這個函數會嘗試從 Cookie 取得,若失敗則嘗試刷新
        try {
          // 先驗證 Token 是否有效
          const response = await fetch(`${API_URL}/api/v2/auth/verify`, {
            credentials: 'include', // 包含 httpOnly Cookie
          })

          if (response.ok) {
            // 返回一個假的 token 標記 (實際 token 在 cookie 中)
            return 'token_in_cookie'
          }

          // 若驗證失敗,嘗試刷新 Token
          await refreshToken()
          return 'token_in_cookie'
        } catch (error) {
          console.error(' 取得 Access Token 失敗:', error)
          return null
        }
      },
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      refreshToken,
      loadUser,
      showLoginModal,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook - 取得認證狀態
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export default AuthProvider
