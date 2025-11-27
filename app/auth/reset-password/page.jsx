'use client'

/**
 * 重置密碼頁面 (Password Reset Page)
 *
 * 此頁面用於處理密碼重置流程，使用者通過郵件中的連結到達此頁面。
 * 流程：
 * 1. 從 URL 參數中提取重置 token
 * 2. 渲染 ResetPasswordForm 組件
 * 3. 使用者輸入新密碼並提交
 * 4. 成功後自動導向登入頁面
 *
 * URL 格式：/auth/reset-password?token=xxxx
 *
 * @module ResetPasswordPage
 */

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

/**
 * 重置密碼頁面組件
 *
 * @returns {JSX.Element} 重置密碼頁面
 */
export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  /**
   * 從 URL 參數中提取 token
   * 如果沒有 token，顯示錯誤訊息
   */
  useEffect(() => {
    const resetToken = searchParams.get('token')

    if (!resetToken) {
      setError('無效的重置連結，請重新申請密碼重置。')
    } else {
      setToken(resetToken)
    }
  }, [searchParams])

  /**
   * 密碼重置成功後的處理
   * 等待 2 秒後導向登入頁面
   */
  const handleResetSuccess = () => {
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 頁面標題區 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">重置密碼</h1>
          <p className="text-gray-600">請設定您的新密碼</p>
        </div>

        {/* 錯誤訊息顯示 */}
        {error ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              {/* 錯誤圖示 */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
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
              </div>

              {/* 錯誤訊息 */}
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                重置連結無效
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>

              {/* 返回首頁按鈕 */}
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回首頁
              </button>
            </div>
          </div>
        ) : token ? (
          /* 顯示重置密碼表單 */
          <ResetPasswordForm token={token} onSuccess={handleResetSuccess} />
        ) : (
          /* 載入中狀態 */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">載入中...</p>
            </div>
          </div>
        )}

        {/* 返回登入連結 */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
          >
            ← 返回登入頁面
          </button>
        </div>
      </div>
    </div>
  )
}
