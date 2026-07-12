'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation' //  確保有 useRouter
import { useNotify } from '@/contexts/NotificationContext'
import * as FaIcons from 'react-icons/fa6'
import PostActionBar from './PostActionBar'
import ItineraryCard from './ItineraryCard'
/**
 * PostDetail - 文章詳細內容元件
 */
export default function PostDetail({
  post,
  currentUserId = null,
  showFollowButton = false,
  onLike = () => {},
  onComment = () => {},
  onBookmark = () => {},
  onFollow = () => {},
  onShare = () => {},
  onMenuClick = () => {},
  onAvatarClick = () => {},
  onUsernameClick = () => {},
  onItineraryClick = () => {},
  onPlaceCardClick = () => {}, //  加入這行
}) {
  const router = useRouter() //  加入 router
  const notify = useNotify()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // 當前圖片索引
  const [isLightboxOpen, setIsLightboxOpen] = useState(false) // Lightbox 開關

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

    if (hours < 24) return `${hours} 小時前`
    if (days === 1) return '1 天前'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-TW')
  }

  // 是否為作者本人
  const isAuthor = currentUserId === post.author?.user_id

  //  修改：處理行程卡片點擊
  const handleItineraryCardClick = (tripId) => {
    // 直接觸發父元件的 onItineraryClick（它會處理複製和跳轉）
    onItineraryClick(tripId)
  }

  //  修改：處理行程卡片的複製按鈕
  const handleItineraryCopy = (tripId) => {
    // 直接觸發父元件的 onItineraryClick（它會處理複製和跳轉）
    onItineraryClick(tripId)
  }

  //  加入這個新函式（放在 handleItineraryCopy 後面）
  const handlePlaceCardClickInternal = (placeId) => {
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

  // 處理追蹤
  const handleFollowClick = () => {
    if (!currentUserId) {
      notify('請先登入', 'error')
      return
    }
    onFollow(post.author.user_id)
  }

  // 處理選單
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  const handleMenuAction = (action) => {
    setMenuOpen(false)
    onMenuClick(post.post_id, action)
  }

  // 圖片切換
  const handlePrevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.photos.length - 1 : prev - 1
    )
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === post.photos.length - 1 ? 0 : prev + 1
    )
  }

  // 開啟 Lightbox
  const handleOpenLightbox = (index) => {
    setCurrentImageIndex(index)
    setIsLightboxOpen(true)
    document.body.style.overflow = 'hidden' // 禁止背景滾動
  }

  // 關閉 Lightbox
  const handleCloseLightbox = () => {
    setIsLightboxOpen(false)
    document.body.style.overflow = 'auto' // 恢復滾動
  }

  // 鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          handleCloseLightbox()
        }
        if (e.key === 'ArrowLeft') handlePrevImage(e)
        if (e.key === 'ArrowRight') handleNextImage(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, post.photos])

  return (
    <>
      <article className="bg-white/60 p-8 shadow-md border-l-[3px] border-primary mb-6">
        {/* 文章分類 */}
        {post.category && (
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 pb-4">
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
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
          <img
            src={post.author?.avatar}
            alt={post.author?.display_name || '使用者'}
            className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-primary hover:opacity-80 transition-opacity"
            onClick={() => onAvatarClick(post.author?.user_id)}
          />

          <div className="flex-1">
            <div
              className="font-semibold text-primary text-base cursor-pointer hover:underline"
              onClick={() => onUsernameClick(post.author?.user_id)}
            >
              {post.author?.display_name || post.author?.name || '未知使用者'}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              <FaIcons.FaClock className="inline mr-1" />
              {formatDate(post.created_at)} 發布
              {/*  如果有編輯過，顯示編輯時間 */}
              {post.updated_at &&
                post.updated_at !== post.created_at &&
                new Date(post.updated_at) - new Date(post.created_at) >
                  60000 && ( // 超過 1 分鐘才算編輯
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-xs">
                      (於 {formatDate(post.updated_at)} 編輯)
                    </span>
                  </>
                )}
              <span className="mx-2">•</span>
              <FaIcons.FaEye className="inline mr-1" />
              {post.view_count?.toLocaleString() || 0} 次瀏覽
            </div>
          </div>

          {/* 追蹤按鈕 */}
          {showFollowButton && (
            <button
              onClick={handleFollowClick}
              className={`px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
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
                    onClick={() => handleMenuAction(option.action)}
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
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => {
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
                  onClick={() => {
                    //  使用 router.push 跳轉到搜尋頁面
                    router.push(`/site/blog?q=${encodeURIComponent(tagText)}`)
                  }}
                  className="px-3 py-1.5 bg-transparent text-primary rounded-full text-sm cursor-pointer border border-primary hover:bg-primary/10 transition-all"
                >
                  #{tagText}
                </button>
              )
            })}
          </div>
        )}

        {/* 文章標題 */}
        <h1 className="text-3xl font-bold text-primary mb-4 leading-snug">
          {post.title}
        </h1>

        {/* 文章內容 */}
        <div className="text-gray-800 leading-loose text-base mb-6 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* 圖片輪播 */}
        {post.photos && post.photos.length > 0 && (
          <div className="relative w-full max-h-[500px] bg-white rounded-xl mb-6 flex items-center justify-center border-2 border-border overflow-hidden group">
            {/* 當前圖片 */}
            <img
              src={
                typeof post.photos[currentImageIndex] === 'string'
                  ? post.photos[currentImageIndex]
                  : post.photos[currentImageIndex].url
              }
              alt={`${post.title} - 圖片 ${currentImageIndex + 1}`}
              className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleOpenLightbox(currentImageIndex)}
            />

            {/* 多張圖片才顯示控制項 */}
            {post.photos.length > 1 && (
              <>
                {/* 左箭頭 */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none rounded-full w-12 h-12 cursor-pointer text-xl hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  aria-label="上一張圖片"
                >
                  <FaIcons.FaChevronLeft />
                </button>

                {/* 右箭頭 */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none rounded-full w-12 h-12 cursor-pointer text-xl hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  aria-label="下一張圖片"
                >
                  <FaIcons.FaChevronRight />
                </button>

                {/* 圖片指示器 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {currentImageIndex + 1} / {post.photos.length}
                </div>

                {/* 縮圖導航（可選） */}
                {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white transition-all ${
                        index === currentImageIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`查看第 ${index + 1} 張圖片`}
                    />
                  ))}
                </div> */}
              </>
            )}
          </div>
        )}

        {/* 行程卡片 */}
        {post.itinerary && (
          <div className="my-6">
            <ItineraryCard
              itinerary={{
                ...post.itinerary,
                user_id: post.author?.user_id, //  新增：補上行程擁有者的 user_id
              }}
              currentUserId={currentUserId} //  新增
              onClick={handleItineraryCardClick} //  修改
              showCopyButton={true}
              onCopy={handleItineraryCopy} //  修改
            />
          </div>
        )}

        {/*  新增：景點卡片（加在這裡，行程卡片下方）*/}
        {post.place && (
          <div className="my-4" onClick={(e) => e.stopPropagation()}>
            <ItineraryCard
              place={post.place}
              onClick={handlePlaceCardClickInternal}
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

      {/*  Lightbox 全螢幕查看 */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={handleCloseLightbox}
        >
          {/* 關閉按鈕 */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-10"
            aria-label="關閉"
          >
            <FaIcons.FaXmark />
          </button>

          {/* 圖片 */}
          <img
            src={
              typeof post.photos[currentImageIndex] === 'string'
                ? post.photos[currentImageIndex]
                : post.photos[currentImageIndex].url
            }
            alt={`${post.title} - 圖片 ${currentImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 多張圖片才顯示控制項 */}
          {post.photos.length > 1 && (
            <>
              {/* 左箭頭 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevImage(e)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white border-none rounded-full w-14 h-14 cursor-pointer text-2xl hover:bg-white/30 transition-all flex items-center justify-center"
                aria-label="上一張圖片"
              >
                <FaIcons.FaChevronLeft />
              </button>

              {/* 右箭頭 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNextImage(e)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white border-none rounded-full w-14 h-14 cursor-pointer text-2xl hover:bg-white/30 transition-all flex items-center justify-center"
                aria-label="下一張圖片"
              >
                <FaIcons.FaChevronRight />
              </button>

              {/* 圖片位置指示器 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {currentImageIndex + 1} / {post.photos.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
