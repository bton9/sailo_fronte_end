'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
// 使用 react-icons 的 ai/fi/lu 系列
import RIC_ai from '@/lib/react_icon/ai'
import RIC_fi from '@/lib/react_icon/fi'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './auth/LoginModal'
import ConfirmModal from './confirmModal'

const menuItems = [
  { id: 1, label: '規劃旅行', href: '#travel' },
  { id: 2, label: '商城', href: '#shop' },
  { id: 3, label: '行前清單', href: '#list' },
  { id: 4, label: '社群', href: '#social' },
]

export default function Navbar() {
  const { user, logout, showLoginModal, setShowLoginModal } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // const [showLoginModal, setShowLoginModal] = useState(false) //  移除本地狀態,改用全域
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  /**
   * 處理認證按鈕點擊事件
   *
   * 邏輯：
   * - 已登入：顯示登出確認視窗
   * - 未登入：開啟登入視窗（使用函數式更新避免重複開啟）
   */
  const handleAuthClick = async (e) => {
    e.preventDefault()

    if (user) {
      // 已登入 -> 顯示登出確認視窗
      setShowLogoutConfirm(true)
    } else {
      // 未登入 -> 開啟登入視窗
      // 🔧 使用函數式更新，檢查視窗是否已開啟
      setShowLoginModal((currentShowModal) => {
        if (!currentShowModal) {
          console.log(' [Navbar] 開啟登入視窗')
          return true
        } else {
          console.log('⚠️ [Navbar] 登入視窗已開啟，跳過重複開啟')
          return currentShowModal
        }
      })
    }
  }

  /**
   * 處理確認登出
   */
  const handleConfirmLogout = async () => {
    try {
      await logout()
      setShowLogoutConfirm(false)
    } catch (error) {
      console.error('登出失敗:', error)
      alert('登出失敗,請稍後再試')
      setShowLogoutConfirm(false)
    }
  }

  /**
   * 處理取消登出
   */
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  /**
   * 處理登入成功
   */
  const handleLoginSuccess = (user) => {
    setShowLoginModal(false)
    console.log('登入成功:', user)
  }

  /**
   * 處理關閉登入 Modal
   */
  const handleCloseLoginModal = () => {
    setShowLoginModal(false)
  }

  /**
   * 取得使用者顯示名稱
   */
  const getUserDisplayName = () => {
    if (!user) return ''
    return user.name || user.username || user.email || '使用者'
  }

  return (
    <>
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
        {/* 主導航欄 */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* 左側：LOGO (桌面版置中，手機版靠左) */}
              <div className="flex-1 xl:flex xl:justify-center xl:absolute xl:left-1/2 xl:transform xl:-translate-x-1/2">
                <Link href="/" className="inline-block">
                  <Image
                    src="/all-logo.svg"
                    alt="Logo"
                    width={180}
                    height={50}
                    priority
                    className="h-8 w-auto"
                  />
                </Link>
              </div>

              {/* 右側：圖示按鈕群組 */}
              <div className="hidden xl:flex items-center gap-5 ml-auto relative z-10">
                {/* 搜尋按鈕 */}
                <button
                  className="text-gray-700 hover:text-black transition-colors duration-200"
                  aria-label="搜尋"
                >
                  <RIC_fi.FiSearch className="text-xl" />
                </button>

                {/* 收藏按鈕 */}
                <button
                  className="text-gray-700 hover:text-black transition-colors duration-200"
                  aria-label="我的收藏"
                >
                  <RIC_ai.AiOutlineStar className="text-xl" />
                </button>

                {/* 購物車按鈕 */}
                <button
                  className="text-gray-700 hover:text-black transition-colors duration-200"
                  aria-label="購物車"
                >
                  <RIC_fi.FiShoppingBag className="text-xl" />
                </button>
                {/* 會員按鈕 - 整合登入/登出功能 */}
                <button
                  onClick={handleAuthClick}
                  className="text-gray-700 hover:text-black transition-colors duration-200 relative group"
                  aria-label={user ? '會員中心' : '登入/註冊'}
                  title={user ? getUserDisplayName() : '登入/註冊'}
                >
                  <RIC_fi.FiUser className="text-xl" />
                  {/* 已登入時顯示小圓點指示器 */}
                  {user && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>

              {/* 手機版選單按鈕 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden text-gray-700 hover:text-gray-900 p-2 ml-auto"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 次導航欄 - 橫向選單 (僅桌面版顯示) */}
        <div className="hidden xl:block border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-center gap-8 px-6 py-3">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm text-gray-700 hover:text-black transition-colors duration-200 font-medium whitespace-nowrap relative group"
                >
                  {item.label}
                  {/* 下劃線動畫效果 */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 手機版選單 */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-1">
              {/* 手機版選單項目 */}
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                  {item.label}
                </Link>
              ))}

              {/* 手機版功能按鈕 */}
              <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors duration-200">
                  <RIC_fi.FiSearch />
                  <span className="text-sm font-medium">搜尋</span>
                </button>

                <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors duration-200">
                  <RIC_ai.AiOutlineStar />
                  <span className="text-sm font-medium">收藏</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors duration-200">
                  <RIC_fi.FiShoppingBag />
                  <span className="text-sm font-medium">購物車</span>
                </button>
                {/* 手機版會員按鈕 - 整合登入/登出 */}
                <button
                  onClick={handleAuthClick}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors duration-200 relative"
                >
                  <RIC_fi.FiUser />
                  <span className="text-sm font-medium">
                    {user ? '會員' : '登入'}
                  </span>
                  {user && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* LoginModal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSuccess={handleLoginSuccess}
        allowClose={true}
      />

      {/* 登出確認視窗 */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="確認登出"
        message={`${getUserDisplayName()},確定要登出嗎?`}
        confirmText="確定"
        cancelText="取消"
        confirmButtonStyle="bg-red-500 hover:bg-red-600"
      />
    </>
  )
}
