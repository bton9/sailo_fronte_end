'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import * as FaIcons from 'react-icons/fa6'

/**
 * NewCommentInput - 新增留言輸入框元件
 * 
 * @param {Object} props
 * @param {string} props.currentUserAvatar - 當前使用者頭貼
 * @param {number} props.currentUserId - 當前使用者ID
 * @param {Function} props.onSubmit - 提交留言的回調函式
 * @param {string} [props.placeholder] - 輸入框提示文字
 */
const NewCommentInput = forwardRef(({
  currentUserAvatar,
  currentUserId,
  onSubmit = () => {},
  placeholder = '分享你的想法...',
}, ref) => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 暴露給父元件的方法
  useImperativeHandle(ref, () => ({
    // 設定輸入框內容（用於回覆功能）
    setContent: (text) => {
      setContent(text)
    },
    // 聚焦輸入框
    focus: () => {
      document.getElementById('commentInput')?.focus()
    },
  }))

  // 處理提交
  const handleSubmit = async () => {
    const trimmedContent = content.trim()
    
    if (!trimmedContent) {
      alert('請輸入留言內容')
      return
    }

    if (trimmedContent.length > 1000) {
      alert('留言內容不得超過 1000 字')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(trimmedContent)
      setContent('') // 清空輸入框
    } catch (error) {
      console.error('發布留言失敗:', error)
      alert('發布留言失敗，請稍後重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 處理取消
  const handleCancel = () => {
    setContent('')
  }

  // 處理鍵盤快捷鍵 (Ctrl+Enter 提交)
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-4 mb-8 pb-8 border-b-2 border-border">
      {/* 當前使用者頭貼 */}
      <img
        src={currentUserAvatar}
        alt="我"
        className="w-10 h-10 rounded-full object-cover border-2 border-primary flex-shrink-0"
      />

      <div className="flex-1">
        {/* 輸入框 */}
        <textarea
          id="commentInput"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="w-full py-3 px-4 border-2 border-primary rounded-xl text-sm resize-vertical min-h-[80px] focus:outline-none focus:shadow-md focus:bg-white transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* 字數統計與提示 */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            {content.length > 0 && (
              <span className={content.length > 1000 ? 'text-red-500' : ''}>
                {content.length} / 1000
              </span>
            )}
            {content.length === 0 && (
              <span className="text-gray-400">
                <FaIcons.FaKeyboard className="inline mr-1" />
                提示：Ctrl + Enter 快速發布
              </span>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2">
            {content.trim() && (
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="py-2 px-5 border-2 border-primary bg-transparent text-primary rounded-full text-sm font-semibold hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="py-2 px-5 border-2 border-primary bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaIcons.FaSpinner className="animate-spin" />
                  發布中...
                </>
              ) : (
                <>
                  <FaIcons.FaPaperPlane />
                  發布
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

NewCommentInput.displayName = 'NewCommentInput'

export default NewCommentInput