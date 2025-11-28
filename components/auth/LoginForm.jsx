/**
 * LoginForm - 登入表單元件
 * 路徑: sailo/components/auth/LoginForm.jsx
 *
 * 功能：
 * 1. Email 與密碼輸入
 * 2. 即時欄位驗證
 * 3. 顯示錯誤訊息
 * 4. Loading 狀態
 * 5. 密碼顯示/隱藏切換
 *
 * 使用方式：
 * <LoginForm onSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitch} />
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isValidEmail } from '@/utils/validation'
import { AiOutlineGoogle } from 'react-icons/ai'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) {
  // ============ 狀態管理 ============
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // 2FA 相關狀態
  const [requires2FA, setRequires2FA] = useState(false)
  const [token2FA, setToken2FA] = useState('')

  // ============ API 基礎網址 ============
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // ============ 表單處理 ============

  /**
   * 處理輸入變更
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 清除該欄位的錯誤訊息
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setGeneralError('')
  }

  /**
   * 驗證表單
   */
  const validateForm = () => {
    const newErrors = {}

    // Email 驗證
    if (!formData.email) {
      newErrors.email = 'Email 為必填欄位'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email 格式不正確'
    }

    // 密碼驗證
    if (!formData.password) {
      newErrors.password = '密碼為必填欄位'
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字元'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 處理表單提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    // 驗證表單
    if (!validateForm()) {
      return
    }

    // 如果需要 2FA 但未輸入驗證碼
    if (requires2FA && !token2FA) {
      setGeneralError('請輸入 Google Authenticator 驗證碼')
      return
    }

    setIsLoading(true)

    try {
      // 呼叫登入 API (傳入 2FA token)
      const result = await login(
        formData.email,
        formData.password,
        token2FA || null
      )

      if (result.success) {
        // 登入成功
        onSuccess && onSuccess(result.user)
      } else if (result.requires2FA) {
        // 需要 2FA 驗證
        setRequires2FA(true)
        setGeneralError(result.message || '請輸入 Google Authenticator 驗證碼')
      } else {
        // 登入失敗
        setGeneralError(result.message || '登入失敗,請檢查帳號密碼')
      }
    } catch (error) {
      console.error(' 登入錯誤:', error)
      setGeneralError('網路錯誤,請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ 渲染 UI ============
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* 標題 */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold font-heading text-gray-900 mb-1">
          Welcome !
        </h2>
        <p className="text-gray-500 text-sm">請登入您的帳號</p>
      </div>

      {/* 全域錯誤訊息 */}
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 mb-4">
          <span className="text-xl">⚠️</span>
          <span className="text-sm">{generalError}</span>
        </div>
      )}

      {/* Email 欄位 */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email 信箱
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-1.5 py-2 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* 密碼欄位 */}
      <div className="py-5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          密碼
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-1.5 py-2 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors pr-8 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="請輸入密碼"
            autoComplete="current-password"
          />
          {/* 顯示/隱藏密碼按鈕 */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Google Authenticator 驗證碼輸入框 (只在需要2FA時顯示) */}
      {requires2FA && (
        <div className="animate-[slideDown_0.3s_ease-out]">
          <label
            htmlFor="token2FA"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Google Authenticator 驗證碼 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="token2FA"
            name="token2FA"
            value={token2FA}
            onChange={(e) => {
              // 只允許輸入數字,最多 6 位
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setToken2FA(value)
              setGeneralError('')
            }}
            maxLength={6}
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
            autoComplete="one-time-code"
            autoFocus
          />
          <p className="mt-2 text-sm text-blue-600 text-center">
            請輸入 Google Authenticator App 中顯示的 6 位數驗證碼
          </p>
        </div>
      )}

      {/* 記住我 & 忘記密碼 */}
      <div className="flex items-center justify-between mb-5">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-gray-400 rounded-sm focus:ring-0 focus:ring-offset-0 checked:bg-gray-600 checked:border-gray-600"
          />
          <span className="ml-2 text-sm text-gray-700">記住我</span>
        </label>
        <button
          type="button"
          onClick={onSwitchToForgotPassword}
          className="text-sm text-amber-700 hover:text-amber-800"
        >
          忘記密碼？
        </button>
      </div>

      {/* 登入按鈕 */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 my-5 text-white font-medium transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#9D8B6C] hover:bg-[#8B7A5A]'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            登入中...
          </span>
        ) : (
          '登入'
        )}
      </button>

      {/* 切換到註冊 */}
      <div className="text-center mb-6">
        <p className="text-gray-600 text-sm">
          還沒有帳號？
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="ml-1 text-amber-700 hover:text-amber-800 font-medium"
          >
            立即註冊
          </button>
        </p>
      </div>

      {/* 分隔線 */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            或使用以下方式登入
          </span>
        </div>
      </div>

      {/* Google 登入按鈕 */}
      {/* 
        Google OAuth 登入流程：
        1. 使用者點擊按鈕
        2. 導向後端 Google OAuth 端點
        3. 後端重導向到 Google 授權頁面
        4. 使用者授權後，Google 重導向回後端 callback
        5. 後端產生 JWT Token 並重導向回前端
        6. 前端儲存 Token 並登入成功
      */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 hover:border-gray-400"
      >
        <span className="text-xl">
          <AiOutlineGoogle />
        </span>
        使用 GOOGLE 登入
      </button>
    </form>
  )

  // ============ Google 登入處理 ============

  /**
   * 處理 Google 登入
   *
   * 流程：
   * 1. 取得當前頁面完整路徑（含查詢參數）
   * 2. 將路徑作為 redirect 參數傳遞給後端
   * 3. 後端處理 OAuth 流程並在完成後導回原頁面
   */
  function handleGoogleLogin() {
    try {
      // 取得當前頁面完整路徑（包含查詢參數）
      const currentPath = window.location.pathname + window.location.search

      // 將重導向路徑編碼並傳遞給後端
      const redirectParam = encodeURIComponent(currentPath)

      console.log('🔄 Google 登入 - 當前路徑:', currentPath)

      // 導向後端 Google OAuth 端點，並帶上 redirect 參數
      // 後端會在 OAuth 完成後導回此路徑
      window.location.href = `${API_BASE_URL}/api/v2/auth/google?redirect=${redirectParam}`
    } catch (error) {
      console.error(' Google 登入錯誤:', error)
      setGeneralError('Google 登入發生錯誤，請稍後再試')
    }
  }
}
