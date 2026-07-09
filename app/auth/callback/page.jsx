/**
 * Google OAuth 回調處理頁面 (Auth V2)
 * 路徑: sailo/app/auth/callback/page.jsx
 *
 * 後端 Google callback 不會在「Google → 後端 → 前端」的跨網域轉址鏈中直接
 * 用 res.cookie() 設 cookie——Safari 的反彈追蹤防護 (bounce tracking
 * protection) 會把那種轉址鏈中設定的 cookie 直接丟棄。改成後端先把 token
 * 暫存起來、只在網址帶一個短效期一次性代碼過來，這個頁面再用一般 fetch
 * （非導向）把代碼換成真正的 httpOnly cookie，避開轉址鏈設 cookie 的模式。
 *
 * 流程：
 * 1. Google 授權成功後，後端重導向到本頁面，網址帶 ?code=一次性代碼
 * 2. 本頁面用 fetch POST /api/v2/auth/google/exchange 把代碼換成 httpOnly cookie
 * 3. 呼叫 /api/v2/auth/verify 取得使用者資料（cookies 自動傳送）
 * 4. 呼叫 AuthContext 的 reloadUser() 同步全域登入狀態
 * 5. 導向到使用者原本要去的頁面
 */

'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/services/api'

function AuthCallbackContent() {
  // ============ Hooks ============
  const router = useRouter()
  const searchParams = useSearchParams()
  const { reloadUser } = useAuth()

  // ============ 狀態管理 ============
  const [status, setStatus] = useState('processing') // 'processing', 'success', 'error'
  const [message, setMessage] = useState('正在處理 Google 登入...')
  // 一次性交換代碼只能兌換一次，用 ref 擋掉 React Strict Mode 在開發模式下
  // 對 useEffect 的重複呼叫，避免第二次呼叫因代碼已被用掉而誤判登入失敗
  const hasRunRef = useRef(false)

  // ============ 處理回調 ============
  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true
    handleCallback()
  }, [])

  /**
   * 處理 Google OAuth 回調 (Auth V2)
   *
   * 1. 檢查是否有錯誤參數
   * 2. 用一次性代碼換取 httpOnly cookie
   * 3. 呼叫 /api/v2/auth/verify 取得使用者資料（cookies 自動傳送）
   * 4. 更新 AuthContext 狀態
   * 5. 導向到原本的頁面
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

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      // ========================================
      // 步驟 2: 用一次性代碼換取 httpOnly cookie
      // ========================================
      // 後端 Google callback 不再直接於轉址鏈中設 cookie（Safari 的反彈
      // 追蹤防護會把那種模式下設定的 cookie 丟棄），改成帶一個短效期代碼
      // 過來，這裡用一般 fetch（非導向）換成真正的登入 cookie
      const code = searchParams.get('code')
      // 一次性代碼只能兌換一次；用 sessionStorage 記錄「這個代碼已經換過」，
      // 防止開發模式熱重載或 React Strict Mode 造成的重複掛載重新呼叫
      // 已經用掉的代碼（跟 hasRunRef 不同，這個能撐過元件整個重新掛載）
      const usedCodeKey = code ? `google_oauth_code_used_${code}` : null
      const alreadyUsed = usedCodeKey
        ? sessionStorage.getItem(usedCodeKey)
        : false

      if (code && !alreadyUsed) {
        sessionStorage.setItem(usedCodeKey, '1')

        const exchangeResponse = await fetch(
          `${API_BASE_URL}/api/v2/auth/google/exchange`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          }
        )

        const exchangeData = await exchangeResponse.json()

        if (!exchangeResponse.ok || !exchangeData.success) {
          throw new Error(exchangeData.message || '登入代碼交換失敗')
        }
      }

      // ========================================
      // 步驟 3: 從後端取得使用者資料
      // ========================================
      // Tokens 已經在 httpOnly cookies 中，呼叫 /api/v2/auth/verify
      // 瀏覽器會自動傳送 cookies（跟 AuthContext 內部驗證用同一支 API）
      const data = await authAPI.verify()

      if (!data.valid || !data.user) {
        throw new Error('使用者資料無效')
      }

      // ========================================
      // 步驟 4: 更新 AuthContext 狀態
      // ========================================
      // 重新載入使用者資料，讓 AuthContext 的 user/isAuthenticated 同步更新
      await reloadUser()

      // 設定成功狀態
      setStatus('success')
      setMessage('登入成功！即將跳轉...')

      // ========================================
      // 步驟 5: 導向到原本的頁面
      // ========================================
      // 從 URL 參數讀取重導向路徑（後端可能傳遞）
      const redirectTo = searchParams.get('redirect') || '/site/membercenter'

      console.log('🔄 準備重導向到:', redirectTo)

      // 延遲 1 秒後導向
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } catch (error) {
      console.error(' Google 登入回調錯誤:', error)
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
                <span className="text-5xl"></span>
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
                <span className="text-5xl"></span>
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  )
}
