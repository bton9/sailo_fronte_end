// components/ui/glass-badge.jsx
import React from 'react'
import { cn } from '@/lib/utils'

/**
 * @description 玻璃擬態效果 Badge 組件
 * @param {string} size - 尺寸: sm | md | lg
 * @param {number} rating - 評分數字
 * @param {boolean} showStar - 是否顯示星星圖示
 */

const GlassBadge = ({
  children,
  size = 'md',
  rating,
  showStar = true,
  className,
  ...props
}) => {
  // 基礎玻璃效果樣式
  const baseStyles = `
    inline-flex items-center justify-center gap-1.5 bg-white`

  // 尺寸樣式
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-w-[60px]',
    md: 'px-4 py-2 text-sm min-w-[75px]',
    lg: 'px-5 py-2.5 text-base min-w-[90px]',
  }

  return (
    <div className={cn(baseStyles, sizeStyles[size], className)} {...props}>
      {rating !== undefined ? (
        <>
          <span className="font-bold tracking-wide">{rating}</span>
          {showStar && <span className="text-black">★</span>}
        </>
      ) : (
        children
      )}
    </div>
  )
}

export default GlassBadge
