/**
 * FloatingChatButton 使用範例
 * 路徑: sailo/components/message/example.jsx
 *
 * 此檔案展示如何在不同場景下使用浮動聊天按鈕
 * 請根據實際需求選擇合適的使用方式
 */

'use client'

import { useState } from 'react'
import FloatingChatButton from './FloatingChatButton'
// 或使用: import { FloatingChatButton } from '@/components/message'

// ============================================
// 範例 1: 基本使用 (最簡單)
// ============================================
export function Example1_Basic() {
  return (
    <div>
      <h1>我的頁面內容</h1>

      {/* 浮動聊天按鈕 (使用預設設定) */}
      <FloatingChatButton />
    </div>
  )
}

// ============================================
// 範例 2: 帶未讀訊息數量
// ============================================
export function Example2_WithUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(5)

  return (
    <div>
      <h1>我的頁面內容</h1>

      {/* 顯示未讀訊息徽章 */}
      <FloatingChatButton unreadCount={unreadCount} />
    </div>
  )
}

// ============================================
// 範例 3: 處理點擊事件 (開啟聊天視窗)
// ============================================
export function Example3_WithClickHandler() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleChatOpen = () => {
    console.log('開啟聊天室')
    setIsChatOpen(true)
    // TODO: 在這裡開啟聊天視窗元件
  }

  return (
    <div>
      <h1>我的頁面內容</h1>

      {/* 點擊時執行 handleChatOpen */}
      <FloatingChatButton onChatOpen={handleChatOpen} />

      {/* 聊天視窗 (簡化範例) */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg">
            <div className="p-4">
              <h2 className="text-xl font-bold">聊天室</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// 範例 4: 完整功能 (推薦)
// ============================================
export function Example4_Complete() {
  const [unreadCount, setUnreadCount] = useState(3)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleChatOpen = () => {
    setIsChatOpen(true)
    // 開啟聊天室後清除未讀數量
    setUnreadCount(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold p-8">我的頁面</h1>

      {/* 完整配置的浮動聊天按鈕 */}
      <FloatingChatButton
        unreadCount={unreadCount}
        onChatOpen={handleChatOpen}
      />

      {/* 聊天視窗 */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end md:items-center justify-end">
          <div className="w-full md:w-96 h-3/4 md:h-5/6 bg-white rounded-t-2xl md:rounded-l-2xl md:rounded-r-none shadow-2xl">
            {/* 聊天室標題列 */}
            <div className="bg-purple-600 text-white p-4 rounded-t-2xl md:rounded-tl-2xl md:rounded-tr-none flex items-center justify-between">
              <h2 className="text-lg font-bold">客服聊天室</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-purple-700 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 聊天內容區 */}
            <div className="p-4 h-full overflow-y-auto">
              <p className="text-gray-600">歡迎使用客服聊天室</p>
              {/* TODO: 在這裡加入聊天訊息列表 */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// 範例 5: 在全域 Layout 中使用 (推薦)
// ============================================
// 在 app/layout.jsx 中加入:
/*
import FloatingChatButton from '@/components/message'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <AuthProvider>
          {children}
          
          {/* 全域浮動聊天按鈕 *\/}
          <FloatingChatButton 
            unreadCount={0}
            onChatOpen={() => console.log('開啟聊天')}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
*/

// ============================================
// 範例 6: 與 AuthContext 整合
// ============================================
/*
import { useAuth } from '@/contexts/AuthContext'

export function Example6_WithAuth() {
  const { isAuthenticated, user } = useAuth()
  
  // 只有登入使用者才顯示聊天按鈕
  if (!isAuthenticated) return null

  return (
    <FloatingChatButton 
      unreadCount={user?.unreadMessages || 0}
      onChatOpen={() => console.log('開啟聊天')}
    />
  )
}
*/
