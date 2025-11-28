'use client'

import { FaHeart, FaComment, FaBookmark, FaShare } from 'react-icons/fa6'
import {
  FaHeart as FaHeartRegular,
  FaBookmark as FaBookmarkRegular,
} from 'react-icons/fa'

/**
 * PostActionBar - 文章互動列元件
 *
 * 功能:
 * - 按讚：未按讚時空心，已按讚時紅色實心
 * - 留言：顯示留言數
 * - 收藏：未收藏時空心，已收藏時黃色實心
 * - 分享：所有使用者都可使用
 *
 * @example
 * <PostActionBar
 *   postId={123}
 *   stats={{ likes: 100, comments: 20, bookmarks: 5 }}
 *   userInteraction={{ is_liked: false, is_bookmarked: true }}
 *   isLoggedIn={true}
 *   onLike={handleLike}
 *   onComment={handleComment}
 *   onBookmark={handleBookmark}
 *   onShare={handleShare}
 * />
 */
export default function PostActionBar({
  postId,
  stats = {
    likes: 0, //  統一用複數形式
    comments: 0,
    bookmarks: 0,
  },
  userInteraction = {
    is_liked: false,
    is_bookmarked: false,
  },
  isLoggedIn = false,
  onLike = () => {},
  onComment = () => {},
  onBookmark = () => {},
  onShare = () => {},
}) {
  // 處理按讚
  const handleLikeClick = (e) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      alert('請先登入')
      return
    }
    onLike(postId)
  }

  // 處理留言
  const handleCommentClick = (e) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      alert('請先登入以留言')
    }
    onComment(postId)
  }

  // 處理收藏
  const handleBookmarkClick = (e) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      alert('請先登入')
      return
    }
    onBookmark(postId)
  }

  // 處理分享（所有使用者都可使用）
  const handleShareClick = (e) => {
    e.stopPropagation()
    onShare(postId)
  }

  return (
    <div className="flex gap-6 pt-4 border-t border-gray-200">
      {/* 按讚按鈕 */}
      <button
        onClick={handleLikeClick}
        className={`bg-none border-none cursor-pointer flex items-center gap-2 text-base hover:text-primary transition-colors ${
          isLoggedIn && userInteraction?.is_liked
            ? 'text-point-500'
            : 'text-gray-600'
        }`}
      >
        {isLoggedIn && userInteraction?.is_liked ? (
          <FaHeart />
        ) : (
          <FaHeartRegular />
        )}
        <span>{stats?.likes || 0}</span>
      </button>

      {/* 留言按鈕 */}
      <button
        onClick={handleCommentClick}
        className="bg-none border-none cursor-pointer flex items-center gap-2 text-gray-600 text-base hover:text-primary transition-colors"
      >
        <FaComment />
        <span>{stats?.comments || 0}</span>
      </button>

      {/* 收藏按鈕 */}
      <button
        onClick={handleBookmarkClick}
        className={`bg-none border-none cursor-pointer flex items-center gap-2 text-base hover:text-primary transition-colors ${
          isLoggedIn && userInteraction?.is_bookmarked
            ? 'text-primary-500'
            : 'text-gray-600'
        }`}
      >
        {isLoggedIn && userInteraction?.is_bookmarked ? (
          <FaBookmark />
        ) : (
          <FaBookmarkRegular />
        )}
        {/*  顯示收藏數 */}
        <span>{stats?.bookmarks || 0}</span>
      </button>

      {/* 分享按鈕 */}
      <button
        onClick={handleShareClick}
        className="bg-none border-none cursor-pointer flex items-center gap-2 text-gray-600 text-base hover:text-primary transition-colors"
      >
        <FaShare />
      </button>
    </div>
  )
}
