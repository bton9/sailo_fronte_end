'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaPenToSquare } from 'react-icons/fa6'

/**
 * FloatingPostButton - 浮動發文按鈕元件
 *
 * 功能:
 * - 未登入: 跳轉到登入頁 (/login?redirect=/blog/post/create)
 * - 已登入: 跳轉到發文頁 (/blog/post/create)
 *
 * 樣式特點:
 * - 桌面版: 60x60px，右下角固定 (bottom-8 right-8)
 * - 行動版: 56x56px，右下角固定 (bottom-6 right-6)
 * - 3D 陰影效果 + hover 和 active 動畫
 *
 * @example
 * <FloatingPostButton />
 */
export default function FloatingPostButton() {
  const router = useRouter()
  const { user } = useAuth()

  // ✅ 未登入時不顯示按鈕
  if (!user) {
    return null
  }

  // 處理按鈕點擊事件
  const handleClick = () => {
    // 檢查使用者是否已登入
    if (!user) {
      // 未登入 → 跳轉到登入頁,並記錄返回路徑
      router.push('/login?redirect=/site/blog/post/create')
    } else {
      // 已登入 → 直接跳轉到發文頁面
      router.push('/site/blog/post/create')
    }
  }

  return (
    <button
      onClick={handleClick}
      title="發文"
      className="
        fixed
        bottom-8 right-8
        w-[60px] h-[60px]
        rounded-full
        bg-point-500
        text-white
        border-[3px] border-black
        cursor-pointer
        shadow-[4px_4px_0_#232323]
        hover:bg-point-400
        hover:-translate-x-0.5 hover:-translate-y-0.5
        hover:shadow-[6px_6px_0_#232323]
        active:translate-x-0.5 active:translate-y-0.5
        active:shadow-[2px_2px_0_#232323]
        transition-all
        z-50
        max-lg:bottom-6 max-lg:right-6
        max-lg:w-14 max-lg:h-14
        flex items-center justify-center
      "
    >
      <FaPenToSquare size={24} />
    </button>
  )
}
