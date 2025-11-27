'use client'

import { useEffect, useState } from 'react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '確認',
  message = '確定要執行此操作嗎?',
  confirmText = '確定',
  cancelText = '取消',
  confirmButtonStyle = 'bg-point-500 hover:bg-point-400',
}) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // 防止背景滾動
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  /**
   * 處理確認按鈕點擊
   */
  const handleConfirm = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onConfirm && onConfirm()
    }, 200)
  }

  /**
   * 處理取消按鈕點擊
   */
  const handleCancel = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose && onClose()
    }, 200)
  }

  /**
   * 處理背景點擊(點擊背景=取消)
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* 半透明背景遮罩 */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* 確認對話框 */}
      <div
        className={`relative bg-white shadow-2xl max-w-md w-full p-6 transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 標題 */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>

        {/* 訊息內容 */}
        <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>

        {/* 按鈕群組 */}
        <div className="flex gap-3 justify-end">
          {/* 取消按鈕 */}
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors duration-200"
          >
            {cancelText}
          </button>

          {/* 確定按鈕 */}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 text-white font-medium transition-colors duration-200 ${confirmButtonStyle}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
