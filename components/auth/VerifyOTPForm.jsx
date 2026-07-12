/**
 * ========================================
 * VerifyOTPForm - OTP 驗證表單元件
 * ========================================
 * 路徑: sailo/components/auth/VerifyOTPForm.jsx
 *
 * 功能：
 * 1. 6 位數 OTP 輸入
 * 2. 自動聚焦與跳轉
 * 3. 驗證 OTP 是否正確
 * 4. 倒數計時顯示
 * 5. 重新發送 OTP
 * 6. 驗證成功後切換到重設密碼頁面
 *
 * 使用方式：
 * <VerifyOTPForm
 *   email="user@example.com"
 *   onSuccess={handleSuccess}
 *   onBack={handleBack}
 * />
 *
 * 流程：
 * 1. 使用者輸入 6 位數 OTP
 * 2. 點擊「驗證」或輸入完成自動驗證
 * 3. 驗證成功後切換到重設密碼頁面
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { authAPI } from '@/services/api'
import { useNotify } from '@/contexts/NotificationContext'

export default function VerifyOTPForm({ email, onSuccess, onBack }) {
  const notify = useNotify()
  // ============ 狀態管理 ============
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(600) // 10 分鐘 = 600 秒

  // OTP 輸入框 refs
  const inputRefs = useRef([])

  // ============ 倒數計時 ============
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  // 格式化倒數時間
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ============ OTP 輸入處理 ============

  /**
   * 處理 OTP 輸入變更
   */
  const handleChange = (index, value) => {
    // 只允許數字
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('') // 清除錯誤訊息

    // 自動跳到下一個輸入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 如果輸入完成（6 位數），自動驗證
    const completeOtp = newOtp.join('')
    if (completeOtp.length === 6) {
      handleVerify(completeOtp)
    }
  }

  /**
   * 處理按鍵事件
   */
  const handleKeyDown = (index, e) => {
    // Backspace: 刪除當前並跳到上一個
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // 左箭頭: 跳到上一個
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // 右箭頭: 跳到下一個
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  /**
   * 處理貼上事件
   */
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    // 只接受 6 位數字
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      setError('')
      // 自動驗證
      handleVerify(pastedData)
    } else {
      setError('請貼上 6 位數驗證碼')
    }
  }

  // ============ 驗證處理 ============

  /**
   * 驗證 OTP
   */
  const handleVerify = async (otpString = otp.join('')) => {
    setError('')

    // 驗證 OTP 格式
    if (otpString.length !== 6) {
      setError('請輸入完整的 6 位數驗證碼')
      return
    }

    setIsLoading(true)

    try {
      // 呼叫驗證 OTP API
      const data = await authAPI.verifyOTP(email, otpString)

      if (data.success && data.verified) {
        // 驗證成功 - 切換到重設密碼頁面
        onSuccess && onSuccess(email, otpString)
      } else {
        // 驗證失敗
        setError(data.message || '驗證碼錯誤，請重新輸入')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      console.error(' 驗證 OTP 錯誤:', error)
      setError(error.message || '網路錯誤，請稍後再試')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 重新發送 OTP
   */
  const handleResend = async () => {
    setError('')
    setIsLoading(true)

    try {
      const data = await authAPI.forgotPassword(email)

      if (data.success) {
        setCountdown(600) // 重設倒數計時
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        notify('新的驗證碼已發送到您的信箱', 'success')
      } else {
        setError(data.message || '發送失敗，請稍後再試')
      }
    } catch (error) {
      console.error(' 重新發送 OTP 錯誤:', error)
      setError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ 渲染組件 ============
  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">輸入驗證碼</h2>
        <p className="text-gray-600">
          我們已發送 6 位數驗證碼到
          <br />
          <strong className="text-gray-600">{email}</strong>
        </p>
      </div>

      {/* 倒數計時 */}
      <div className="text-center">
        <div
          className={`inline-block px-4 py-2 ${
            countdown < 60
              ? 'bg-red-50 text-red-700'
              : 'bg-primary-500/10 text-gray-700'
          }`}
        >
          <span className="text-sm font-semibold">
            剩餘時間：{formatTime(countdown)}
          </span>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* OTP 輸入框 */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isLoading || countdown === 0}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error
                ? 'border-red-500'
                : digit
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* 提示訊息 */}
      <div className="bg-primary-500/10 p-4">
        <p className="text-sm text-gray-700">
          <strong>提示：</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>• 驗證碼有效期為 10 分鐘</li>
          <li>• 最多可驗證 5 次</li>
          <li>• 沒收到驗證碼？請檢查垃圾郵件匣</li>
        </ul>
      </div>

      {/* 重新發送按鈕 */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading || countdown > 0}
          className="text-primary-500 hover:text-primary-500 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {countdown > 0
            ? `重新發送 (${formatTime(countdown)})`
            : '重新發送驗證碼'}
        </button>
      </div>

      {/* 返回按鈕 */}
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        返回
      </button>
    </div>
  )
}
