/**
 * ========================================
 * ForgotPasswordForm - 忘記密碼表單元件 (OTP 版本)
 * ========================================
 * 路徑: sailo/components/auth/ForgotPasswordFormOTP.jsx
 *
 * 功能：
 * 1. Email 輸入與驗證
 * 2. 發送 6 位數 OTP 到信箱
 * 3. 自動切換到 OTP 驗證頁面
 * 4. 顯示成功/錯誤訊息
 * 5. Loading 狀態
 * 6. 返回登入功能
 *
 * 使用方式：
 * <ForgotPasswordFormOTP onSwitchToVerifyOTP={handleSwitch} onBack={handleBack} />
 *
 * 流程：
 * 1. 使用者輸入 Email
 * 2. 點擊「發送驗證碼」
 * 3. 後端發送 6 位數 OTP 到使用者信箱
 * 4. 顯示成功訊息並切換到 OTP 驗證頁面
 */

'use client'

import { useState } from 'react'
import { isValidEmail } from '@/utils/validation'
import { authAPI } from '@/services/api'

export default function ForgotPasswordFormOTP({ onSwitchToVerifyOTP, onBack }) {
  // ============ 狀態管理 ============
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ============ 表單處理 ============

  /**
   * 處理 Email 輸入變更
   */
  const handleChange = (e) => {
    setEmail(e.target.value)
    setError('') // 清除錯誤訊息
  }

  /**
   * 驗證 Email 格式
   */
  const validateEmail = () => {
    if (!email) {
      setError('Email 為必填欄位')
      return false
    }
    if (!isValidEmail(email)) {
      setError('Email 格式不正確')
      return false
    }
    return true
  }

  /**
   * 處理表單提交 - 發送 OTP 驗證碼
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 驗證 Email
    if (!validateEmail()) {
      return
    }

    setIsLoading(true)

    try {
      // 呼叫忘記密碼 API (OAuth 2.0 + OTP)
      const data = await authAPI.forgotPassword(email)

      if (data.success) {
        // 發送成功 - 切換到 OTP 驗證頁面
        console.log(' OTP 已發送到:', email)
        onSwitchToVerifyOTP && onSwitchToVerifyOTP(email)
      } else {
        // 發送失敗
        setError(data.message || '發送失敗，請稍後再試')
      }
    } catch (error) {
      console.error(' 忘記密碼錯誤:', error)
      setError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ 渲染表單 ============
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">忘記密碼</h2>
        <p className="text-gray-600">
          請輸入您的 Email，我們將發送驗證碼到您的信箱
        </p>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Email 輸入欄位 */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email 帳號
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="請輸入您的 Email"
          autoComplete="email"
          autoFocus
        />
      </div>

      {/* 提示訊息 */}
      <div className="bg-primary-500/10 p-4">
        <p className="text-sm text-gray-700">
          <strong>💡 提示：</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>• 我們將發送 6 位數驗證碼到您的信箱</li>
          <li>• 驗證碼有效期為 10 分鐘</li>
          <li>• 請確認您輸入的 Email 是註冊時使用的帳號</li>
        </ul>
      </div>

      {/* 發送驗證碼按鈕 */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 text-white font-semibold transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-500 hover:bg-secondary-900 hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            發送中...
          </span>
        ) : (
          '發送驗證碼'
        )}
      </button>

      {/* 返回登入按鈕 */}
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        返回登入
      </button>
    </form>
  )
}
