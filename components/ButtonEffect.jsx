'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

export default function ButtonEffect({
  text = 'Button', // 按鈕文字
  href = '#', // 導向連結
  color = 'blue', // 主題顏色，可自訂: 'blue' | 'pink' | 'green' | 'amber' | 'custom'
  className = '', // 額外樣式
  onClick, // 可選的點擊事件
}) {
  const router = useRouter()

  // 定義顏色主題
  const theme = {
    blue: 'border-[#D4EDF9] text-white bg-transparent',
    pink: 'border-pink-300 text-pink-100',
    green: 'border-green-300 text-green-100',
    amber: 'border-amber-300 text-amber-100',
    custom: '', // 使用者可用 className 來自訂
  }

  // 點擊行為（可導航或執行自訂事件）
  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (href && href !== '#') router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        `
        relative cursor-pointer py-4 px-8 text-center font-barlow 
        inline-flex justify-center text-base uppercase rounded-lg 
        border-solid transition-transform duration-300 ease-in-out group 
        focus:outline-2 focus:outline-white 
        focus:outline-offset-4 overflow-hidden
        `,
        theme[color],
        className
      )}
    >
      {/* 按鈕文字 */}
      <span className="relative z-20">{text}</span>

      {/* 光影滑動效果 */}
      <span
        className="
          absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 
          z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out
        "
      ></span>

      {/* 邊框動畫 */}
      <span
        className={clsx(
          'w-1/2 drop-shadow-3xl transition-all duration-300 block absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0',
          theme[color]
        )}
      ></span>
      <span
        className={clsx(
          'w-1/2 drop-shadow-3xl transition-all duration-300 block absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0',
          theme[color]
        )}
      ></span>
      <span
        className={clsx(
          'w-1/2 drop-shadow-3xl transition-all duration-300 block absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0',
          theme[color]
        )}
      ></span>
      <span
        className={clsx(
          'w-1/2 drop-shadow-3xl transition-all duration-300 block absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0',
          theme[color]
        )}
      ></span>
    </button>
  )
}
