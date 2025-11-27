'use client'

import { useEffect, useState } from 'react'
import { FaCircleCheck, FaCircleExclamation, FaCircleInfo } from 'react-icons/fa6'

/**
 * 通用提示 Modal
 * type: 'success' | 'error' | 'info'
 */
export default function NotificationModal({
  isOpen,
  onClose,
  type = 'success',
  title = '提示',
  message = '',
  buttonText = '確認',
  buttonStyle = 'bg-point-500 hover:bg-point-400',
}) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleConfirm = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose && onClose()
    }, 200)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleConfirm()
    }
  }

  if (!isOpen) return null

  // 根據類型設定圖標和樣式
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCircleCheck className="text-5xl text-primary-500" />,
          titleColor: 'text-secondary-600',
          defaultButton: 'bg-green-600 hover:bg-green-700',
        }
      case 'error':
        return {
          icon: <FaCircleExclamation className="text-5xl text-red-500" />,
          titleColor: 'text-red-700',
          defaultButton: 'bg-red-600 hover:bg-red-700',
        }
      case 'info':
        return {
          icon: <FaCircleInfo className="text-5xl text-blue-500" />,
          titleColor: 'text-blue-700',
          defaultButton: 'bg-blue-600 hover:bg-blue-700',
        }
      default:
        return {
          icon: <FaCircleInfo className="text-5xl text-gray-500" />,
          titleColor: 'text-gray-700',
          defaultButton: 'bg-gray-600 hover:bg-gray-700',
        }
    }
  }

  const config = getTypeConfig()
  const finalButtonStyle = buttonStyle || config.defaultButton

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div
        className={`relative bg-white shadow-2xl max-w-md w-full p-8 transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 圖標 */}
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>

        {/* 標題 */}
        <h3 className={`text-2xl font-bold text-center mb-4 ${config.titleColor}`}>
          {title}
        </h3>

        {/* 訊息內容 */}
        {message && (
          <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
            {message}
          </p>
        )}

        {/* 確認按鈕 */}
        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            className={`px-8 py-2.5 text-white font-medium transition-colors duration-200 min-w-[120px] ${finalButtonStyle}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}