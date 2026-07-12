/**
 * Admin Dashboard - 管理者儀表板
 * 路徑: sailo/app/admin/page.jsx
 *
 * 功能說明:
 * 1. 管理者主控台頁面
 * 2. 顯示系統統計資訊
 * 3. 快速導航到各管理功能
 * 4. 未來擴展: 客服系統、商品管理
 *
 * 設計參考:
 * - 參考 membercenter 的視覺風格
 * - 使用 Tailwind CSS 和 Lucide Icons
 * - 響應式設計 (支援手機/平板/桌面)
 *
 * 使用技術:
 * - Next.js 15 App Router
 * - React 19
 * - AuthContext (OAuth 2.0)
 * - httpOnly Cookie (不使用 localStorage)
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotify } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'
import {
  Users,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Settings,
  Package,
} from 'lucide-react'

export default function AdminDashboard() {
  // ============ 狀態管理 ============
  const { user, isAuthenticated } = useAuth()
  const notify = useNotify()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingSupport: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // ============ API 配置 ============
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  /**
   * 載入統計資料
   */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsResponse, csResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v2/admin/stats`, {
            credentials: 'include', // 自動帶上 httpOnly cookie
          }),
          fetch(`${API_BASE_URL}/api/customer-service/admin/stats`, {
            credentials: 'include',
          }),
        ])

        let totalUsers = 0
        let totalOrders = 0
        let totalProducts = 0
        let pendingSupport = 0

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            totalUsers = statsData.stats.totalUsers || 0
            totalOrders = statsData.stats.totalOrders || 0
            totalProducts = statsData.stats.totalProducts || 0
          }
        }

        if (csResponse.ok) {
          const csData = await csResponse.json()
          if (csData.success) {
            // 等待中的聊天室數量
            pendingSupport = csData.stats.waiting || 0
          }
        }

        setStats({ totalUsers, totalOrders, totalProducts, pendingSupport })
        setIsLoading(false)
      } catch (error) {
        console.error('載入統計資料失敗:', error)
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalProducts: 0,
          pendingSupport: 0,
        })
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user?.access === 'admin') {
      loadStats()
    }
  }, [isAuthenticated, user, API_BASE_URL])

  // ============ 統計卡片配置 ============
  const statCards = [
    {
      id: 'users',
      title: '總會員數',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'orders',
      title: '總訂單數',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      id: 'products',
      title: '商品總數',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      id: 'support',
      title: '待處理客服',
      value: stats.pendingSupport,
      icon: MessageSquare,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  // ============ 快速功能配置 ============
  const quickActions = [
    {
      id: 'customer-service',
      title: '客服系統',
      description: '管理客戶諮詢與回覆',
      icon: MessageSquare,
      color: 'bg-blue-500',
      href: '/admin/customer-service',
      badge: stats.pendingSupport > 0 ? stats.pendingSupport : null,
      status: 'active', //  已啟用客服系統
    },
    {
      id: 'product-management',
      title: '商品管理',
      description: '上架、下架、編輯商品',
      icon: Package,
      color: 'bg-green-500',
      href: '/admin/products',
      badge: null,
      status: 'coming-soon',
    },
    {
      id: 'order-management',
      title: '訂單管理',
      description: '查看與處理訂單',
      icon: ShoppingBag,
      color: 'bg-purple-500',
      href: '/admin/orders',
      badge: null,
      status: 'coming-soon',
    },
    {
      id: 'user-management',
      title: '會員管理',
      description: '管理使用者帳戶',
      icon: Users,
      color: 'bg-orange-500',
      href: '/admin/users',
      badge: null,
      status: 'coming-soon',
    },
    {
      id: 'analytics',
      title: '數據分析',
      description: '查看系統統計報表',
      icon: BarChart3,
      color: 'bg-pink-500',
      href: '/admin/analytics',
      badge: null,
      status: 'coming-soon',
    },
    {
      id: 'settings',
      title: '系統設定',
      description: '調整系統參數與配置',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/admin/settings',
      badge: null,
      status: 'coming-soon',
    },
  ]

  /**
   * 處理功能卡片點擊
   *
   * @param {Object} action - 功能配置物件
   */
  const handleActionClick = (action) => {
    if (action.status === 'coming-soon') {
      notify('此功能即將推出，敬請期待！', 'info')
      return
    }
    router.push(action.href)
  }

  // ============ 載入狀態 ============
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* ============ 頁面標題區 ============ */}
      <div className="max-w-7xl mx-auto">
        {/* 標題與歡迎訊息 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            管理者儀表板
          </h1>
          <p className="text-gray-600">
            歡迎回來，{user?.nickname || user?.email}
          </p>
        </div>

        {/* ============ 統計卡片區 ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const IconComponent = card.icon
            return (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* 圖示 */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>

                {/* 標題與數值 */}
                <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>

        {/* ============ 快速功能區 ============ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">快速功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              const isComingSoon = action.status === 'coming-soon'

              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`
                    relative bg-white rounded-xl shadow-sm p-6 text-left
                    transition-all duration-200
                    ${
                      isComingSoon
                        ? 'opacity-75 cursor-not-allowed'
                        : 'hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                  disabled={isComingSoon}
                >
                  {/* 即將推出標籤 */}
                  {isComingSoon && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        即將推出
                      </span>
                    </div>
                  )}

                  {/* 待處理數量標籤 */}
                  {action.badge && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {action.badge}
                      </span>
                    </div>
                  )}

                  {/* 圖示 */}
                  <div
                    className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>

                  {/* 標題與描述 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>

                  {/* 箭頭指示 */}
                  {!isComingSoon && (
                    <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                      <span>進入管理</span>
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ============ 最近活動區 (預留) ============ */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">最近活動</h2>
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-8">暫無活動紀錄</p>
          </div>
        </div>
      </div>
    </div>
  )
}
