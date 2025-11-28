'use client'

import { useState, useRef, useEffect } from 'react'
import * as FaIcons from 'react-icons/fa6'
import { FaHeart as FaHeartRegular } from 'react-icons/fa'

/**
 * CommentItem - 單一留言元件
 */
export default function CommentItem({
  comment,
  currentUserId = null,
  onLike = () => {},
  onReply = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onAvatarClick = () => {},
  onUsernameClick = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const menuRef = useRef(null)

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

  // 格式化時間
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '剛剛'
    if (minutes < 60) return `${minutes} 分鐘前`
    if (hours < 24) return `${hours} 小時前`
    if (days === 1) return '1 天前'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-TW')
  }

  // 是否為作者本人
  const isAuthor = currentUserId === comment.author?.user_id

  // 處理按讚
  const handleLike = () => {
    if (!currentUserId) {
      alert('請先登入')
      return
    }
    onLike(comment.comment_id)
  }

  // 處理回覆
  const handleReply = () => {
    onReply(comment.author?.display_name || comment.author?.name)
  }

  // 處理選單
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  const handleMenuAction = (action) => {
    setMenuOpen(false)
    if (action === 'edit') {
      setIsEditing(true)
      setEditContent(comment.content)
    } else if (action === 'delete') {
      onDelete(comment.comment_id)
    }
  }

  // 處理編輯提交
  const handleEditSubmit = async () => {
    const trimmedContent = editContent.trim()

    if (!trimmedContent) {
      alert('請輸入留言內容')
      return
    }

    if (trimmedContent.length > 1000) {
      alert('留言內容不得超過 1000 字')
      return
    }

    if (trimmedContent === comment.content) {
      setIsEditing(false)
      return
    }

    try {
      await onEdit(comment.comment_id, trimmedContent)
      setIsEditing(false)
    } catch (error) {
      console.error('編輯留言失敗:', error)
      alert('編輯失敗，請稍後重試')
    }
  }

  // 處理取消編輯
  const handleEditCancel = () => {
    setIsEditing(false)
    setEditContent('')
  }

  return (
    <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200 last:border-b-0">
      {/* 頭貼 */}
      <img
        src={comment.author?.avatar}
        alt={comment.author?.display_name || '使用者'}
        className="w-10 h-10 rounded-full object-cover border-2 border-primary flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onAvatarClick(comment.author?.user_id)}
      />

      <div className="flex-1 min-w-0">
        {/* 作者與時間 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-primary text-sm cursor-pointer hover:underline"
              onClick={() => onUsernameClick(comment.author?.user_id)}
            >
              {comment.author?.display_name ||
                comment.author?.name ||
                '未知使用者'}
            </span>
            <span className="text-xs text-gray-500">
              <FaIcons.FaClock className="inline mr-1" />
              {formatTime(comment.created_at)}
              {/*  如果有編輯過，顯示編輯時間 */}
              {comment.updated_at &&
                comment.updated_at !== comment.created_at && (
                  <span className="ml-1">(已編輯)</span>
                )}
            </span>
          </div>

          {/*  三點選單（僅作者可見） - 移到這裡 */}
          {isAuthor && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="bg-none border-none cursor-pointer text-gray-500 text-base p-1 hover:text-primary transition-colors"
              >
                <FaIcons.FaEllipsis />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-10">
                  <button
                    onClick={() => handleMenuAction('edit')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700"
                  >
                    <FaIcons.FaPen className="text-xs" />
                    <span>編輯</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('delete')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-500"
                  >
                    <FaIcons.FaTrash className="text-xs" />
                    <span>刪除</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 留言內容 */}
        {isEditing ? (
          <div className="mb-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full py-2 px-3 border-2 border-primary rounded-lg text-sm resize-vertical min-h-[60px] focus:outline-none focus:shadow-md"
              maxLength={1000}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span
                className={`text-xs ${editContent.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {editContent.length} / 1000
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleEditCancel}
                  className="py-1 px-3 border border-gray-300 bg-white text-gray-600 rounded-full text-xs hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!editContent.trim() || editContent.length > 1000}
                  className="py-1 px-3 border border-primary bg-primary-500 text-white rounded-full text-xs hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 leading-relaxed text-sm mb-2 break-words whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        {/* 互動按鈕 */}
        <div className="flex gap-4 items-center">
          {/* 按讚 */}
          <button
            onClick={handleLike}
            className={`bg-none border-none cursor-pointer flex items-center gap-1.5 text-sm transition-colors ${
              comment.user_interaction?.is_liked
                ? 'text-point-500 hover:text-point-400'
                : 'text-gray-500 hover:text-primary'
            }`}
          >
            {comment.user_interaction?.is_liked ? (
              <FaIcons.FaHeart />
            ) : (
              <FaHeartRegular />
            )}
            <span>{comment.stats?.likes || 0}</span>
          </button>

          {/* 回覆 */}
          <button
            onClick={handleReply}
            className="bg-none border-none cursor-pointer flex items-center gap-1.5 text-gray-500 text-sm hover:text-primary transition-colors"
          >
            <FaIcons.FaReply />
            回覆
          </button>
        </div>
      </div>
    </div>
  )
}
