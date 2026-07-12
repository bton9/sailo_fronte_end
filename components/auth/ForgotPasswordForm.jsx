/**
 * ForgotPasswordForm - 忘記密碼表單元件
 * 路徑: sailo/components/auth/ForgotPasswordForm.jsx
 *
 * 功能：
 * 1. Email 輸入與驗證
 * 2. 發送密碼重置郵件
 * 3. 顯示成功/錯誤訊息
 * 4. Loading 狀態
 * 5. 返回登入功能
 *
 * 使用方式：
 * <ForgotPasswordForm onBack={handleBack} />
 *
 * 流程：
 * 1. 使用者輸入 Email
 * 2. 點擊「發送重置郵件」
 * 3. 後端發送郵件到使用者信箱
 * 4. 郵件包含重置密碼的連結
 * 5. 使用者點擊連結進入重置密碼頁面
 */

'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { isValidEmail } from '@/utils/validation'
import { authAPI } from '@/services/api'

export default function ForgotPasswordForm({ onBack }) {
  // ============ 狀態管理 ============
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
   * 處理表單提交 - 發送重置密碼郵件
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
      // 呼叫忘記密碼 API (OAuth 2.0)
      const data = await authAPI.forgotPassword(email)

      if (data.success) {
        // 發送成功
        setIsSuccess(true)
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

  // ============ 渲染成功畫面 ============
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        {/* 成功圖示 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* 成功訊息 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">郵件已發送</h2>
          <p className="text-gray-600">我們已經發送密碼重置郵件到</p>
          <p className="text-blue-600 font-semibold mt-1">{email}</p>
        </div>

        {/* 提示訊息 */}
        <div className="bg-blue-50 border border-blue-200 p-4 text-left">
          <p className="text-sm text-gray-700">
            <strong>請檢查您的信箱</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• 郵件可能需要幾分鐘才會送達</li>
            <li>• 請檢查垃圾郵件資料夾</li>
            <li>• 重置連結有效期為 1 小時</li>
          </ul>
        </div>

        {/* 返回登入按鈕 */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          返回登入
        </button>

        {/* 沒收到郵件？ */}
        <button
          type="button"
          onClick={() => {
            setIsSuccess(false)
            setEmail('')
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          沒收到郵件？重新發送
        </button>
      </div>
    )
  }

  // ============ 渲染表單 ============
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">忘記密碼？</h2>
        <p className="text-gray-600">
          請輸入您的 Email，我們會發送重置密碼連結給您
        </p>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email 欄位 */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email 信箱
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
          autoComplete="email"
          autoFocus
        />
      </div>

      {/* 發送按鈕 */}
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
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            發送中...
          </span>
        ) : (
          '發送重置郵件'
        )}
      </button>

      {/* 返回登入 */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1 mx-auto"
        >
          <span>←</span>
          <span>返回登入</span>
        </button>
      </div>
    </form>
  )
}
