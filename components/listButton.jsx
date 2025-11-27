'use client' // 這是客戶端元件，支援互動與 DOM 操作

import React from 'react'
import { useRouter } from 'next/navigation'
import RIC_fi from '@/lib/react_icon/fi'

// 定義一個可重用的按鈕元件，透過 props 傳入文字與連結
export default function GlobalButton({
  label = '行李清單',
  href = '/site/packing-lists',
  className = 'px-4 py-2 border border-secondary-600 text-secondary-600 rounded-[5px] hover:bg-gray-50 transition flex items-center gap-2 whitespace-nowrap text-sm bg-white ml-auto',
}) {
  // const combinedClassName = button ${className}
  const router = useRouter()
  return (
    <div className="wrap">
      <button
        onClick={() => router.push(href)}
        className={`button ${className}`}
      >
        <RIC_fi.FiBriefcase className="text-lg" />
        {label}
      </button>
    </div>
  )
}
