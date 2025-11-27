'use client'

import { useRouter } from 'next/navigation'
import { FiMap } from 'react-icons/fi'
import { useTransition } from '@/contexts/transitionContext'

/**
 * MapTransition 組件
 * 提供地圖按鈕和頁面轉場動畫效果
 *
 * @param {string} targetUrl - 點擊地圖按鈕後要導航的目標 URL
 * @param {string} className - 按鈕的額外 CSS 類名
 * @param {boolean} isMobile - 是否為手機版樣式
 * @param {React.Component} icon - 自定義 icon 組件 (可選,預設使用 FiMap)
 */
export default function MapTransition({
  targetUrl = '/site/custom/mapPage',
  className = '',
  isMobile = false,
  icon: CustomIcon,
}) {
  const router = useRouter()
  const { isTransitioning, startTransition } = useTransition()

  // 決定使用哪個 icon
  const IconComponent = CustomIcon || FiMap

  // 地圖點擊處理 - 執行轉場動畫並導航
  const handleMapClick = () => {
    if (isTransitioning) return

    // 開始轉場動畫
    startTransition(() => {
      // 在動畫完成後執行頁面跳轉
      router.push(targetUrl)
    })
  }

  // 桌面版按鈕樣式
  const desktopButtonClass = `
  
  fixed bottom-6 left-6
    w-14 h-14 
    bg-secondary-900
    cursor-pointer
    rounded-lg
    flex items-center justify-center 
    hover:bg-gray-800 
    transition-all 
    hover:scale-105 
    active:scale-95 
    shadow-md 
    hover:shadow-xl 
    flex-shrink-0
    ${className}
  `

  // 手機版按鈕樣式
  const mobileButtonClass = `
    w-12 h-12 
    bg-gray-900 
    rounded-xl 
    flex items-center justify-center 
    flex-shrink-0
    z-500
    ${className}
  `

  return (
    <button
      onClick={handleMapClick}
      className={isMobile ? mobileButtonClass : desktopButtonClass}
      disabled={isTransitioning}
      aria-label="打開地圖"
    >
      <IconComponent
        className={isMobile ? 'w-5 h-5 text-white' : 'w-8 h-8 text-white'}
      />
    </button>
  )
}
