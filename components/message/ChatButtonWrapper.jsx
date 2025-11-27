/**
 * ChatButtonWrapper - 聊天按鈕包裝元件
 * 路徑: sailo/components/message/ChatButtonWrapper.jsx
 *
 * 用途: 在 Layout 中使用的包裝元件
 * 這個元件可以安全地在 Server Component (如 app/layout.jsx) 中使用
 *
 * 功能:
 * 1. 整合 AuthContext,只對登入使用者顯示
 * 2. 管理聊天視窗的開啟/關閉狀態
 * 3. 管理未讀訊息數量
 * 4. 作為 Client Component 的隔離層
 * 5. 整合 FloatingChatButton 和 CustomerChat (客服聊天系統)
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import FloatingChatButton from './FloatingChatButton'
import CustomerChat from '@/components/chatroom/customer_chat'

export default function ChatButtonWrapper() {
  const { isAuthenticated, user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)

  /**
   * 開啟聊天室
   */
  const handleChatOpen = () => {
    console.log('🔔 開啟客服聊天室')
    setIsChatOpen(true)
    setUnreadCount(0) // 清除未讀數量
  }

  /**
   * 關閉聊天室
   */
  const handleChatClose = () => {
    console.log('🚪 關閉客服聊天室')
    setIsChatOpen(false)
  }

  // 🔐 未登入不顯示聊天按鈕
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* 浮動聊天按鈕 */}
      <FloatingChatButton
        unreadCount={unreadCount}
        onChatOpen={handleChatOpen}
      />

      {/* 客服聊天視窗 (WebSocket + ImageKit) */}
      <CustomerChat isOpen={isChatOpen} onClose={handleChatClose} />
    </>
  )
}
