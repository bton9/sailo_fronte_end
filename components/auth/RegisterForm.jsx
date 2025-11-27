/**
 * RegisterForm - 註冊表單元件
 * 路徑: sailo/components/auth/RegisterForm.jsx
 *
 * 功能：
 * 1. 完整註冊表單 (email, password, name, phone, nickname)
 * 2. 即時欄位驗證
 * 3. 密碼強度檢測與顯示
 * 4. 確認密碼比對
 * 5. 錯誤訊息顯示
 *
 * 使用方式：
 * <RegisterForm onSuccess={handleRegisterSuccess} onSwitchToLogin={handleSwitch} />
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isValidEmail, isValidPhone } from '@/utils/validation'
import { checkPasswordStrength } from '@/utils/password'

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  // ============ 狀態管理 ============
  const { register } = useAuth()
  // ============ 狀態定義 ============
  // 移除 name 欄位，註冊時不再需要填寫真實姓名
  // nickname 為選填，可作為顯示名稱使用
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(null)

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
    if (name === 'password') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
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
    } else if (formData.password.length < 8) {
      newErrors.password = '密碼至少需要 8 個字元'
    } else {
      const strength = checkPasswordStrength(formData.password)
      if (!strength.isValid) {
        newErrors.password = strength.message
      }
    }

    // 確認密碼驗證
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼不一致'
    }

    // ============ 已移除真實姓名驗證 ============
    // 原本要求必填 name 欄位，現已改為選填
    // 使用者可以選擇填寫 nickname 作為顯示名稱

    // 暱稱驗證 (選填，但有填就要驗證長度)
    if (formData.nickname && formData.nickname.length < 2) {
      newErrors.nickname = '暱稱至少需要 2 個字元'
    }

    // 手機驗證 (選填，但有填就要驗證格式)
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = '手機格式不正確 (例：0912345678)'
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

    setIsLoading(true)

    try {
      // ============ 呼叫註冊 API ============
      // 已移除 name 欄位，僅傳送 email、password、nickname、phone
      const result = await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname || null,
        phone: formData.phone || null,
      })

      if (result.success) {
        // 註冊成功
        onSuccess && onSuccess()
      } else {
        // 註冊失敗
        setGeneralError(result.message || '註冊失敗，請稍後再試')
      }
    } catch (error) {
      console.error('❌ 註冊錯誤:', error)
      setGeneralError('網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 取得密碼強度顏色
   */
  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-300'
    switch (passwordStrength.strength) {
      case 'strong':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'weak':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  // ============ 渲染 UI ============
  return (
    <form onSubmit={handleSubmit} className="w-full px-8">
      {/* 標題 */}
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-1">建立新帳號</h2>
        <p className="text-gray-500 text-sm">填寫資料開始您的旅程</p>
      </div>

      {/* 全域錯誤訊息 */}
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 flex items-center gap-2 mb-3">
          <span className="text-xl">⚠️</span>
          <span className="text-sm">{generalError}</span>
        </div>
      )}

      {/* Email 欄位 */}
      <div className="mb-2.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email 信箱 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-1.5 py-1.5 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* ============ 已移除真實姓名欄位 ============ */}
      {/* 原本此處有 name 欄位要求必填真實姓名 */}
      {/* 現已移除，改為僅使用暱稱 (選填) */}

      {/* 暱稱欄位 (選填) */}
      <div className="mb-2.5">
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          暱稱 (選填)
        </label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          className={`w-full px-1.5 py-1.5 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors ${
            errors.nickname ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="顯示用的暱稱"
        />
        {errors.nickname && (
          <p className="mt-1 text-xs text-red-600">{errors.nickname}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          💡 暱稱將作為您在平台上的顯示名稱
        </p>
      </div>

      {/* 手機欄位 (選填) */}
      <div className="mb-2.5">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          手機號碼 (選填)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-1.5 py-1.5 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0912345678"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* 密碼欄位 */}
      <div className="mb-2.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          密碼 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-1.5 py-1.5 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors pr-8 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="至少 8 個字元"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        )}

        {/* 密碼強度指示器 */}
        {formData.password && passwordStrength && (
          <div className="mt-1.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getPasswordStrengthColor()} transition-all`}
                  style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                {passwordStrength.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 確認密碼欄位 */}
      <div className="mb-3">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          確認密碼 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-1.5 py-1.5 border-b-2 border-t-0 border-x-0 bg-transparent focus:outline-none focus:border-gray-400 transition-colors pr-8 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="再次輸入密碼"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* 服務條款 */}
      <div className="flex items-start mb-5">
        <input
          type="checkbox"
          id="terms"
          required
          className="w-4 h-4 mt-0.5 border-2 border-gray-400 focus:ring-0 focus:ring-offset-0 checked:bg-gray-600 checked:border-gray-600"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
          我同意
          <button
            type="button"
            className="text-amber-700 hover:text-amber-800 mx-1"
          >
            服務條款
          </button>
          與
          <button
            type="button"
            className="text-amber-700 hover:text-amber-800 mx-1"
          >
            隱私政策
          </button>
        </label>
      </div>

      {/* 註冊按鈕 */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2.5 px-4 text-white font-medium transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#9D8B6C] hover:bg-[#8B7A5A]'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            註冊中...
          </span>
        ) : (
          '建立帳號'
        )}
      </button>

      {/* 切換到登入 */}
      <div className="text-center mt-3">
        <p className="text-gray-600 text-sm">
          已經有帳號了？
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="ml-1 text-amber-700 hover:text-amber-800 font-medium"
          >
            立即登入
          </button>
        </p>
      </div>
    </form>
  )
}
