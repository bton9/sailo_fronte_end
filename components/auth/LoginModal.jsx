/**
 * LoginModal - 登入/註冊彈窗元件
 * 路徑: sailo/components/auth/LoginModal.jsx
 *
 * 功能：
 * 1. 半透明背景遮罩 (可看到網站內容)
 * 2. 置中白色卡片彈窗
 * 3. 登入/註冊表單切換
 * 4. 關閉按鈕與動畫效果
 * 5. 點擊外部關閉 (可選)
 * 6. 優化的模糊效果
 * 7. 忘記密碼 OTP 驗證流程 (v2.1.0)
 *
 * 使用方式：
 * <LoginModal
 *   isOpen={showModal}
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 *   allowClose={false}  // 是否允許關閉 (false = 強制登入)
 * />
 *
 * 設計特點：
 * - 背景透明度從 60% 降低至 30%，可清楚看到後方內容
 * - 使用輕微模糊效果 (backdrop-blur-sm) 營造景深
 * - 卡片使用白色背景，確保表單清晰易讀
 *
 * 忘記密碼流程：
 * 1. forgot-password-otp: 輸入 Email 發送 OTP
 * 2. verify-otp: 輸入 6 位數 OTP 驗證
 * 3. reset-password-otp: 設定新密碼
 * 4. login: 返回登入
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordFormOTP from './ForgotPasswordFormOTP'
import VerifyOTPForm from './VerifyOTPForm'
import ResetPasswordFormOTP from './ResetPasswordFormOTP'


export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  allowClose = false,
}) {
  // ============ 狀態管理 ============
  // mode 可以是: 'login', 'register', 'forgot-password-otp', 'verify-otp', 'reset-password-otp'
  const [mode, setMode] = useState('login')
  const [isAnimating, setIsAnimating] = useState(false)

  // OTP 驗證流程狀態
  const [resetEmail, setResetEmail] = useState('') // 儲存重置密碼的 Email
  const [verifiedOTP, setVerifiedOTP] = useState('') // 儲存已驗證的 OTP

  // ============ 動畫處理 ============
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // 防止背景滾動 (彈窗開啟時鎖定頁面捲動)
      document.body.style.overflow = 'hidden'
    } else {
      // 恢復背景滾動 (彈窗關閉時解除鎖定)
      document.body.style.overflow = 'unset'
    }

    // 清理函數：確保元件卸載時恢復滾動
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ============ 事件處理 ============

  /**
   * 處理關閉彈窗
   * 只有在 allowClose=true 時才允許關閉
   */
  const handleClose = () => {
    if (!allowClose) return // 如果不允許關閉，直接返回

    // 開始關閉動畫
    setIsAnimating(false)
    // 等待動畫結束後執行關閉回調
    setTimeout(() => {
      onClose && onClose()
    }, 300) // 300ms 配合 CSS transition 時間
  }

  /**
   * 處理背景點擊事件
   * 只有點擊背景遮罩本身 (非卡片內容) 且允許關閉時才關閉彈窗
   */
  const handleBackdropClick = (e) => {
    // e.target === e.currentTarget 表示點擊的是遮罩本身，而非子元素
    if (e.target === e.currentTarget && allowClose) {
      handleClose()
    }
  }

  /**
   * 處理登入成功
   * 執行關閉動畫後調用成功回調
   */
  const handleLoginSuccess = (user) => {
    setIsAnimating(false)
    setTimeout(() => {
      onSuccess && onSuccess(user)
    }, 300)
  }

  /**
   * 處理註冊成功
   * 註冊成功後自動切換到登入表單，讓使用者登入
   */
  const handleRegisterSuccess = () => {
    setMode('login')
    // 可以在這裡顯示成功訊息 (例如使用 toast)
  }

  /**
   * 切換表單模式
   */
  const switchMode = (newMode) => {
    setMode(newMode)
  }

  /**
   * 切換到登入表單
   */
  const switchToLogin = () => {
    setMode('login')
  }

  /**
   * 切換到註冊表單
   */
  const switchToRegister = () => {
    setMode('register')
  }

  /**
   * 切換到忘記密碼表單 (OTP 版本)
   * 清空之前的狀態
   */
  const switchToForgotPassword = () => {
    setMode('forgot-password-otp')
    setResetEmail('')
    setVerifiedOTP('')
  }

  /**
   * 切換到 OTP 驗證頁面
   * @param {string} email - 使用者 Email
   */
  const switchToVerifyOTP = (email) => {
    setResetEmail(email)
    setMode('verify-otp')
  }

  /**
   * OTP 驗證成功後切換到重設密碼頁面
   * @param {string} email - 使用者 Email
   * @param {string} otp - 已驗證的 OTP
   */
  const switchToResetPassword = (email, otp) => {
    setResetEmail(email)
    setVerifiedOTP(otp)
    setMode('reset-password-otp')
  }

  /**
   * 密碼重置成功後返回登入頁面
   */
  const handleResetPasswordSuccess = () => {
    setMode('login')
    setResetEmail('')
    setVerifiedOTP('')
    // 可以在這裡顯示成功訊息
  }

  // ============ 如果未開啟，不渲染任何內容 ============
  if (!isOpen) return null

  // ============ 渲染 UI ============
  return (
    <div
      className={`fixed inset-0 z-200 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* 
        半透明背景遮罩
        - bg-black/30: 30% 不透明度的黑色 (原本 60%，現在降低讓背景更清楚)
        - backdrop-blur-sm: 輕微模糊效果，營造景深但不影響閱讀
        - absolute inset-0: 覆蓋整個螢幕
      */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* 
        登入/註冊卡片
        - relative: 相對定位，在遮罩之上
        - bg-white: 白色背景，確保表單清晰
        - rounded-2xl: 大圓角
        - shadow-2xl: 強烈陰影效果
        - 響應式寬度：手機 95vw，平板 md 尺寸，桌面 lg 尺寸
        - overflow-y-auto: 內容過多時可捲動
        - transition-all: 平滑過渡動畫
        - scale-100/95: 縮放動畫效果
      */}
      <div
        className={`relative bg-white shadow-2xl w-full max-h-[95vh] overflow-y-auto transition-all duration-300 
          max-w-[95vw] sm:max-w-md md:max-w-lg
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* 關閉按鈕 (只有在允許關閉時顯示) */}
        {allowClose && (
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-20 flex items-center gap-2 text-sm font-medium
              sm:-top-12 sm:right-0
              max-sm:top-4 max-sm:right-4 max-sm:text-gray-800"
            aria-label="關閉"
          >
            Close
            {/* X 圖示 */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* 表單內容區 - 響應式留白 */}
        <div className="py-12 px-6 sm:py-14 sm:px-10 md:py-16 md:px-20">
          {/* 根據模式顯示不同表單 */}
          {mode === 'login' && (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={switchToRegister}
              onSwitchToForgotPassword={switchToForgotPassword}
            />
          )}

          {mode === 'register' && (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}

          {/* 忘記密碼流程 - 步驟 1: 發送 OTP */}
          {mode === 'forgot-password-otp' && (
            <ForgotPasswordFormOTP
              onSwitchToVerifyOTP={switchToVerifyOTP}
              onBack={switchToLogin}
            />
          )}

          {/* 忘記密碼流程 - 步驟 2: 驗證 OTP */}
          {mode === 'verify-otp' && (
            <VerifyOTPForm
              email={resetEmail}
              onSuccess={switchToResetPassword}
              onBack={() => setMode('forgot-password-otp')}
            />
          )}

          {/* 忘記密碼流程 - 步驟 3: 重設密碼 */}
          {mode === 'reset-password-otp' && (
            <ResetPasswordFormOTP
              email={resetEmail}
              otp={verifiedOTP}
              onSuccess={handleResetPasswordSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
