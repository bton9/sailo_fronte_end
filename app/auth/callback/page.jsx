/**
 * Google OAuth 回調處理頁面 (Auth V2)
 * 路徑: sailo/app/auth/callback/page.jsx
 *
 * Auth V2 功能：
 * 1. 後端已透過 httpOnly cookies 設定 tokens (access_token, refresh_token, session_token)
 * 2. 前端只需從後端 API 取得使用者資料
 * 3. 更新 AuthContext 狀態
 * 4. 導向到原本的頁面或預設頁面
 *
 * Auth V2 安全性改進：
 * - ✅ Tokens 儲存在 httpOnly cookies（無法被 JavaScript 存取）
 * - ✅ 不使用 localStorage 儲存敏感資料
 * - ✅ 前端透過 credentials: 'include' 自動傳送 cookies
 * - ✅ 防止 XSS 攻擊竊取 tokens
 *
 * 流程：
 * 1. Google 授權成功後，後端設定 httpOnly cookies
 * 2. 後端可能重導向到此頁面（相容舊流程）
 * 3. 前端呼叫 /api/v2/auth/me 取得使用者資料（cookies 自動傳送）
 * 4. 更新 AuthContext 狀態
 * 5. 導向到使用者原本要去的頁面
 *
 * 注意：此頁面主要用於相容舊的 OAuth 流程
 * Auth V2 的 Google 登入通常直接重導向到目標頁面，不經過此頁面
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallbackPage() {
  // ============ Hooks ============
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  // ============ 狀態管理 ============
  const [status, setStatus] = useState('processing') // 'processing', 'success', 'error'
  const [message, setMessage] = useState('正在處理 Google 登入...')

  // ============ 處理回調 ============
  useEffect(() => {
    handleCallback()
  }, [])

  /**
   * 處理 Google OAuth 回調 (Auth V2)
   *
   * Auth V2 安全流程：
   * 1. 檢查是否有錯誤參數
   * 2. 呼叫後端 /api/v2/auth/me 取得使用者資料（cookies 自動傳送）
   * 3. 更新 AuthContext 狀態
   * 4. 導向到原本的頁面
   */
  async function handleCallback() {
    try {
      // ========================================
      // 步驟 1: 檢查錯誤
      // ========================================
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(decodeURIComponent(error))
        return
      }

      // ========================================
      // 步驟 2: 從後端取得使用者資料
      // ========================================
      // Auth V2: Tokens 已經在 httpOnly cookies 中
      // 只需呼叫 /api/v2/auth/me，瀏覽器會自動傳送 cookies
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      const response = await fetch(`${API_BASE_URL}/api/v2/auth/me`, {
        method: 'GET',
        credentials: 'include', // 🔑 重要：傳送 httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('無法取得使用者資料')
      }

      const data = await response.json()

      if (!data.success || !data.user) {
        throw new Error('使用者資料無效')
      }

      const user = data.user

      // ========================================
      // 步驟 3: 更新 AuthContext 狀態
      // ========================================
      // Auth V2: 不使用 localStorage 儲存使用者資料
      // 直接更新 AuthContext，讓 Context 處理狀態管理
      if (login) {
        await login(user)
      }

      // 設定成功狀態
      setStatus('success')
      setMessage('登入成功！即將跳轉...')

      // ========================================
      // 步驟 4: 導向到原本的頁面
      // ========================================
      // 從 URL 參數讀取重導向路徑（後端可能傳遞）
      const redirectTo = searchParams.get('redirect') || '/site/membercenter'

      console.log('🔄 準備重導向到:', redirectTo)

      // 延遲 1 秒後導向
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } catch (error) {
      console.error('❌ Google 登入回調錯誤:', error)
      setStatus('error')
      setMessage('登入處理失敗，請稍後再試')
    }
  }

  // ============ 渲染 UI ============
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* 處理中 */}
        {status === 'processing' && (
          <div className="text-center space-y-6">
            {/* Loading 動畫 */}
            <div className="flex justify-center">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            {/* 訊息 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                處理中...
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        )}

        {/* 成功 */}
        {status === 'success' && (
          <div className="text-center space-y-6">
            {/* 成功圖示 */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-5xl">✅</span>
              </div>
            </div>

            {/* 訊息 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                登入成功！
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        )}

        {/* 錯誤 */}
        {status === 'error' && (
          <div className="text-center space-y-6">
            {/* 錯誤圖示 */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">❌</span>
              </div>
            </div>

            {/* 訊息 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                登入失敗
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* 返回首頁按鈕 */}
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              返回首頁
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
