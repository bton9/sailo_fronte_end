/**
 * 會員中心轉場動畫工具
 * 路徑: contexts/membercenter/handleTransition.js
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 提供從左到右的摺疊轉場動畫效果
 * - 支援自訂動畫時長、緩動函式
 * - 無需 localStorage，符合 authV2 架構
 * - 使用 ES6 Module 語法
 *
 * 技術規範:
 * - CSS Transform + Transition 實現流暢動畫
 * - 使用 scaleX 實現左到右摺疊效果
 * - 支援 transform-origin 控制展開方向
 * - 無圓角設計，符合 theme.css 配色
 *
 * 使用範例:
 * import { useTransition, TransitionWrapper } from '@/contexts/membercenter/handleTransition'
 *
 * // Hook 方式
 * const { isVisible, show, hide } = useTransition()
 *
 * // 元件方式
 * <TransitionWrapper isOpen={isOpen} duration={300}>
 *   <YourContent />
 * </TransitionWrapper>
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================
// 常數定義
// ============================================

/**
 * 預設動畫配置
 * @constant {Object}
 */
export const TRANSITION_CONFIG = {
  /** 預設動畫時長 (毫秒) */
  DURATION: 300,

  /** 預設緩動函式 */
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out

  /** 轉場類型 */
  TYPE: {
    /** 從左到右摺疊 */
    LEFT_TO_RIGHT: 'left-to-right',
    /** 從右到左摺疊 */
    RIGHT_TO_LEFT: 'right-to-left',
    /** 從上到下摺疊 */
    TOP_TO_BOTTOM: 'top-to-bottom',
    /** 從下到上摺疊 */
    BOTTOM_TO_TOP: 'bottom-to-top',
  },
}

// ============================================
// Hook: useTransition
// ============================================

/**
 * 轉場動畫 Hook
 *
 * 提供完整的轉場狀態管理與控制函式
 *
 * @param {Object} options - 配置選項
 * @param {number} [options.duration=300] - 動畫時長 (毫秒)
 * @param {string} [options.type='left-to-right'] - 轉場類型
 * @param {Function} [options.onTransitionEnd] - 動畫結束回調
 *
 * @returns {Object} 轉場狀態與控制函式
 * @returns {boolean} return.isVisible - 元素是否可見
 * @returns {boolean} return.isAnimating - 是否正在動畫中
 * @returns {Function} return.show - 顯示元素
 * @returns {Function} return.hide - 隱藏元素
 * @returns {Function} return.toggle - 切換顯示/隱藏
 *
 * @example
 * const { isVisible, show, hide, toggle } = useTransition({
 *   duration: 300,
 *   type: 'left-to-right',
 *   onTransitionEnd: () => console.log('動畫完成')
 * })
 */
export function useTransition(options = {}) {
  const { duration = TRANSITION_CONFIG.DURATION, onTransitionEnd } = options

  // ============ State 管理 ============
  const [isVisible, setIsVisible] = useState(false) // 元素是否可見
  const [isAnimating, setIsAnimating] = useState(false) // 是否正在動畫中
  const [shouldRender, setShouldRender] = useState(false) // 是否應該渲染 DOM

  /**
   * 顯示元素
   *
   * 流程：
   * 1. 設定應該渲染 DOM
   * 2. 等待一個 frame 確保 DOM 渲染完成
   * 3. 啟動顯示動畫
   * 4. 動畫結束後執行回調
   */
  const show = useCallback(() => {
    setShouldRender(true)
    setIsAnimating(true)

    // 使用 requestAnimationFrame 確保 DOM 已渲染
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // 動畫結束後的處理
    setTimeout(() => {
      setIsAnimating(false)
      if (onTransitionEnd) {
        onTransitionEnd()
      }
    }, duration)
  }, [duration, onTransitionEnd])

  /**
   * 隱藏元素
   *
   * 流程：
   * 1. 啟動隱藏動畫
   * 2. 等待動畫完成
   * 3. 移除 DOM
   * 4. 執行回調
   */
  const hide = useCallback(() => {
    setIsAnimating(true)
    setIsVisible(false)

    // 等待動畫完成後移除 DOM
    setTimeout(() => {
      setShouldRender(false)
      setIsAnimating(false)
      if (onTransitionEnd) {
        onTransitionEnd()
      }
    }, duration)
  }, [duration, onTransitionEnd])

  /**
   * 切換顯示/隱藏
   */
  const toggle = useCallback(() => {
    if (isVisible) {
      hide()
    } else {
      show()
    }
  }, [isVisible, show, hide])

  return {
    isVisible,
    isAnimating,
    shouldRender,
    show,
    hide,
    toggle,
  }
}

// ============================================
// 元件: TransitionWrapper
// ============================================

/**
 * 轉場動畫包裝元件
 *
 * 將子元素包裝在轉場動畫容器中
 * 支援從左到右、右到左、上到下、下到上四種摺疊效果
 *
 * @param {Object} props - 元件屬性
 * @param {boolean} props.isOpen - 是否開啟
 * @param {ReactNode} props.children - 子元素
 * @param {number} [props.duration=300] - 動畫時長 (毫秒)
 * @param {string} [props.type='left-to-right'] - 轉場類型
 * @param {string} [props.className=''] - 自訂 CSS 類別
 * @param {Object} [props.style={}] - 自訂樣式
 *
 * @returns {JSX.Element|null} 轉場動畫元件
 *
 * @example
 * <TransitionWrapper
 *   isOpen={isMenuOpen}
 *   duration={300}
 *   type="left-to-right"
 *   className="bg-white"
 * >
 *   <MenuContent />
 * </TransitionWrapper>
 */
export function TransitionWrapper({
  isOpen,
  children,
  duration = TRANSITION_CONFIG.DURATION,
  type = TRANSITION_CONFIG.TYPE.LEFT_TO_RIGHT,
  className = '',
  style = {},
}) {
  // ============ State 管理 ============
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isAnimating, setIsAnimating] = useState(false)

  // ============================================
  // 監聽 isOpen 變化，控制動畫
  // ============================================
  useEffect(() => {
    if (isOpen) {
      // 開啟：立即渲染 DOM
      setShouldRender(true)
      setIsAnimating(true)

      // 動畫結束後重置狀態
      setTimeout(() => {
        setIsAnimating(false)
      }, duration)
    } else {
      // 關閉：啟動動畫
      setIsAnimating(true)

      // 等待動畫完成後移除 DOM
      setTimeout(() => {
        setShouldRender(false)
        setIsAnimating(false)
      }, duration)
    }
  }, [isOpen, duration])

  // ============================================
  // 動態生成轉場樣式
  // ============================================

  /**
   * 根據轉場類型生成對應的 transform 樣式
   *
   * @returns {Object} CSS 樣式物件
   */
  const getTransformStyle = () => {
    const baseStyle = {
      transition: `all ${duration}ms ${TRANSITION_CONFIG.EASING}`,
      transformOrigin: 'left center', // 預設從左側展開
    }

    // 根據類型設定不同的 transform 和 origin
    switch (type) {
      case TRANSITION_CONFIG.TYPE.LEFT_TO_RIGHT:
        return {
          ...baseStyle,
          transformOrigin: 'left center',
          transform: isOpen ? 'scaleX(1)' : 'scaleX(0)',
          opacity: isOpen ? 1 : 0,
        }

      case TRANSITION_CONFIG.TYPE.RIGHT_TO_LEFT:
        return {
          ...baseStyle,
          transformOrigin: 'right center',
          transform: isOpen ? 'scaleX(1)' : 'scaleX(0)',
          opacity: isOpen ? 1 : 0,
        }

      case TRANSITION_CONFIG.TYPE.TOP_TO_BOTTOM:
        return {
          ...baseStyle,
          transformOrigin: 'top center',
          transform: isOpen ? 'scaleY(1)' : 'scaleY(0)',
          opacity: isOpen ? 1 : 0,
        }

      case TRANSITION_CONFIG.TYPE.BOTTOM_TO_TOP:
        return {
          ...baseStyle,
          transformOrigin: 'bottom center',
          transform: isOpen ? 'scaleY(1)' : 'scaleY(0)',
          opacity: isOpen ? 1 : 0,
        }

      default:
        return baseStyle
    }
  }

  // 如果不應該渲染，返回 null
  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={className}
      style={{
        ...getTransformStyle(),
        ...style,
      }}
      data-animating={isAnimating}
    >
      {children}
    </div>
  )
}

// ============================================
// 工具函式: 生成 CSS 類別
// ============================================

/**
 * 生成轉場動畫的 CSS 類別字串
 *
 * 用於需要直接在元素上套用類別的場景
 *
 * @param {boolean} isOpen - 是否開啟
 * @param {string} [type='left-to-right'] - 轉場類型
 * @param {number} [duration=300] - 動畫時長 (毫秒)
 *
 * @returns {string} CSS 類別字串
 *
 * @example
 * <div className={getTransitionClass(isMenuOpen, 'left-to-right', 300)}>
 *   內容
 * </div>
 */
export function getTransitionClass(
  isOpen,
  type = TRANSITION_CONFIG.TYPE.LEFT_TO_RIGHT,
  duration = TRANSITION_CONFIG.DURATION
) {
  const baseClass = `transition-all ease-in-out`
  const durationClass = `duration-${duration}`

  let transformClass = ''

  switch (type) {
    case TRANSITION_CONFIG.TYPE.LEFT_TO_RIGHT:
      transformClass = isOpen
        ? 'scale-x-100 opacity-100 origin-left'
        : 'scale-x-0 opacity-0 origin-left'
      break

    case TRANSITION_CONFIG.TYPE.RIGHT_TO_LEFT:
      transformClass = isOpen
        ? 'scale-x-100 opacity-100 origin-right'
        : 'scale-x-0 opacity-0 origin-right'
      break

    case TRANSITION_CONFIG.TYPE.TOP_TO_BOTTOM:
      transformClass = isOpen
        ? 'scale-y-100 opacity-100 origin-top'
        : 'scale-y-0 opacity-0 origin-top'
      break

    case TRANSITION_CONFIG.TYPE.BOTTOM_TO_TOP:
      transformClass = isOpen
        ? 'scale-y-100 opacity-100 origin-bottom'
        : 'scale-y-0 opacity-0 origin-bottom'
      break

    default:
      transformClass = ''
  }

  return `${baseClass} ${durationClass} ${transformClass}`.trim()
}

// ============================================
// 預設匯出
// ============================================

const TransitionUtils = {
  useTransition,
  TransitionWrapper,
  getTransitionClass,
  TRANSITION_CONFIG,
}

export default TransitionUtils
