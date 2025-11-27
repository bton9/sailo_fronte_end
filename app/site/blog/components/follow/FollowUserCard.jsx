'use client'

import * as FaIcons from 'react-icons/fa6'

/**
 * FollowUserCard - 追蹤列表使用者卡片元件
 *
 * 功能:
 * - 顯示使用者頭像、名稱、統計資料
 * - 追蹤/取消追蹤按鈕
 * - 點擊卡片跳轉到使用者個人頁
 *
 * @param {object} user - 使用者資料
 * @param {number} user.id - 使用者 ID
 * @param {string} user.name - 使用者名稱
 * @param {string} user.nickname - 使用者暱稱
 * @param {string} user.avatar - 使用者頭像 URL
 * @param {number} user.posts_count - 文章數（可選）
 * @param {number} user.followers_count - 追蹤者數（可選）
 * @param {boolean} user.is_following - 當前使用者是否追蹤此人
 * @param {number} currentUserId - 當前登入使用者 ID
 * @param {function} onUserClick - 點擊使用者時的回調
 * @param {function} onFollowClick - 點擊追蹤按鈕的回調
 *
 * @example
 * <FollowUserCard
 *   user={{
 *     id: 2,
 *     name: "Jane",
 *     nickname: "jane_traveler",
 *     avatar: "https://...",
 *     posts_count: 156,
 *     followers_count: 8200,
 *     is_following: true
 *   }}
 *   currentUserId={1}
 *   onUserClick={(userId) => console.log('點擊使用者:', userId)}
 *   onFollowClick={(userId) => console.log('追蹤操作:', userId)}
 * />
 */
export default function FollowUserCard({
  user = {},
  currentUserId = null,
  onUserClick = () => {},
  onFollowClick = () => {},
}) {
  // 解構使用者資料
  const {
    id,
    name,
    nickname,
    avatar,
    posts_count = 0,
    followers_count = 0,
    is_following = false,
  } = user

  // 是否為自己
  const isOwnProfile = currentUserId && id === currentUserId

  // 處理點擊使用者卡片
  const handleCardClick = () => {
    if (id) {
      onUserClick(id)
    }
  }

  // 處理點擊頭像
  const handleAvatarClick = (e) => {
    e.stopPropagation()
    if (id) {
      onUserClick(id)
    }
  }

  // 處理點擊使用者名稱
  const handleNameClick = (e) => {
    e.stopPropagation()
    if (id) {
      onUserClick(id)
    }
  }

  // 處理追蹤按鈕點擊
  const handleFollowClick = (e) => {
    e.stopPropagation()
    if (!currentUserId) {
      alert('請先登入')
      return
    }
    if (id) {
      onFollowClick(id)
    }
  }

  return (
    <div
      className="
        p-4 px-6
        bg-white/60
        border-l-[3px] border-primary
        hover:bg-white/80 hover:border-l-point-500
        transition-all
        cursor-pointer
      "
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        {/* 使用者頭像 */}
        <img
          src={avatar || 'https://i.pravatar.cc/150?img=1'}
          alt={name || '使用者'}
          className="
            w-12 h-12
            rounded-full
            object-cover
            cursor-pointer
            border-2 border-primary
            flex-shrink-0
          "
          onClick={handleAvatarClick}
          onError={(e) => {
            e.target.src = 'https://i.pravatar.cc/150?img=1'
          }}
        />

        {/* 使用者資訊 */}
        <div className="flex-1 min-w-0">
          {/* 名稱區 */}
          <div>
            <span
              className="
                text-base font-bold text-primary
                cursor-pointer hover:underline
                mr-2
              "
              onClick={handleNameClick}
            >
              {nickname || '未知使用者'}
            </span>
          </div>

          {/* 統計資料 */}
          <div className="flex gap-4 text-xs text-gray-600 mt-2">
            {/* 文章數 */}
            {posts_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-primary">{posts_count}</span>{' '}
                文章
              </span>
            )}

            {/* 追蹤者數 */}
            {followers_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-primary">
                  {followers_count >= 1000
                    ? `${(followers_count / 1000).toFixed(1)}K`
                    : followers_count}
                </span>{' '}
                追蹤者
              </span>
            )}
          </div>
        </div>

        {/* 追蹤按鈕 */}
        <div className="flex-shrink-0 pt-1">
          {!isOwnProfile && (
            <button
              onClick={handleFollowClick}
              className={`
                px-5 py-2
                border-2
                rounded-full
                text-sm font-bold
                transition-all
                whitespace-nowrap
                min-w-[100px]
                ${
                  is_following
                    ? ' bg-point-500 text-white '
                    : 'border-secondary-600 bg-transparent hover:bg-point-500 hover:text-white '
                }
              `}
            >
              {is_following ? (
                <>
                  <FaIcons.FaCheck className="inline mr-1" />
                  追蹤中
                </>
              ) : (
                <>
                  <FaIcons.FaPlus className="inline mr-1" />
                  追蹤
                </>
              )}
            </button>
          )}

          {/* 如果是自己，顯示標記 */}
          {isOwnProfile && (
            <span
              className="
              px-4 py-2
              bg-gray-100
              text-gray-500
              rounded-full
              text-sm font-semibold
            "
            >
              你自己
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
