/**
 * Admin Layout - 管理者頁面布局
 * 路徑: sailo/app/admin/layout.jsx
 *
 * 功能說明:
 * 1. 管理者專用布局
 * 2. 包含權限驗證 (只允許 access = 'admin' 的使用者)
 * 3. 包含側邊選單和頁面守衛
 * 4. 自動重導向未授權使用者
 *
 * 使用技術:
 * - Next.js App Router
 * - AuthContext (OAuth 2.0, httpOnly cookie)
 * - AuthGuard 頁面守衛
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/auth/AuthGuard'
import AdminSidebar from './components/AdminSidebar'
import '@/app/globals.css'

export default function AdminLayout({ children }) {
  // ============ 認證與路由 ============
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  /**
   * 權限檢查
   *
   * 流程:
   * 1. 等待認證載入完成
   * 2. 檢查是否登入
   * 3. 檢查是否為管理員 (access === 'admin')
   * 4. 未授權則導向首頁
   */
  useEffect(() => {
    // 等待載入完成
    if (isLoading) return

    // 未登入,由 AuthGuard 處理
    if (!isAuthenticated) return

    // 已登入但不是管理員
    if (user && user.access !== 'admin') {
      console.warn(' 非管理員嘗試訪問管理頁面:', user.email)
      alert('您沒有權限訪問此頁面')
      router.push('/')
    }
  }, [isAuthenticated, isLoading, user, router])

  // ============ 載入中狀態 ============
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  // ============ 權限不足 ============
  // 顯示給已登入但非管理員的使用者
  if (isAuthenticated && user && user.access !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">權限不足</h1>
          <p className="text-gray-600 mb-6">您沒有權限訪問管理者頁面</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    )
  }

  // ============ 管理員頁面內容 ============
  return (
    <AuthGuard delaySeconds={5}>
      <div className="flex min-h-screen bg-gray-50">
        {/* 側邊選單 */}
        <AdminSidebar />

        {/* 主要內容區 (自動適應側邊選單寬度) */}
        <main className="flex-1 md:ml-20">{children}</main>
      </div>
    </AuthGuard>
  )
}
