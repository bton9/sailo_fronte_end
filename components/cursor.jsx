'use client'

import { useEffect, useRef } from 'react'

/**
 * CustomCursor - 自定義鼠標組件
 * 
 * 功能:
 * - 預設: 10px*10px 黑點 (無箭頭)
 * - 圖片/卡片 hover: 放大 + 顯示箭頭
 * - 按鈕 hover: 10px*10px + 負片效果 (mix-blend-mode)
 */
export default function CustomCursor() {
  const cursorRef = useRef(null)
  const arrowRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const arrow = arrowRef.current
    if (!cursor || !arrow) return

    // 檢測是否為觸控裝置
    const isTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 1024
      )
    }

    // 如果是觸控裝置,完全隱藏自定義鼠標並恢復預設鼠標
    if (isTouchDevice()) {
      cursor.style.display = 'none'
      document.body.style.cursor = 'auto'
      return
    }

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    const speed = 0.8 // 提高速度以減少延遲

    // 鼠標移動事件 - 使用 passive 提升性能
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // 平滑動畫
    const animate = () => {
      // 計算距離
      const distX = mouseX - cursorX
      const distY = mouseY - cursorY

      // 平滑移動
      cursorX += distX * speed
      cursorY += distY * speed

      // 更新位置 - 使用 transform 而非 left/top (更好的性能)
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`

      requestAnimationFrame(animate)
    }

    // 鼠標按下事件
    const handleMouseDown = () => {
      cursor.classList.add('cursor-click')
    }

    // 鼠標放開事件
    const handleMouseUp = () => {
      cursor.classList.remove('cursor-click')
    }

    // 檢查 hover 元素類型
    const handleMouseOver = (e) => {
      const target = e.target

      // 檢查是否為圖片或卡片
      const isCard = 
        target.tagName === 'IMG' ||
        target.closest('.card') ||
        target.closest('[data-cursor="card"]') ||
        target.classList.contains('product-card') ||
        target.classList.contains('image-card') ||
        target.classList.contains('place-card') || // 首頁景點卡片
        target.closest('.place-card') ||
        target.closest('a') && target.closest('a').href?.includes('/location/') || // 首頁推薦連結
        // 檢查是否在 ScrollingPlacesColumn 的卡片容器內
        (target.closest('a') && (
          target.querySelector('img') || // 連結內有圖片
          target.closest('[class*="card"]') || // 連結內有 card 類別
          target.closest('[class*="place"]') // 連結內有 place 類別
        ))

      // 檢查是否為按鈕
      const isButton = 
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('[data-cursor="button"]') ||
        target.type === 'submit' ||
        target.classList.contains('btn')

      // 移除所有狀態
      cursor.classList.remove('hover-card', 'hover-button')
      
      if (isCard) {
        // 圖片/卡片: 放大 + 顯示箭頭
        cursor.classList.add('hover-card')
      } else if (isButton) {
        // 按鈕: 保持大小 + 負片效果
        cursor.classList.add('hover-button')
      }
    }

    // 監聽視窗大小變化
    const handleResize = () => {
      if (isTouchDevice()) {
        cursor.style.display = 'none'
        document.body.style.cursor = 'auto'
      } else {
        cursor.style.display = 'flex'
        document.body.style.cursor = 'none'
      }
    }

    // 添加事件監聽 - 使用 passive 提升性能
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('resize', handleResize)

    // 隱藏預設鼠標
    document.body.style.cursor = 'none'

    // 為所有可點擊元素隱藏鼠標
    const style = document.createElement('style')
    style.innerHTML = `
      @media (min-width: 1024px) {
        a, button, [role="button"], input[type="submit"], input[type="button"] {
          cursor: none !important;
        }
      }
    `
    document.head.appendChild(style)

    // 啟動動畫
    const animationId = animate()

    // 清理函數
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('resize', handleResize)
      document.body.style.cursor = 'auto'
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  return (
    <>
      {/* 自定義鼠標樣式 */}
      <style jsx global>{`
        /* 基礎鼠標樣式 - 15px 黑點 */
        .custom-cursor {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background-color: #000000;
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 
            width 0.15s cubic-bezier(0.4, 0, 0.2, 1),
            height 0.15s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.15s ease;
          will-change: transform;
        }

        /* 手機版隱藏 */
        @media (max-width: 1023px) {
          .custom-cursor {
            display: none !important;
          }
        }

        /* 箭頭預設隱藏 */
        .custom-cursor-arrow {
          opacity: 0;
          width: 24px;
          height: 24px;
          stroke: white;
          stroke-width: 2;
          fill: none;
          transition: opacity 0.3s ease;
          position: absolute;
        }

        /* 點擊效果 */
        .custom-cursor.cursor-click {
          transform: scale(0.8);
        }

        /* Hover 到圖片/卡片: 放大 + 顯示箭頭 */
        .custom-cursor.hover-card {
          width: 60px;
          height: 60px;
          background-color: #000000;
        }

        .custom-cursor.hover-card .custom-cursor-arrow {
          opacity: 1;
        }

        /* Hover 到按鈕: 保持 20px + 負片效果 */
        .custom-cursor.hover-button {
          width: 30px;
          height: 30px;
          background-color: #ffffff;
          mix-blend-mode: difference;
        }
      `}</style>

      {/* 鼠標元素 */}
      <div ref={cursorRef} className="custom-cursor">
        {/* 箭頭 SVG - 只在 hover 卡片時顯示 */}
        <svg
          ref={arrowRef}
          className="custom-cursor-arrow"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </>
  )
}