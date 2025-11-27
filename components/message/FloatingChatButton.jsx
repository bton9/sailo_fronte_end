/**
 * FloatingChatButton - 可拖曳的浮動聊天室按鈕
 * 路徑: sailo/components/message/FloatingChatButton.jsx
 *
 * 功能說明:
 * 1. 可在頁面上自由拖曳的圓形按鈕
 * 2. 點擊開啟聊天室視窗
 * 3. 顯示未讀訊息數量徽章
 * 4. 自動吸附到螢幕邊緣
 * 5. 支援手機和桌面裝置
 * 6. 記憶按鈕位置 (使用 sessionStorage,不用 localStorage)
 *
 * 設計特色:
 * - 圓形漸層背景 (紫色系)
 * - Hover 動畫效果
 * - 拖曳時半透明
 * - 未讀訊息紅點提示
 * - 平滑動畫過渡
 *
 * 使用方式:
 * import FloatingChatButton from '@/components/message/FloatingChatButton'
 *
 * <FloatingChatButton
 *   unreadCount={5}
 *   onChatOpen={() => console.log('開啟聊天室')}
 * />
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function FloatingChatButton({
  unreadCount = 0,
  onChatOpen,
  initialPosition = { x: 'right-6', y: 'bottom-24' },
}) {
  // ============ 狀態管理 ============
  const [position, setPosition] = useState({ x: 0, y: 0 }) // 按鈕位置
  const [isDragging, setIsDragging] = useState(false) // 是否正在拖曳
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }) // 拖曳偏移量
  const [isMounted, setIsMounted] = useState(false) // 是否已掛載 (防止 SSR 問題)
  const [hasMoved, setHasMoved] = useState(false) // 是否已移動 (區分點擊和拖曳)

  const buttonRef = useRef(null)
  const dragStartPos = useRef({ x: 0, y: 0 }) // 記錄拖曳開始位置
  const BUTTON_SIZE = 60 // 按鈕直徑 (px)
  const EDGE_SNAP_THRESHOLD = 100 // 邊緣吸附距離 (px)
  const CLICK_THRESHOLD = 5 // 移動距離閾值 (px),小於此值視為點擊

  /**
   * 元件掛載時初始化位置
   *
   * 流程:
   * 1. 每次載入都回到預設位置 (右下角) - 不記憶位置
   * 2. 確保位置在可視範圍內
   *
   * 🔧 修改紀錄:
   * - 移除 sessionStorage 位置記憶功能
   * - 每次重新登入都回到右下角預設位置
   */
  useEffect(() => {
    setIsMounted(true)

    // 🌟 每次載入都設定為預設位置 (右下角)
    setDefaultPosition()
  }, [])

  /**
   * 設定預設位置 (右下角)
   */
  const setDefaultPosition = () => {
    const defaultX = window.innerWidth - BUTTON_SIZE - 24 // 右邊 24px
    const defaultY = window.innerHeight - BUTTON_SIZE - 96 // 下方 96px
    setPosition({ x: defaultX, y: defaultY })
  }

  /**
   * 處理拖曳開始
   *
   * @param {Event} e - 滑鼠或觸控事件
   */
  const handleDragStart = (e) => {
    // 計算滑鼠/手指相對於按鈕的偏移量
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    // 記錄拖曳開始位置 (用於判斷是否為點擊)
    dragStartPos.current = { x: clientX, y: clientY }

    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    })

    setIsDragging(true)
    setHasMoved(false) // 重置移動標記

    // 防止文字選取和頁面滾動
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * 處理拖曳中
   *
   * @param {Event} e - 滑鼠或觸控事件
   */
  const handleDragMove = (e) => {
    if (!isDragging) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    // 計算移動距離
    const deltaX = Math.abs(clientX - dragStartPos.current.x)
    const deltaY = Math.abs(clientY - dragStartPos.current.y)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 如果移動距離超過閾值,標記為已移動
    if (distance > CLICK_THRESHOLD) {
      setHasMoved(true)
    }

    // 計算新位置
    let newX = clientX - dragOffset.x
    let newY = clientY - dragOffset.y

    // 限制在視窗範圍內
    newX = Math.max(0, Math.min(newX, window.innerWidth - BUTTON_SIZE))
    newY = Math.max(0, Math.min(newY, window.innerHeight - BUTTON_SIZE))

    setPosition({ x: newX, y: newY })
  }

  /**
   * 處理拖曳結束
   *
   * 功能:
   * 1. 停止拖曳狀態
   * 2. 自動吸附到最近的螢幕邊緣
   * 3. 不再儲存位置 (每次登入都回到預設位置)
   */
  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    // 計算與螢幕邊緣的距離
    const distanceToLeft = position.x
    const distanceToRight = window.innerWidth - position.x - BUTTON_SIZE
    const distanceToTop = position.y
    const distanceToBottom = window.innerHeight - position.y - BUTTON_SIZE

    // 找出最近的邊緣
    const minDistance = Math.min(
      distanceToLeft,
      distanceToRight,
      distanceToTop,
      distanceToBottom
    )

    let finalPosition = { ...position }

    // 吸附到最近的邊緣 (如果距離小於閾值)
    if (minDistance < EDGE_SNAP_THRESHOLD) {
      if (minDistance === distanceToLeft) {
        finalPosition.x = 24 // 左邊
      } else if (minDistance === distanceToRight) {
        finalPosition.x = window.innerWidth - BUTTON_SIZE - 24 // 右邊
      } else if (minDistance === distanceToTop) {
        finalPosition.y = 24 // 上方
      } else {
        finalPosition.y = window.innerHeight - BUTTON_SIZE - 96 // 下方
      }
    }

    setPosition(finalPosition)

    // 🔧 不再儲存位置，每次登入都回到預設位置
    // sessionStorage.setItem('chatButtonPosition', JSON.stringify(finalPosition))
  }

  /**
   * 處理按鈕點擊 (開啟聊天室)
   *
   * 注意: 只有在非拖曳狀態下才觸發
   */
  const handleClick = (e) => {
    // 如果有移動過 (拖曳),不觸發點擊
    if (hasMoved) {
      console.log('🚫 拖曳操作,不開啟聊天室')
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // 只有真正的點擊才開啟聊天室
    console.log('🔔 點擊按鈕,開啟聊天室')
    if (onChatOpen) {
      onChatOpen()
    }
  }

  /**
   * 監聽全域滑鼠/觸控事件
   */
  useEffect(() => {
    if (!isMounted) return

    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDragMove(e)
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd()
      }
    }

    const handleTouchMove = (e) => {
      if (isDragging) {
        handleDragMove(e)
        e.preventDefault() // 防止頁面滾動
      }
    }

    const handleTouchEnd = () => {
      if (isDragging) {
        handleDragEnd()
      }
    }

    // 始終監聽這些事件
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragOffset, position, isMounted])

  /**
   * 監聽視窗大小變化,確保按鈕在可視範圍內
   */
  useEffect(() => {
    if (!isMounted) return

    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - BUTTON_SIZE),
        y: Math.min(prev.y, window.innerHeight - BUTTON_SIZE),
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMounted])

  // 防止 SSR 渲染問題
  if (!isMounted) return null

  return (
    <>
      {/* ============ 浮動聊天按鈕 ============ */}
      {/* 🔧 v1.6.0: 移除漸層，改用純色 primary-500 */}
      <button
        ref={buttonRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleClick}
        className={`
          fixed z-50
          flex items-center justify-center
          bg-primary-500
          text-white rounded-full shadow-lg
          select-none
          ${
            isDragging
              ? 'opacity-70 scale-110 cursor-grabbing shadow-2xl'
              : 'opacity-100 scale-100 cursor-grab hover:scale-105 hover:shadow-xl'
          }
        `}
        style={{
          width: `${BUTTON_SIZE}px`,
          height: `${BUTTON_SIZE}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none', // 防止觸控滾動
          userSelect: 'none', // 防止文字選取
          WebkitUserDrag: 'none', // 防止圖片拖曳 (Safari)
          transition: isDragging ? 'none' : 'all 0.2s ease', // 拖曳時關閉過渡動畫
        }}
        aria-label="聊天室"
      >
        {/* 聊天圖示 */}
        <MessageCircle size={28} strokeWidth={2.5} />

        {/* 未讀訊息徽章 */}
        {unreadCount > 0 && (
          <span
            className="
              absolute -top-1 -right-1
              min-w-[24px] h-6 px-2
              bg-red-500 text-white text-xs font-bold
              rounded-full
              flex items-center justify-center
              shadow-md
              animate-pulse
            "
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ============ 拖曳提示 (首次使用) ============ */}
      {/* TODO: 未來可加入首次使用提示 */}
    </>
  )
}
