'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './auth/LoginModal'
import ConfirmModal from './confirmModal'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import RIC_fi from '@/lib/react_icon/fi'
import Link from 'next/link'

const menuItems = [
  {
    id: 0,
    label: 'Home',
    subLabel: '首頁',
    icon: RIC_fi.FiHome,
    href: '/',
  },
  {
    id: 1,
    label: 'Travel',
    subLabel: '規劃行程',
    icon: RIC_fi.FiCompass,
    href: '/site/custom',
  },
  {
    id: 2,
    label: 'Shop',
    subLabel: '商城',
    icon: RIC_fi.FiShoppingBag,
    href: '/site/product',
  },
  {
    id: 3,
    label: 'Blog',
    subLabel: '社群',
    icon: RIC_fi.FiMessageCircle,
    href: '/site/blog',
  },
  {
    id: 4,
    label: 'Member Center',
    subLabel: '會員中心',
    icon: RIC_fi.FiUser,
    href: '/site/membercenter',
  },
]

const SideMenu = () => {
  const { user, logout, showLoginModal, setShowLoginModal } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 檢測螢幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 防止背景滾動當手機選單打開時
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isMobileOpen])

  const authItem = user
    ? { id: 6, label: '登出', icon: RIC_fi.FiLogOut }
    : { id: 5, label: '登入/註冊', icon: RIC_fi.FiUser }

  const handleAuthClick = async (e) => {
    e.preventDefault()

    if (user) {
      setShowLogoutConfirm(true)
    } else {
      setShowLoginModal((currentShowModal) => {
        if (!currentShowModal) {
          console.log('✅ [Sidebar] 開啟登入視窗')
          return true
        } else {
          console.log('⚠️ [Sidebar] 登入視窗已開啟，跳過重複開啟')
          return currentShowModal
        }
      })
    }
  }

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

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const handleLoginSuccess = (user) => {
    setShowLoginModal(false)
    console.log('登入成功:', user)
  }

  const handleCloseLoginModal = () => {
    setShowLoginModal(false)
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    return user.nickname || user.email || '使用者'
  }

  const getUserAvatar = () => {
    if (!user) return ''
    return user.avatar || 'user'
  }

  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* 手機版頂部導航欄 */}
      {isMobile && (
        <header className="sticky top-0 fixed left-0 right-0 h-16 bg-white z-500 flex items-center justify-between px-4 md:hidden">
          {/* 漢堡選單按鈕 - 點擊切換開關 */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex items-center justify-center w-10 h-10 text-stone-600"
            aria-label={isMobileOpen ? "關閉選單" : "開啟選單"}
          >
            {isMobileOpen ? (
              <RIC_fi.FiX className="w-6 h-6" />
            ) : (
              <RIC_fi.FiMenu className="w-6 h-6" />
            )}
          </button>

          {/* 中央 LOGO */}
          <Link href="/" className="flex-1 flex pe-1 justify-center">
            <Image
              src="/LOGO2.svg"
              alt="SAILO享遊網站LOGO"
              width={120}
              height={30}
              priority
            />
          </Link>
        </header>
      )}

      {/* 遮罩層 - 桌面版和手機版都使用 */}
      {((isMobile && isMobileOpen) || (!isMobile && isExpanded)) && (
        <div
          className="fixed inset-0 bg-black/30 z-60"
          onClick={() => {
            if (isMobile) {
              setIsMobileOpen(false)
            } else {
              setIsExpanded(false)
            }
          }}
        />
      )}

      {/* 桌面版左上角漢堡按鈕 */}
      {!isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-6 left-6 z-60 flex items-center justify-center w-10 h-10 text-gray-800 hover:text-gray-600 transition-colors bg-white rounded-md shadow-md"
          aria-label="開啟選單"
        >
          <RIC_fi.FiMenu className="w-6 h-6" />
        </button>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white z-60
          transition-all duration-300 ease-in-out
          flex flex-col
          ${
            isMobile
              ? `w-full max-w-[85vw] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
              : `w-[500px] ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`
          }
        `}
      >
        {/* 頂部區域 */}
        <div className="relative w-full pt-6 pb-4 px-8">
          {/* 關閉按鈕在右上角 */}
          <button
            onClick={() => {
              if (isMobile) {
                setIsMobileOpen(false)
              } else {
                setIsExpanded(false)
              }
            }}
            className="absolute right-8 top-6 flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors"
            aria-label="關閉選單"
          >
            Close
            <RIC_fi.FiX className="w-5 h-5" />
          </button>
        </div>

        {/* 選單項目列表 */}
        <nav className="flex-1 w-full px-8 pt-8 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleMenuItemClick}
              className="group block py-4 w-full"
            >
              <div className="group relative items-center justify-between w-full grid grid-cols-3 cursor-pointer my-2 px-10">
                {/* 左側: 英文標籤 (主標題) */}
                <span className="col-span-2 text-2xl font-serif text-gray-800 relative inline-block">
                  {item.label}
                </span>
                {/* 右側：中文副標籤 */}
                <span className="text-md text-primary-500 transition-all duration-500">
                  {item.subLabel}
                </span>
                {/* 🌟 核心：整行 Underline 效果 (從左到右畫出) 🌟 */}
                <span className="absolute left-10 top-10 bottom-0 w-0 h-[2px] bg-gray-500 transition-all duration-700 group-hover:w-[350px]"></span>
              </div>
            </Link>
          ))}
        </nav>

        {/* 底部登入/登出按鈕 */}
        <div className="w-full px-15 pb-10 mt-auto">
          {user ? (
            // 🌟 已登入狀態: 左側顯示「您好，XXX」，右側顯示「登出」 🌟
            <div className="flex items-center justify-between w-full">
              {/* 左側: 歡迎訊息 */}
              <div className="flex items-center gap-2 text-gray-800 text-md font-bold">
                您好，{getUserDisplayName()}
                {getUserAvatar() !== 'user' && (
                  <Image
                    src={getUserAvatar()}
                    alt={`${getUserDisplayName()}的頭貼`}
                    width={30}
                    height={30}
                    className="rounded-full object-cover bg-black"
                  />
                )}
              </div>

              {/* 右側: 登出按鈕 */}
              <button
                onClick={handleAuthClick}
                className="px-4 py-1 border border-gray-800 text-gray-800 text-sm font-bold hover:bg-gray-100 transition duration-150"
              >
                登出
              </button>
            </div>
          ) : (
            // 🌟 未登入狀態: 點擊按鈕進入登入/註冊 🌟
            <div className="flex justify-end w-full">
              <button
                onClick={handleAuthClick}
                className="px-4 py-1 border border-gray-800 text-gray-800 text-sm hover:bg-gray-100 transition duration-150"
              >
                登入
              </button>
            </div>
          )}
        </div>
      </aside>

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
        confirmButtonStyle="bg-point-500 hover:bg-orange-600"
      />
    </>
  )
}

export default SideMenu