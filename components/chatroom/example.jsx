/**
 * ChatRoom 使用範例
 * 路徑: sailo/components/chatroom/example.jsx
 *
 * 此檔案展示如何在不同場景下使用聊天室元件
 * 請根據實際需求選擇合適的使用方式
 */

'use client'

import { useState } from 'react'
import ChatRoom from './ChatRoom'
import FloatingChatButton from '@/components/message/FloatingChatButton'

// ============================================
// 範例 1: 基本使用
// ============================================
export function Example1_Basic() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div>
      <h1>我的頁面</h1>

      {/* 開啟按鈕 */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
      >
        開啟聊天室
      </button>

      {/* 聊天室 */}
      <ChatRoom isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

// ============================================
// 範例 2: 與 FloatingChatButton 整合 (推薦)
// ============================================
export function Example2_WithFloatingButton() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const handleChatOpen = () => {
    setIsChatOpen(true)
    setUnreadCount(0) // 開啟後清除未讀數量
  }

  return (
    <div>
      <h1>我的頁面</h1>

      {/* 浮動聊天按鈕 */}
      <FloatingChatButton
        unreadCount={unreadCount}
        onChatOpen={handleChatOpen}
      />

      {/* 聊天室視窗 */}
      <ChatRoom isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

// ============================================
// 範例 3: 在特定頁面使用
// ============================================
// app/site/contact/page.jsx
/*
'use client'

import { useState } from 'react'
import ChatRoom from '@/components/chatroom'

export default function ContactPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">聯絡我們</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">線上客服</h2>
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            開始對話
          </button>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">其他聯絡方式</h2>
          <p>電話: 0800-123-456</p>
          <p>Email: support@sailo.com</p>
        </div>
      </div>

      <ChatRoom 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  )
}
*/

// ============================================
// 範例 4: 全域使用 (已在 ChatButtonWrapper 中實作)
// ============================================
// app/layout.jsx
/*
import { ChatButtonWrapper } from '@/components/message'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <AuthProvider>
          {children}
          <ChatButtonWrapper />
        </AuthProvider>
      </body>
    </html>
  )
}
*/
