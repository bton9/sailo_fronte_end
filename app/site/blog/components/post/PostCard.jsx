'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation' //  加入 useRouter
import { useNotify } from '@/contexts/NotificationContext'
import * as FaIcons from 'react-icons/fa6'
import PostActionBar from './PostActionBar'
import ItineraryCard from './ItineraryCard'

/**
 * PostCard - 文章卡片元件
 */
export default function PostCard({
  post,
  currentUserId = null,
  showFollowButton = false,
  onPostClick = () => {},
  onLike = () => {},
  onComment = () => {},
  onBookmark = () => {},
  onFollow = () => {},
  onShare = () => {},
  onMenuClick = () => {},
  onAvatarClick = () => {},
  onUsernameClick = () => {},
  onItineraryClick = () => {},
  onPlaceCardClick = () => {}, //  新增：景點卡片點擊
}) {
  const router = useRouter() //  加入 router
  const notify = useNotify()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  //  除錯：檢查 props
  useEffect(() => {
    console.log('🔍 PostCard 接收的 props:', {
      postId: post.post_id,
      currentUserId,
      showFollowButton,
      authorUserId: post.author?.user_id,
      isFollowing: post.user_interaction?.is_following_author,
    })
  }, [post, currentUserId, showFollowButton])

  //  加入這段除錯（在 useEffect 區塊前面）
  useEffect(() => {
    console.log('🔍 PostCard - Post 資料:', post)
    console.log('🔍 PostCard - Post.place:', post.place)
    console.log('🔍 PostCard - Post.itinerary:', post.itinerary)
    console.log('🔍 PostCard - Post.trip_id:', post.trip_id)
    console.log('🔍 PostCard - Post.place_id:', post.place_id)
  }, [post])

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return '剛剛'
    if (hours < 24) return `${hours} 小時前`
    if (days === 1) return '1 天前'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-TW')
  }

  // 處理追蹤按鈕
  const handleFollowClick = (e) => {
    e.stopPropagation()
    if (!currentUserId) {
      notify('請先登入', 'error')
      return
    }
    onFollow(post.author.user_id)
  }

  // 處理選單
  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const handleMenuAction = (e, action) => {
    e.stopPropagation()
    setMenuOpen(false)
    onMenuClick(post.post_id, action)
  }

  // 是否為作者本人
  const isAuthor = currentUserId === post.author?.user_id

  //  修改：處理行程卡片點擊
  const handleItineraryCardClick = (tripId) => {
    console.log('🎯 PostCard 行程卡片點擊:', tripId)
    // 直接觸發父元件的 onItineraryClick（它會處理複製和跳轉）
    onItineraryClick(tripId)
  }

  //  修改：處理行程卡片的複製按鈕
  const handleItineraryCopy = (tripId) => {
    console.log('🎯 PostCard 複製按鈕點擊:', tripId)
    // 直接觸發父元件的 onItineraryClick（它會處理複製和跳轉）
    onItineraryClick(tripId)
  }

  //  新增：處理景點卡片點擊
  const handlePlaceCardClickInternal = (placeId) => {
    console.log('🎯 PostCard 點擊景點卡片:', placeId)
    if (onPlaceCardClick) {
      onPlaceCardClick(placeId)
    }
  }

  // 選單選項
  const menuOptions = isAuthor
    ? [
        { label: '編輯', icon: <FaIcons.FaPen />, action: 'edit' },
        {
          label: '刪除',
          icon: <FaIcons.FaTrash />,
          action: 'delete',
          danger: true,
        },
        { label: '複製連結', icon: <FaIcons.FaLink />, action: 'copy' },
      ]
    : [{ label: '複製連結', icon: <FaIcons.FaLink />, action: 'copy' }]

  return (
    <article
      className="bg-white/60 p-6 shadow-md hover:bg-white/80 hover:shadow-lg transition-all border-l-[3px] border-primary border-b border-border mb-6 cursor-pointer hover:border-l-point-500"
      onClick={() => onPostClick(post.post_id)}
    >
      {/* 文章分類 */}
      {post.category && (
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 pb-3 border-b border-gray-200">
          {post.category === 'travel' && <FaIcons.FaPlane />}
          {post.category === 'food' && <FaIcons.FaUtensils />}
          {post.category === 'life' && <FaIcons.FaMugHot />}
          {post.category === 'photo' && <FaIcons.FaCamera />}
          <span>
            {post.category === 'travel'
              ? '旅遊紀錄'
              : post.category === 'food'
                ? '美食推薦'
                : post.category === 'life'
                  ? '生活分享'
                  : post.category === 'photo'
                    ? '攝影作品'
                    : post.category}
          </span>
        </div>
      )}
      {/* 文章頭部 */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.author?.avatar}
          alt={post.author?.display_name || '使用者'}
          className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-primary"
          onClick={(e) => {
            e.stopPropagation()
            if (post.author?.user_id) {
              onAvatarClick(post.author.user_id)
            }
          }}
        />

        <div className="flex-1 flex items-center gap-3">
          <div
            className="font-semibold text-gray-800 cursor-pointer hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              if (post.author?.user_id) {
                onUsernameClick(post.author.user_id)
              }
            }}
          >
            {post.author?.display_name || post.author?.name || '未知使用者'}
          </div>

          {/*  追蹤按鈕 */}
          {showFollowButton && (
            <button
              onClick={handleFollowClick}
              className={`px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all min-w-[100px] ${
                post.user_interaction?.is_following_author
                  ? 'bg-point-500 text-white '
                  : 'border-secondary-600 bg-transparent hover:bg-point-500 hover:text-white '
              }`}
            >
              {post.user_interaction?.is_following_author ? (
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

        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span>{formatDate(post.created_at)}</span>
          {/*  如果有編輯過，顯示編輯時間 */}
          {post.updated_at &&
            post.updated_at !== post.created_at &&
            new Date(post.updated_at) - new Date(post.created_at) > 60000 && ( // 超過 1 分鐘才算編輯
              <>
                <span>•</span>
                <span className="text-xs text-gray-400">(已編輯)</span>
              </>
            )}
          {/*  顯示瀏覽次數 */}
          {post.view_count !== undefined && (
            <>
              <span>•</span>
              <FaIcons.FaEye className="inline" />
              <span>{post.view_count.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* 三點選單 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="bg-none border-none cursor-pointer text-gray-500 text-xl p-2 hover:text-primary transition-colors"
          >
            <FaIcons.FaEllipsis />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px] z-10">
              {menuOptions.map((option) => (
                <button
                  key={option.action}
                  onClick={(e) => handleMenuAction(e, option.action)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                    option.danger
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-700'
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 標籤 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 5).map((tag, index) => {
            const tagText = typeof tag === 'string' ? tag : tag.tagname
            const tagKey =
              typeof tag === 'string'
                ? tag
                : tag.tag_id
                  ? `tag-${tag.tag_id}`
                  : `tag-${index}`

            return (
              <button
                key={tagKey}
                onClick={(e) => {
                  e.stopPropagation()
                  //  使用 router.push 跳轉到搜尋頁面
                  router.push(`/site/blog?q=${encodeURIComponent(tagText)}`)
                }}
                className="px-3 py-1.5 bg-transparent text-primary rounded-full text-sm cursor-pointer border border-primary hover:bg-primary/10 transition-all"
              >
                <FaIcons.FaTags className="inline mr-1 text-xs" />
                {tagText}
              </button>
            )
          })}
        </div>
      )}

      {/* 文章標題 */}
      <h2 className="text-xl font-semibold mb-3 text-gray-800 hover:text-primary transition-colors">
        {post.title}
      </h2>

      {/* 文章內容預覽 */}
      <div className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
        {post.content}
      </div>

      {/* 圖片 */}
      {post.photos && post.photos.length > 0 && (
        <div className="relative w-full h-[300px] bg-white rounded-xl mb-4 overflow-hidden border-2 border-border">
          <img
            src={
              typeof post.photos[0] === 'string'
                ? post.photos[0]
                : post.photos[0].url
            }
            alt={post.title}
            className="w-full h-full object-cover"
          />

          {/* 圖片數量標記 */}
          {post.photos.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
              <FaIcons.FaImages />
              {post.photos.length}
            </div>
          )}
        </div>
      )}

      {/* 行程卡片 */}
      {post.itinerary && (
        <div className="my-4" onClick={(e) => e.stopPropagation()}>
          <ItineraryCard
            itinerary={{
              ...post.itinerary,
              user_id: post.author?.user_id, //  新增：補上行程擁有者的 user_id
            }}
            currentUserId={currentUserId}
            onClick={handleItineraryCardClick}
            showCopyButton={true}
            onCopy={handleItineraryCopy}
          />
        </div>
      )}

      {/*  加入這段：景點卡片 */}
      {post.place && (
        <div className="my-4" onClick={(e) => e.stopPropagation()}>
          <ItineraryCard
            place={post.place}
            onClick={(placeId) => {
              if (onPlaceCardClick) {
                onPlaceCardClick(placeId)
              }
            }}
            showCopyButton={false}
          />
        </div>
      )}

      {/* 互動列 */}
      <PostActionBar
        postId={post.post_id}
        stats={post.stats}
        userInteraction={post.user_interaction}
        isLoggedIn={!!currentUserId}
        onLike={onLike}
        onComment={onComment}
        onBookmark={onBookmark}
        onShare={onShare}
      />
    </article>
  )
}
