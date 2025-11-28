/*
- 基本用法 (使用預設 10 秒延遲):
- ```jsx
- import AuthGuard from '@/components/auth/AuthGuard'
-
- export default function Page() {
- return (
-     <AuthGuard>
-       <YourPageContent />
-     </AuthGuard>
- )
- }
- 自訂延遲時間:
- ```jsx
- <AuthGuard delaySeconds={15}>
- <YourPageContent />
- </AuthGuard>

- 使用自訂未登入畫面:
- ```jsx
- <AuthGuard fallback={<CustomUnauthorizedPage />}>
- <ProtectedContent />
- </AuthGuard>
*/
'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'
import WaveLoading from '@/components/waveLoading'

export default function AuthGuard({
  children,
  fallback = null,
  delaySeconds = 10, // 預設延遲 10 秒,可透過 props 調整
}) {
  // ============ 狀態管理 ============
  const { isAuthenticated, isLoading, showLoginModal, setShowLoginModal } =
    useAuth()
  // const [showLoginModal, setShowLoginModal] = useState(false) //  移除本地狀態,改用全域
  const [countdown, setCountdown] = useState(delaySeconds) // 倒數秒數
  const [showCountdown, setShowCountdown] = useState(false) // 是否顯示倒數提示條

  // 使用 useRef 追蹤是否已手動開啟，避免 setState 觸發 useEffect 重新執行
  const hasManuallyOpenedRef = useRef(false)
  const countdownIntervalRef = useRef(null)
  const hasInitializedRef = useRef(false) // 追蹤是否已初始化倒數

  // ============ 延遲顯示登入彈窗的邏輯 ============
  useEffect(() => {
    console.log('🔄 [AuthGuard] useEffect 執行', {
      isAuthenticated,
      isLoading,
      hasManuallyOpened: hasManuallyOpenedRef.current,
      hasInitialized: hasInitializedRef.current,
      showCountdown,
      countdown,
    })

    // 如果已登入或正在載入，重置所有狀態
    if (isAuthenticated || isLoading) {
      console.log(' [AuthGuard] 已登入或載入中，重置所有狀態')
      // 只在需要時才更新狀態，避免不必要的渲染
      if (showLoginModal) {
        setShowLoginModal(false)
      }
      if (showCountdown) {
        setShowCountdown(false)
      }
      hasManuallyOpenedRef.current = false
      hasInitializedRef.current = false
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
      return
    }

    // ⭐ 關鍵：如果已經手動開啟或已初始化，直接返回，不執行任何操作
    if (hasManuallyOpenedRef.current || hasInitializedRef.current) {
      console.log('⏹️ [AuthGuard] 已手動開啟或已初始化，不執行任何操作')
      return
    }

    // 未登入且未初始化時，開始倒數計時（只執行一次）
    console.log('▶️ [AuthGuard] 開始初始化倒數計時器')
    hasInitializedRef.current = true
    setShowCountdown(true)
    setCountdown(delaySeconds)

    // 設定倒數計時器 (每秒更新一次)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // ⭐ 關鍵修正：檢查是否已手動開啟或視窗已開啟，避免重複開啟
          if (hasManuallyOpenedRef.current) {
            console.log('⏹️ [AuthGuard] 計時器回調：已手動開啟，取消自動彈出')
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
            return 0
          }

          console.log('⏰ [AuthGuard] 倒數結束，準備顯示登入彈窗')

          // 使用 setTimeout 確保在下一個事件循環中執行
          setTimeout(() => {
            console.log('🚀 [AuthGuard] 執行開啟登入視窗')
            setShowLoginModal(true)
            setShowCountdown(false)
          }, 0)

          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 清理函數：當元件卸載或依賴項改變時，清除計時器
    return () => {
      console.log('🧹 [AuthGuard] 清理函數執行')
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [isLoading, isAuthenticated, delaySeconds, setShowLoginModal])

  // ============ 監聽登入視窗狀態變化 ============
  /**
   * 當登入視窗被外部開啟（例如 Sidebar/Navbar 點擊登入）時：
   * 1. 停止倒數計時器
   * 2. 隱藏倒數提示條
   * 3. 標記為已手動開啟
   *
   * 這樣可以防止倒數結束後再次觸發開啟
   */
  useEffect(() => {
    if (showLoginModal && !isAuthenticated) {
      console.log('🔔 [AuthGuard] 偵測到登入視窗開啟（可能來自外部）')

      // 停止倒數計時器
      if (countdownIntervalRef.current) {
        console.log('🛑 [AuthGuard] 停止倒數計時器')
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }

      // 隱藏倒數提示條
      setShowCountdown(false)

      // 標記為已手動開啟，防止倒數結束後再次開啟
      hasManuallyOpenedRef.current = true

      console.log(' [AuthGuard] 已處理外部開啟，防止重複彈出', {
        hasManuallyOpened: hasManuallyOpenedRef.current,
      })
    }
  }, [showLoginModal, isAuthenticated])

  // ============ 渲染邏輯 ============

  // 情況 1: 正在載入使用者資料
  if (isLoading) {
    return <WaveLoading text="載入中..." />
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || children}

        {showCountdown && countdown > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-10000 animate-slideUp">
            <div className="bg-primary-300 text-white py-4 px-6 shadow-lg">
              <div className="max-w-7xl px-10 mx-auto flex items-center justify-between">
                {/* 
                  💬 提示訊息區塊
                  包含：警告圖示 + 主標題 + 副標題 + 倒數秒數
                */}
                <div className="flex items-center gap-3">
                  {/* 動態警告圖示 (使用 pulse 動畫吸引注意) */}
                  <div className="animate-pulse text-2xl"></div>

                  <div>
                    {/* 主標題：顯示倒數秒數 */}
                    <p className="font-semibold text-lg">馬上開啟你的旅程！</p>

                    {/* 副標題：引導使用者行動 */}
                    <p className="text-sm text-white/80">
                      點擊按鈕立即登入，解鎖完整功能
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('🖱️ [AuthGuard] 點擊立即登入按鈕', {
                      before: {
                        hasManuallyOpened: hasManuallyOpenedRef.current,
                        hasInitialized: hasInitializedRef.current,
                        showCountdown,
                        countdown,
                      },
                    })

                    // 立即清除計時器
                    if (countdownIntervalRef.current) {
                      console.log('🛑 [AuthGuard] 清除計時器')
                      clearInterval(countdownIntervalRef.current)
                      countdownIntervalRef.current = null
                    }

                    setCountdown(0) // 立即結束倒數
                    setShowCountdown(false) // 隱藏提示條
                    setShowLoginModal(true) // 顯示登入彈窗
                    hasManuallyOpenedRef.current = true // 設定手動開啟標記
                    hasInitializedRef.current = true // 確保已標記為已初始化

                    console.log(' [AuthGuard] 設定完成', {
                      after: {
                        hasManuallyOpened: hasManuallyOpenedRef.current,
                        hasInitialized: hasInitializedRef.current,
                      },
                    })
                  }}
                  className="bg-white text-secondary-900 hover:bg-secondary-900 hover:text-white px-6 py-2 font-semibold transition-all"
                >
                  立即登入
                </button>
              </div>
            </div>
          </div>
        )}

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {}} // 空函數，因為不允許關閉
          onSuccess={() => setShowLoginModal(false)} // 登入成功後關閉彈窗
          allowClose={false} // 🔒 不允許關閉，必須登入
        />
      </>
    )
  }

  return <>{children}</>
}
