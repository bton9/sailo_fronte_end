/**
 * LoadingSpinner - 載入動畫元件
 * 路徑: app/site/shop/components/shared/LoadingSpinner.jsx
 */

'use client'

export default function LoadingSpinner({ size = 'md', text = '載入中...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-[#e8e5e0] border-t-primary-500`}
      />
      {text && <div className="text-gray-600">{text}</div>}
    </div>
  )
}
