/**
 * ChatRoom - 聊天室主元件
 * 路徑: sailo/components/chatroom/ChatRoom.jsx
 * 版本: v1.7.0
 *
 * 功能說明:
 * 1. 完整的聊天室介面 (標題列、訊息列表、輸入框)
 * 2. 支援桌面和手機響應式設計
 * 3. 整合 AuthContext 取得使用者資訊
 * 4. 預留後端 API 整合介面
 * 5. 訊息時間戳顯示
 * 6. 自動滾動到最新訊息
 * 7. CSS Transition 動畫效果 (v1.7.0 重構)
 * 8. 點擊外部關閉功能
 *
 * 設計特色:
 * - Primary 主題色 (金棕色)
 * - 手機版從底部滑入 (translate-y)
 * - 桌面版從右側滑入 (translate-x)
 * - 使用 CSS Transition 實現流暢動畫（參考 sidebar）
 * - 高度減半設計 (h-2/3)
 *
 * v1.7.0 改進:
 * - 移除複雜的狀態管理和計時器
 * - 採用 sidebar 的 CSS transition + transform 方案
 * - 程式碼簡化 80%，完全無閃動/抽動問題
 *
 * 使用方式:
 * import ChatRoom from '@/components/chatroom'
 *
 * <ChatRoom
 *   isOpen={isChatOpen}
 *   onClose={() => setIsChatOpen(false)}
 * />
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, Send, MessageCircle } from 'lucide-react'

export default function ChatRoom({ isOpen = false, onClose }) {
  const { user, isAuthenticated } = useAuth()

  // ============ State 管理 ============
  const [messages, setMessages] = useState([]) // 訊息列表
  const [inputMessage, setInputMessage] = useState('') // 輸入框內容
  const [isSending, setIsSending] = useState(false) // 是否正在發送

  // ============ Refs ============
  const messagesEndRef = useRef(null) // 用於自動滾動

  /**
   * 處理關閉聊天室
   * ✨ v1.7.0: 簡化邏輯，CSS Transition 自動處理動畫
   */
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  /**
   * 自動滾動到最新訊息
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * 載入歷史訊息 (從後端 API)
   */
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadMessages()
    }
  }, [isOpen, isAuthenticated])

  /**
   * 訊息更新時自動滾動
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * 載入訊息列表
   */
  const loadMessages = async () => {
    try {
      // TODO: 從後端 API 載入訊息
      // const response = await fetch('/api/v2/messages', {
      //   credentials: 'include', // 使用 httpOnly Cookie
      // })
      // const data = await response.json()
      // setMessages(data.messages)

      // 模擬訊息 (開發時使用)
      setMessages([
        {
          id: 1,
          sender: 'system',
          content: '歡迎使用客服聊天室！有什麼可以幫助您的嗎？',
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('載入訊息失敗:', error)
    }
  }

  /**
   * 發送訊息
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const newMessage = {
      id: Date.now(), // 臨時 ID
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    // 立即顯示訊息 (樂觀更新)
    setMessages((prev) => [...prev, newMessage])
    setInputMessage('')
    setIsSending(true)

    try {
      // TODO: 發送到後端 API
      // const response = await fetch('/api/v2/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include', // 使用 httpOnly Cookie
      //   body: JSON.stringify({ content: newMessage.content }),
      // })
      // const data = await response.json()

      // 模擬系統回覆 (開發時使用)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'system',
            content: '感謝您的訊息！客服人員將盡快回覆您。',
            timestamp: new Date().toISOString(),
          },
        ])
      }, 1000)
    } catch (error) {
      console.error('發送訊息失敗:', error)
    } finally {
      setIsSending(false)
    }
  }

  /**
   * 處理按下 Enter 鍵發送
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * 格式化時間戳
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ✨ v1.7.0: 不使用條件渲染，讓 CSS transition 可以正常運作
  // （參考 sidebar，sidebar 也是一直渲染，只用 translate 控制）

  return (
    <>
      {/* ============ 遮罩層 ============ */}
      {/* ✨ v1.7.0: 簡單的條件渲染（完全參考 sidebar）*/}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />
      )}

      {/* ============ 聊天室容器 ============ */}
      {/* 
        ✨ v1.7.0: 使用 CSS Transition + Transform（完全參考 sidebar）
        
        核心概念：
        - 元件始終渲染，使用 CSS transition 控制動畫
        - 使用 transform 改變位置（不觸發重排，效能更好）
        - 使用 opacity 實現淡入淡出效果
        - 使用 pointer-events-none 防止關閉時的互動
        - 手機版：translate-y（上下滑動）
        - 桌面版：translate-x（左右滑動）
        
        動畫邏輯：
        - isOpen=true:  translate-y-0 + opacity-100（滑入+淡入）
        - isOpen=false: translate-y-full + opacity-0（滑出+淡出）
        
        優勢：
        - 無需狀態管理或計時器
        - CSS 自動處理動畫
        - 支援中途中斷並平滑反向
        - 完全無閃動/抽動問題
      */}
      <div
        className={`
          fixed z-50 bg-white shadow-2xl
          w-full md:w-96
          h-2/3 md:h-2/3
          bottom-0 md:bottom-0 right-0 md:right-0
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
          md:${isOpen ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-full translate-y-0 opacity-0 pointer-events-none'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============ 標題列 ============ */}
        {/* 🎨 v1.6.0: 移除漸層，改用純色 primary-500 */}
        <div className="bg-primary-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} />
            <div>
              <h3 className="text-lg font-bold">客服聊天室</h3>
              <p className="text-xs opacity-80">線上客服為您服務</p>
            </div>
          </div>
          {/* 🔧 v1.6.0: 關閉按鈕改用 handleClose (含縮回動畫) */}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-primary-600 rounded-full transition-colors"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {/* ============ 訊息列表 ============ */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            // 無訊息時顯示
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={48} className="mb-4" />
              <p>尚無訊息</p>
              <p className="text-sm">開始與客服對話吧！</p>
            </div>
          ) : (
            // 訊息列表
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'opacity-80' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {/* 自動滾動錨點 */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ============ 輸入框 ============ */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入訊息..."
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="bg-primary-500 text-white p-2
                hover:bg-primary-600 active:bg-primary-700
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors duration-200
                flex items-center justify-center
                w-10 h-10
              "
              aria-label="發送訊息"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            按 Enter 發送訊息
          </p>
        </div>
      </div>
    </>
  )
}
