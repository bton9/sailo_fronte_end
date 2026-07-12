'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import {
  Settings,
  Edit,
  Star,
  Filter,
  LogOut,
  FileText,
  Mail,
  Camera,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import EditProfileModal from '@/components/auth/EditProfileModal'
import { getFullAvatarUrl, getAvatarUrl } from '@/utils/avatar' // 頭像 URL 工具函數
import ConfirmModal from '@/components/confirmModal'
import { useNotify } from '@/contexts/NotificationContext'

function ProfilePageContent() {
  // ============ 配置常數 ============
  const REDIRECT_DELAY = 500 // 未登入時的跳轉延遲時間 (毫秒)，可調整

  // ============ Hooks ============
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth() // 取得認證狀態
  const notify = useNotify()

  // ============ 狀態管理 ============
  const [activeTab, setActiveTab] = useState('travelPlan')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // 下拉選單開關狀態
  const [isClosing, setIsClosing] = useState(false) // 控制收合動畫狀態
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // 編輯彈窗開關狀態
  const [editModalMode, setEditModalMode] = useState('menu') //  控制編輯彈窗的初始模式
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false) // 頭像上傳彈窗開關狀態
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const dropdownRef = useRef(null) // 用於偵測點擊外部關閉選單

  // ============ API 配置 ============
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  //  處理 URL 參數 (例如從 AI 聊天跳轉過來)
  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab === 'password') {
      // 打開編輯彈窗並設定為密碼修改模式
      setEditModalMode('password')
      setIsEditModalOpen(true)
    }
  }, [searchParams])

  const savedPlaces = [
    {
      id: 1,
      name: '饒河街觀光夜市',
      rating: 4.3,
      location: '台北市',
      image:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      name: '臺北市立動物園',
      rating: 4.6,
      location: '台北市',
      image:
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&auto=format&fit=crop',
    },
    {
      id: 3,
      name: '台北101觀景台 Taipei 101 observatory',
      rating: 4.5,
      location: '台北市',
      image:
        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop',
    },
  ]

  /**
   * 關閉下拉選單（帶動畫）
   *
   * 流程：
   * 1. 啟動收合動畫（setIsClosing(true)）
   * 2. 等待動畫完成（150ms）
   * 3. 關閉選單並重置動畫狀態
   */
  const closeDropdown = () => {
    setIsClosing(true) // 啟動收合動畫
    setTimeout(() => {
      setIsDropdownOpen(false) // 關閉選單
      setIsClosing(false) // 重置動畫狀態
    }, 150) // 動畫持續時間 0.15s = 150ms
  }

  /**
   * 處理登出功能
   *
   * 流程：
   * 1. 呼叫 AuthContext 的 logout() 方法清除認證狀態
   * 2. 登出成功後導向首頁
   * 3. 如果發生錯誤，顯示錯誤訊息
   */
  /**
   * 處理確認登出
   */
  const handleConfirmLogout = async () => {
    try {
      await logout()
      setShowLogoutConfirm(false)
      // 登出成功後 AuthGuard 會自動處理導向
    } catch (error) {
      console.error('登出失敗:', error)
      notify('登出失敗,請稍後再試', 'error')
      setShowLogoutConfirm(false)
    }
  }

  /**
   * 處理取消登出
   */
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  // 取得使用者顯示名稱(可根據你的 user 物件結構調整)
  const getUserDisplayName = () => {
    if (!user) return ''
    return user.nickname || user.email || '使用者'
  }

  /**
   * 點擊外部時關閉下拉選單
   *
   * 使用 useEffect 監聽全域點擊事件
   * 如果點擊的元素不在下拉選單內，則關閉選單（帶動畫）
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 檢查點擊的元素是否在下拉選單參考元素之外
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown() // 使用帶動畫的關閉函式
      }
    }

    // 只有在選單開啟時才監聽點擊事件
    if (isDropdownOpen && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // 清理函式：移除事件監聽器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isClosing])

  /**
   * 未登入狀態檢查與自動跳轉
   *
   * 檢查使用者是否已登入：
   * - 如果未登入，等待 REDIRECT_DELAY 後自動跳轉至首頁
   * - 使用 setTimeout 延遲跳轉，給予使用者提示時間
   * - 清理函式會在組件卸載或登入狀態改變時取消跳轉
   */
  useEffect(() => {
    // 如果未登入，設定延遲跳轉
    if (!isAuthenticated) {
      const redirectTimer = setTimeout(() => {
        router.push('/')
      }, REDIRECT_DELAY)

      // 清理函式：取消跳轉計時器
      return () => {
        clearTimeout(redirectTimer)
      }
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gray-50 p-3 pt-5">
      {/* Main Content - with left margin for sidebar */}
      <div className="">
        {/* Header */}
        <div className="">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* ============================================
                    頭像區域 - 支援點擊上傳
                    
                    使用 getAvatarUrl() 顯示頭像:
                    - 如果使用者已登入且有自訂頭像，顯示自訂頭像
                    - 如果使用者已登入但沒有頭像，顯示 ImageKit 預設頭像
                    - 如果使用者未登入，顯示表情符號
                    - 預設頭像: https://ik.imagekit.io/crjen7iza/avatars/avatarxxx01.png
                    ============================================ */}
                <div className="relative group">
                  {/* 頭像顯示 */}
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                    {user && getAvatarUrl(user.avatar, true) ? (
                      <img
                        src={getAvatarUrl(user.avatar, true)}
                        alt="使用者頭像"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 圖片載入失敗時顯示表情符號
                          console.error(' 頭像載入失敗:', e.target.src)
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    {/* 未登入或圖片載入失敗時的後備表情符號 */}
                    <div
                      className="text-white text-6xl"
                      style={{
                        display:
                          user && getAvatarUrl(user.avatar, true)
                            ? 'none'
                            : 'flex',
                      }}
                    ></div>
                  </div>
                </div>

                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user && (
                      <p className="text-gray-600 mt-2">
                        {user.nickname || user.email}
                      </p>
                    )}
                  </h1>
                  <p className="text-gray-500 mb-4">2 行程 • 0 篇遊小書</p>

                  <div className="flex gap-3">
                    {/* 編輯按鈕 - 開啟編輯彈窗 */}
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-1 border rounded-sm hover:bg-gray-50 transition"
                    >
                      <Edit className="w-4 h-4" />
                      <span>編輯</span>
                    </button>

                    {/* Settings 按鈕 + 下拉選單 */}
                    <div className="relative" ref={dropdownRef}>
                      {/* Settings 按鈕 */}
                      <button
                        onClick={() => {
                          if (isDropdownOpen) {
                            closeDropdown() // 如果已開啟，使用帶動畫的關閉
                          } else {
                            setIsDropdownOpen(true) // 直接開啟
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition"
                        aria-label="設定選單"
                      >
                        <Settings className="w-5 h-5" />
                      </button>

                      {/* 下拉選單 - 支援展開和收合動畫 */}
                      {isDropdownOpen && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 origin-top"
                          style={{
                            animation: isClosing
                              ? 'scaleOut 0.15s ease-in forwards'
                              : 'scaleIn 0.15s ease-out',
                          }}
                        >
                          {/* 服務條款與隱私說明 */}
                          <button
                            onClick={() => {
                              closeDropdown() // 使用帶動畫的關閉
                              setTimeout(() => router.push('/terms'), 150) // 等待動畫完成後跳轉
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                          >
                            <FileText className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">
                              服務條款與隱私說明
                            </span>
                          </button>

                          {/* 聯絡我們 */}
                          <button
                            onClick={() => {
                              closeDropdown() // 使用帶動畫的關閉
                              setTimeout(() => router.push('/contact'), 150) // 等待動畫完成後跳轉
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                          >
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">聯絡我們</span>
                          </button>

                          {/* 分隔線 */}
                          <div className="my-2 border-t border-gray-200"></div>

                          {/* 登出 */}
                          <button
                            onClick={() => {
                              closeDropdown() // 使用帶動畫的關閉
                              setTimeout(() => setShowLogoutConfirm(true), 150) // 等待動畫完成後執行登出
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left text-red-600"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">登出</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="bg-gray-100 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                開始準備自己的行李清單？
              </h3>
              <p className="text-sm text-gray-600">手機錢包鑰匙都要帶！</p>
            </div>
            <button
              onClick={() => router.push('/site/packing-lists')}
              className="px-6 py-2 bg-primary-500 text-white font-semibold hover:bg-secondary-900 transition"
            >
              前往清單
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-8 mt-8 whitespace-nowrap">
          <div className="flex gap-5 justify-left">
            <button
              onClick={() => setActiveTab('travelPlan')}
              className={`pb-3 font-normal transition ${
                activeTab === 'travelPlan'
                  ? 'text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              我的行程
            </button>
            <button
              onClick={() => setActiveTab('touristSpotFav')}
              className={`pb-3 font-normal transition ${
                activeTab === 'touristSpotFav'
                  ? 'text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              景點收藏
            </button>
            <button
              onClick={() => setActiveTab('productFav')}
              className={`pb-3 font-normal transition ${
                activeTab === 'productFav'
                  ? 'text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              商品收藏
            </button>
            <button
              onClick={() => setActiveTab('ordered')}
              className={`pb-3 font-normal transition ${
                activeTab === 'ordered'
                  ? 'text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              購買記錄
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 font-normal transition ${
                activeTab === 'posts'
                  ? 'text-gray-900  border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              我的文章
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <p className="text-gray-500 mb-8">共 3 個景點</p>

          {/* Places Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{place.rating}</span>
                    <span>•</span>
                    <span>{place.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          編輯個人資料彈窗
          ============================================ */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        initialMode={editModalMode}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditModalMode('menu') //  關閉時重置為 menu 模式
        }}
        onSuccess={() => {
          setIsEditModalOpen(false)
          setEditModalMode('menu') //  成功後重置為 menu 模式
        }}
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
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  )
}
