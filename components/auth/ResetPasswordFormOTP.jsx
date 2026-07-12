/**
 * ========================================
 * ResetPasswordFormOTP - 重置密碼表單元件 (OTP 版本)
 * ========================================
 * 路徑: sailo/components/auth/ResetPasswordFormOTP.jsx
 *
 * 功能：
 * 1. 新密碼輸入與驗證
 * 2. 確認密碼比對
 * 3. 密碼強度檢測
 * 4. 顯示/隱藏密碼
 * 5. 使用已驗證的 OTP 重設密碼
 * 6. 重置成功後導向登入
 *
 * 使用方式：
 * <ResetPasswordFormOTP
 *   email="user@example.com"
 *   otp="123456"
 *   onSuccess={handleSuccess}
 * />
 *
 * 流程：
 * 1. 使用者從 OTP 驗證頁面進入
 * 2. 輸入新密碼與確認密碼
 * 3. 使用已驗證的 OTP 提交密碼重置
 * 4. 成功後導向登入頁面
 */

'use client'

import { useState } from 'react'
import { checkPasswordStrength } from '@/utils/password'
import { authAPI } from '@/services/api'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordFormOTP({ email, otp, onSuccess }) {
  // ============ 狀態管理 ============
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

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

    // 密碼強度檢測
    if (name === 'newPassword') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  /**
   * 驗證表單
   */
  const validateForm = () => {
    const newErrors = {}

    // 驗證新密碼
    if (!formData.newPassword) {
      newErrors.newPassword = '新密碼為必填欄位'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '密碼至少需要 8 個字元'
    } else {
      const strength = checkPasswordStrength(formData.newPassword)
      if (!strength.isValid) {
        newErrors.newPassword = strength.message
      }
    }

    // 驗證確認密碼
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 處理表單提交 - 重置密碼
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    // 驗證 Email 和 OTP
    if (!email || !otp) {
      setGeneralError('驗證資訊不完整，請重新操作')
      return
    }

    // 驗證表單
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 呼叫重置密碼 API (OAuth 2.0 + OTP)
      const data = await authAPI.resetPassword(email, otp, formData.newPassword)

      if (data.success) {
        // 重置成功
        setIsSuccess(true)
        // 3 秒後執行成功回調 (通常是導向登入頁)
        setTimeout(() => {
          onSuccess && onSuccess()
        }, 3000)
      } else {
        // 重置失敗
        setGeneralError(data.message || '重置失敗，請稍後再試')
      }
    } catch (error) {
      console.error(' 重置密碼錯誤:', error)
      setGeneralError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 取得密碼強度的顏色與文字
   */
  const getStrengthColor = () => {
    if (!passwordStrength) return ''
    switch (passwordStrength.level) {
      case 'weak':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'strong':
        return 'text-green-600'
      default:
        return ''
    }
  }

  const getStrengthBgColor = () => {
    if (!passwordStrength) return 'bg-gray-200'
    switch (passwordStrength.level) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-200'
    }
  }

  // ============ 渲染成功畫面 ============
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        {/* 成功圖示 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* 成功訊息 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            密碼重置成功！
          </h2>
          <p className="text-gray-600">您的密碼已成功更新</p>
          <p className="text-sm text-gray-500 mt-2">
            3 秒後自動跳轉到登入頁面...
          </p>
        </div>

        {/* 立即登入按鈕 */}
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-500 hover:from-neutral-700 hover:to-neutral-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          立即登入
        </button>
      </div>
    )
  }

  // ============ 渲染表單 ============
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">設定新密碼</h2>
        <p className="text-gray-600">請輸入您的新密碼</p>
        <p className="text-sm text-gray-500 mt-1">
          帳號：<strong>{email}</strong>
        </p>
      </div>

      {/* 錯誤訊息 */}
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* 新密碼欄位 */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          新密碼
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="請輸入新密碼 (至少 8 個字元)"
            autoComplete="new-password"
            autoFocus
          />
          {/* 顯示/隱藏密碼按鈕 */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}

        {/* 密碼強度指示器 */}
        {passwordStrength && formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">密碼強度：</span>
              <span className={`text-xs font-semibold ${getStrengthColor()}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthBgColor()}`}
                style={{ width: `${passwordStrength.score * 25}%` }}
              ></div>
            </div>
            {passwordStrength.message && (
              <p className="mt-1 text-xs text-gray-600">
                {passwordStrength.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 確認密碼欄位 */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          確認新密碼
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="請再次輸入新密碼"
            autoComplete="new-password"
          />
          {/* 顯示/隱藏密碼按鈕 */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* 提示訊息 */}
      <div className="bg-primary-500/10 p-4">
        <p className="text-sm text-gray-700">
          <strong>密碼要求：</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>• 至少 8 個字元</li>
          <li>• 建議包含大小寫字母、數字和特殊符號</li>
          <li>• 避免使用常見密碼 (如：12345678)</li>
        </ul>
      </div>

      {/* 重置按鈕 */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 text-white font-semibold transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-500 to-primary-500 hover:from-neutral-700 hover:to-neutral-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            重置中...
          </span>
        ) : (
          '重置密碼'
        )}
      </button>
    </form>
  )
}
