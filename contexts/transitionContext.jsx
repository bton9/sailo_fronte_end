'use client'

import { createContext, useContext, useRef, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import WaveLoading from '@/components/waveLoading' // ✅ 引入 WaveLoading

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const transitionRef = useRef(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPageReady, setIsPageReady] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showWaveLoading, setShowWaveLoading] = useState(false) // ✅ 新增：控制 WaveLoading 顯示
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  const startTransition = (onComplete) => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setIsPageReady(false)
    setIsExpanded(false)
    setShowWaveLoading(false) // ✅ 重置 WaveLoading 狀態

    const element = transitionRef.current
    if (!element) return

    // 第一階段：圓形擴散動畫 (1.5秒)
    gsap.set(element, {
      clipPath: 'circle(0% at 0% 100%)',
      opacity: 1,
      display: 'block',
    })

    gsap.to(element, {
      clipPath: 'circle(150% at 0% 100%)',
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsExpanded(true)
        
        // ✅ 圓形擴散完成後，立即顯示 WaveLoading
        setShowWaveLoading(true)
        
        // 執行頁面跳轉
        if (onComplete) {
          onComplete()
        }
      },
    })
  }

  const completeTransition = () => {
    const element = transitionRef.current
    
    // ✅ 第二階段：WaveLoading 淡出 (1.3秒)
    setTimeout(() => {
      setShowWaveLoading(false)
      
      // ✅ 第三階段：遮罩淡出 (0.6秒)
      if (!element) {
        setIsTransitioning(false)
        setIsPageReady(true)
        setIsExpanded(false)
        return
      }

      gsap.to(element, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          setIsTransitioning(false)
          setIsPageReady(true)
          setIsExpanded(false)
          gsap.set(element, {
            display: 'none',
            clipPath: 'circle(0% at 0% 100%)',
          })
        },
      })
    }, 1300) // ✅ WaveLoading 顯示 1.3 秒
  }

  // ✅ 監聽路由變化，但只在擴散完成後才完成轉場
  useEffect(() => {
    if (pathname !== previousPathname.current && isTransitioning && isExpanded) {
      const timer = setTimeout(() => {
        completeTransition()
      }, 300)

      previousPathname.current = pathname

      return () => clearTimeout(timer)
    }
  }, [pathname, isTransitioning, isExpanded])

  const value = {
    isTransitioning,
    isPageReady,
    isExpanded,
    showWaveLoading, // ✅ 暴露 WaveLoading 狀態
    startTransition,
    completeTransition,
  }

  return (
    <TransitionContext.Provider value={value}>
      {children}
      
      {/* 轉場動畫遮罩 */}
      <div
        ref={transitionRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#cfc3b1',
          opacity: 0,
          display: 'none',
          pointerEvents: isTransitioning ? 'auto' : 'none',
          zIndex: 9999,
          clipPath: 'circle(0% at 0% 100%)',
        }}
      />

      {/* ✅ WaveLoading 動畫層 */}
      {showWaveLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#cfc3b1',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        >
          <WaveLoading text="" />
        </div>
      )}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const context = useContext(TransitionContext)
  
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider')
  }
  
  return context
}

export function PageTransitionWrapper({ children, dependencies = [] }) {
  const { completeTransition, isTransitioning, isExpanded } = useTransition()
  const hasCompletedRef = useRef(false)
  const [isReady, setIsReady] = useState(false)
  const timeoutRef = useRef(null)

  // ✅ 監聽頁面內容是否準備好
  useEffect(() => {
    setIsReady(true)
  }, [...dependencies])

  useEffect(() => {
    // ✅ 當頁面準備好,且轉場中,且擴散完成,且還未調用過時才執行
    if (isReady && isTransitioning && isExpanded && !hasCompletedRef.current) {
      const timer = setTimeout(() => {
        completeTransition()
        hasCompletedRef.current = true
      }, 300)

      return () => clearTimeout(timer)
    }

    // 重置標記當轉場結束
    if (!isTransitioning) {
      hasCompletedRef.current = false
      setIsReady(false)
    }
  }, [isReady, isTransitioning, isExpanded, completeTransition])

  // ✅ 超時保護機制 - 如果 4 秒後還在轉場中，強制完成
  useEffect(() => {
    if (isTransitioning) {
      timeoutRef.current = setTimeout(() => {
        console.warn('⚠️ 轉場超時，強制完成')
        if (!hasCompletedRef.current) {
          completeTransition()
          hasCompletedRef.current = true
        }
      }, 4000) // ✅ 改為 4 秒（1.5 + 1.3 + 0.6 + 緩衝）
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isTransitioning, completeTransition])

  return <>{children}</>
}