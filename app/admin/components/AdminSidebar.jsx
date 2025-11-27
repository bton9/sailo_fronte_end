/**
 * Admin Sidebar - 管理者側邊選單
 * 路徑: sailo/app/admin/components/AdminSidebar.jsx
 *
 * 功能說明:
 * 1. 管理者專用側邊導航選單
 * 2. 支援展開/收合動畫
 * 3. 響應式設計 (手機版/桌面版)
 * 4. 顯示管理員資訊
 *
 * 設計參考:
 * - 參考主站的 sidebar.jsx 設計
 * - 使用相同的視覺風格和動畫
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import ConfirmModal from '@/components/confirmModal'

/**
 * 管理選單項目配置
 */
const adminMenuItems = [
  {
    id: 'dashboard',
    label: '儀表板',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    id: 'customer-service',
    label: '客服系統',
    icon: MessageSquare,
    href: '/admin/customer-service',
  },
  {
    id: 'users',
    label: '會員管理',
    icon: Users,
    href: '/admin/users',
    comingSoon: true,
  },
  {
    id: 'products',
    label: '商品管理',
    icon: Package,
    href: '/admin/products',
    comingSoon: true,
  },
  {
    id: 'orders',
    label: '訂單管理',
    icon: ShoppingBag,
    href: '/admin/orders',
    comingSoon: true,
  },
  {
    id: 'analytics',
    label: '數據分析',
    icon: BarChart3,
    href: '/admin/analytics',
    comingSoon: true,
  },
  {
    id: 'settings',
    label: '系統設定',
    icon: Settings,
    href: '/admin/settings',
    comingSoon: true,
  },
]

export default function AdminSidebar() {
  // ============ 狀態管理 ============
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false) // 桌面版展開狀態
  const [isMobileOpen, setIsMobileOpen] = useState(false) // 手機版開關
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  /**
   * 檢測螢幕尺寸
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  /**
   * 處理登出確認
   */
  const handleConfirmLogout = async () => {
    try {
      await logout()
      setShowLogoutConfirm(false)
    } catch (error) {
      console.error('登出失敗:', error)
      alert('登出失敗，請稍後再試')
    }
  }

  /**
   * 處理選單項目點擊
   */
  const handleMenuClick = (item) => {
    if (item.comingSoon) {
      alert('此功能即將推出，敬請期待！')
      return
    }

    // 手機版點擊後關閉選單
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  /**
   * 取得頭像 URL
   */
  const getAvatarUrl = () => {
    if (!user?.avatar) {
      return 'https://ik.imagekit.io/crjen7iza/avatars/avatarxxx01.png'
    }
    return user.avatar
  }

  return (
    <>
      {/* ============ 手機版漢堡選單按鈕 ============ */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 bg-secondary-600 text-white p-3 shadow-lg md:hidden"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* ============ 遮罩層 (手機版) ============ */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ============ 側邊選單主體 ============ */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-lg z-40
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? `${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
              : `${isExpanded ? 'w-64' : 'w-20'}`
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* ============ Logo 與管理員標題 ============ */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                {(isExpanded || isMobileOpen) && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      管理後台
                    </h2>
                    <p className="text-xs text-gray-500">Admin Panel</p>
                  </div>
                )}
              </div>

              {/* 桌面版展開/收合按鈕 */}
              {!isMobile && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronLeft size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ============ 管理員資訊 ============ */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Image
                src={getAvatarUrl()}
                alt="管理員頭像"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              {(isExpanded || isMobileOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-secondary-600 font-medium">
                    管理員
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ============ 選單項目 ============ */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {adminMenuItems.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                const showLabel = isExpanded || isMobileOpen

                return (
                  <li key={item.id}>
                    <Link
                      href={item.comingSoon ? '#' : item.href}
                      onClick={(e) => {
                        if (item.comingSoon) {
                          e.preventDefault()
                          handleMenuClick(item)
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-secondary-100 text-secondary-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <IconComponent size={20} />
                      {showLabel && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {showLabel && item.comingSoon && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5">
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* ============ 返回前台與登出按鈕 ============ */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* 返回前台按鈕 */}
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
              {(isExpanded || isMobileOpen) && <span>返回前台</span>}
            </Link>

            {/* 登出按鈕 */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              {(isExpanded || isMobileOpen) && <span>登出</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ============ 登出確認視窗 ============ */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="確認登出"
        message="您確定要登出嗎？"
        confirmText="登出"
        cancelText="取消"
      />
    </>
  )
}
