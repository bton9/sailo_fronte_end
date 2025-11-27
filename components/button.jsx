'use client' // 這是客戶端元件，支援互動與 DOM 操作

import React from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/button.css'

// 定義一個可重用的按鈕元件，透過 props 傳入文字與連結
export default function GlobalButton({
  label = '前往',
  href = '/',
  className = '',
}) {
  // const combinedClassName = button ${className}
  const router = useRouter()
  return (
    <div className="wrap">
      <button
        onClick={() => router.push(href)}
        className={`button ${className}`}
      >
        {label}
      </button>
    </div>
  )
}
