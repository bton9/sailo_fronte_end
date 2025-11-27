'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as FaIcons from 'react-icons/fa6'

export default function UserProfileWidget({
  currentUser = null,
  profileUser = null,
  stats = null,
  isFollowing = false,
  currentView = 'posts',
  onViewChange = () => {},
  onFollowClick = () => {},
  onAvatarClick = () => {},
  onUsernameClick = () => {},
  onSearchSubmit = () => {},
}) {
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState('')

  // 判斷當前情境
  const isHomePage = !profileUser
  const isLoggedIn = !!currentUser
  const isOwnProfile =
    profileUser && currentUser && profileUser.id === currentUser.id
  const isOthersProfile =
    profileUser && (!currentUser || profileUser.id !== currentUser.id)

  // ✅ 加入除錯日誌
  console.log('🔍 UserProfileWidget Debug:', {
    currentUser,
    profileUser,
    isHomePage,
    isLoggedIn,
    isOwnProfile,
    isOthersProfile,
    'profileUser.id': profileUser?.id,
    'currentUser.id': currentUser?.id,
  })

  // 決定要顯示的使用者資料
  const displayUser = profileUser || currentUser

  // 決定是否顯示各個元素
  const showStats = (isLoggedIn && isHomePage) || !!profileUser
  const showViewButtons = (isLoggedIn && isHomePage) || isOwnProfile
  const showFollowButton = isOthersProfile

  // ✅ 加入除錯日誌
  console.log('🔍 Display Logic:', {
    showStats,
    showViewButtons,
    showFollowButton,
  })

  // 處理搜尋
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const keyword = searchKeyword.trim()
      if (keyword) {
        onSearchSubmit(keyword)
      }
    }
  }

  // 處理頭貼點擊
  const handleAvatarClick = () => {
    if (displayUser?.id) {
      onAvatarClick(displayUser.id)
    }
  }

  // 處理名稱點擊
  const handleUsernameClick = () => {
    if (displayUser?.id) {
      onUsernameClick(displayUser.id)
    }
  }

  return (
    <div className="bg-white/50 p-6 rounded-xl shadow-md border-2 border-primary">
      {/* 使用者資訊區 */}
      <div className="flex items-center gap-4 mb-2 pb-2 border-b border-border">
        {/* 頭貼 */}
        <img
          src={displayUser?.avatar}
          alt={displayUser?.name || '訪客'}
          className="w-[60px] h-[60px] rounded-full object-cover border-[3px] border-primary cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAvatarClick}
        />

        {/* 使用者名稱與帳號 */}
        <div className="flex-1">
          {!isLoggedIn && isHomePage ? (
            <div>
              <div className="text-lg font-semibold text-primary mb-1">
                訪客
              </div>
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-secondary hover:text-secondary-light transition-colors"
              >
                登入查看更多
              </button>
            </div>
          ) : (
            <>
              <div
                className="text-lg font-semibold text-primary mb-1 cursor-pointer hover:text-primary-light transition-colors"
                onClick={handleUsernameClick}
              >
                {displayUser?.nickname || '使用者'}
              </div>
              {/* <div className="text-sm text-gray-500">
                @{displayUser?.name || 'user'}
              </div> */}
            </>
          )}
        </div>

        {/* 追蹤按鈕 (僅他人個人頁顯示) */}
        {showFollowButton && (
          <button
            onClick={() => {
              console.log('🔍 追蹤按鈕被點擊')
              if (!currentUser) {
                alert('請先登入')
                return
              }
              onFollowClick()
            }}
            className={`px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap min-w-[90px] ${
              isFollowing
                ? 'bg-point-500 text-white '
                : 'border-secondary-600 bg-transparent hover:bg-point-500 hover:text-white '
            }`}
          >
            {isFollowing ? (
              <>
                <FaIcons.FaCheck className="inline mr-1" /> 追蹤中
              </>
            ) : (
              <>
                <FaIcons.FaPlus className="inline mr-1" /> 追蹤
              </>
            )}
          </button>
        )}
      </div>

      {/* 統計數據 */}
      {showStats && stats && displayUser?.id && (
        <div className="flex gap-6 mb-2 pb-2 border-b border-border">
          <div
            className="flex-1 text-center cursor-pointer hover:text-primary transition-colors"
            onClick={() => router.push(`/site/blog/profile/${displayUser.id}`)}
          >
            <div className="text-base font-bold text-primary">
              {stats.posts || 0}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">文章</div>
          </div>
          {/* 追蹤者 */}
          <div
            className="flex-1 text-center cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              // ✅ 如果已經在追蹤頁面，觸發事件
              if (window.location.pathname.includes('/following')) {
                window.dispatchEvent(
                  new CustomEvent('switchFollowTab', {
                    detail: { tab: 'followers' },
                  })
                )
              } else {
                // ✅ 不在追蹤頁面，跳轉並設定 sessionStorage
                sessionStorage.setItem('followingPageTab', 'followers')
                router.push(`/site/blog/profile/${displayUser.id}/following`)
              }
            }}
          >
            <div className="text-base font-bold text-primary">
              {stats.followers >= 1000
                ? `${(stats.followers / 1000).toFixed(1)}K`
                : stats.followers || 0}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">追蹤者</div>
          </div>

          {/* 追蹤中 */}
          <div
            className="flex-1 text-center cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              // ✅ 如果已經在追蹤頁面，觸發事件
              if (window.location.pathname.includes('/following')) {
                window.dispatchEvent(
                  new CustomEvent('switchFollowTab', {
                    detail: { tab: 'following' },
                  })
                )
              } else {
                // ✅ 不在追蹤頁面，跳轉並設定 sessionStorage
                sessionStorage.setItem('followingPageTab', 'following')
                router.push(`/site/blog/profile/${displayUser.id}/following`)
              }
            }}
          >
            <div className="text-base font-bold text-primary">
              {stats.following >= 1000
                ? `${(stats.following / 1000).toFixed(1)}K`
                : stats.following || 0}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">追蹤中</div>
          </div>
        </div>
      )}

      {/* 切換檢視按鈕 (首頁或自己的個人頁) */}
      {showViewButtons && (
        <div className="flex flex-col gap-2 mb-2">
          <button
            onClick={() => {
              if (isHomePage && currentUser?.id) {
                router.push(`/site/blog/profile/${currentUser.id}?view=posts`)
              } else {
                onViewChange('posts')
              }
            }}
            className={`py-3 px-4 border-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              currentView === 'posts'
                ? 'border-secondary-900 bg-transparent text-black hover:bg-primary-500/20 hover:text-secondary-600'
                : 'border-secondary-600 bg-transparent text-secondary-600 hover:bg-primary-500'
            }`}
          >
            <FaIcons.FaNewspaper />
            我的文章
          </button>
          <button
            onClick={() => {
              if (isHomePage && currentUser?.id) {
                router.push(
                  `/site/blog/profile/${currentUser.id}?view=bookmarks`
                )
              } else {
                onViewChange('bookmarks')
              }
            }}
            className={`py-3 px-4 border-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              currentView === 'bookmarks'
                ? 'border-secondary-900 bg-transparent text-black hover:bg-primary-500/20 hover:text-secondary-600'
                : 'border-secondary-600 bg-transparent text-secondary-600 hover:bg-primary-500/20'
            }`}
          >
            <FaIcons.FaBookmark />
            我的收藏
          </button>
        </div>
      )}

      {/* 搜尋框 */}
      <div>
        <input
          type="text"
          placeholder="搜尋文章、標籤、使用者..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full py-3 px-4 border-2 border-primary rounded-full text-sm bg-white/60 hover:bg-white focus:bg-white focus:shadow-md transition-all focus:outline-none"
        />
      </div>
    </div>
  )
}
