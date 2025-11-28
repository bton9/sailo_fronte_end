/**
 * RatingModal - 客服滿意度評分彈窗
 * 路徑: components/chatroom/customer_chat/RatingModal.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 客服關閉聊天室後彈出評分視窗
 * - 1-5 星評分系統
 * - 選填評價留言
 * - 提交評分到後端
 *
 * 使用方式:
 * <RatingModal
 *   isOpen={showRating}
 *   roomId={room?.id}
 *   agentName={agentName}
 *   onSubmit={(rating, comment) => handleSubmitRating(rating, comment)}
 *   onClose={() => setShowRating(false)}
 * />
 */

'use client'

import { useState } from 'react'
import { Star, X, Send } from 'lucide-react'

export default function RatingModal({
  isOpen,
  roomId,
  agentName = '客服人員',
  onSubmit,
  onClose,
}) {
  const [rating, setRating] = useState(0) // 當前評分 (1-5)
  const [hoveredRating, setHoveredRating] = useState(0) // 滑鼠懸停的評分
  const [comment, setComment] = useState('') // 評價留言
  const [isSubmitting, setIsSubmitting] = useState(false) // 是否正在提交

  // ============================================
  // 處理提交評分
  // ============================================
  const handleSubmit = async () => {
    if (rating === 0) {
      alert('請選擇評分星級')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(rating, comment)
      onClose()
    } catch (error) {
      console.error(' 提交評分失敗:', error)
      alert('評分提交失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // 處理跳過評分
  // ============================================
  const handleSkip = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩層 */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center"
        onClick={handleSkip}
      />

      {/* 彈窗主體 */}
      <div
        className="fixed z-[61] bg-white shadow-2xl w-11/12 md:w-96 max-h-[80vh] overflow-y-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題列 */}
        <div className="bg-primary-500 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">評價客服服務</h3>
          <button
            onClick={handleSkip}
            className="text-white hover:bg-white/20 p-1 transition-colors"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {/* 內容區 */}
        <div className="p-6">
          {/* 提示文字 */}
          <p className="text-gray-700 mb-4 text-center">
            感謝您使用客服服務！
            <br />
            請為{' '}
            <span className="font-semibold text-primary-600">
              {agentName}
            </span>{' '}
            的服務評分
          </p>

          {/* 星級評分 */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                disabled={isSubmitting}
              >
                <Star
                  size={40}
                  className={`transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary-500 text-primary-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* 評分文字提示 */}
          <div className="text-center mb-4">
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 5 && '非常滿意'}
                {rating === 4 && '滿意'}
                {rating === 3 && '普通'}
                {rating === 2 && '不滿意'}
                {rating === 1 && '非常不滿意'}
              </p>
            )}
          </div>

          {/* 評價留言 (選填) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評價留言 (選填)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="分享您的使用體驗..."
              className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-primary-500 h-24 resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              跳過
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary-500 text-white hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>提交評分</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
