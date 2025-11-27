/**
 * ChatHistory - 客服聊天歷史記錄元件
 * 路徑: sailo/components/chatroom/customer_chat/ChatHistory.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 顯示使用者所有歷史聊天室
 * - 支援查看已關閉的聊天記錄
 * - 可切換不同的聊天室
 * - 顯示聊天室狀態與時間
 * - 響應式設計
 *
 * 使用方式:
 * import ChatHistory from '@/components/chatroom/customer_chat/ChatHistory'
 *
 * <ChatHistory
 *   isOpen={isHistoryOpen}
 *   onClose={() => setIsHistoryOpen(false)}
 *   onSelectRoom={(roomId) => handleSelectRoom(roomId)}
 * />
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ChatHistory({ isOpen = false, onClose, onSelectRoom }) {
  const { isAuthenticated } = useAuth()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  // ============================================
  // 載入歷史記錄
  // ============================================
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadHistory()
    }
  }, [isOpen, isAuthenticated])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/history`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('❌ 載入歷史記錄失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // 格式化時間
  // ============================================
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays} 天前`

    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // ============================================
  // 格式化時間 (詳細)
  // ============================================
  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ============================================
  // 取得狀態顯示
  // ============================================
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'waiting':
        return {
          text: '等待中',
          icon: <Clock className="w-4 h-4" />,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
        }
      case 'active':
        return {
          text: '處理中',
          icon: <MessageCircle className="w-4 h-4" />,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        }
      case 'closed':
        return {
          text: '已結束',
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
        }
      default:
        return {
          text: status,
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
        }
    }
  }

  // ============================================
  // 選擇聊天室
  // ============================================
  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId)
    if (onSelectRoom) {
      onSelectRoom(roomId)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩層 */}
      <div
        className="fixed inset-0 bg-black/50 z-[110] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 側邊欄 */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[400px] 
          bg-white shadow-2xl z-[120]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#a48c62]">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">聊天記錄</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* 內容區 */}
        <div className="h-[calc(100%-64px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-[#a48c62] border-t-transparent animate-spin" />
                <p className="mt-2 text-gray-600">載入中...</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>尚無聊天記錄</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {history.map((room) => {
                const status = getStatusDisplay(room.status)
                const lastMessage = room.messages[room.messages.length - 1]

                return (
                  <div
                    key={room.id}
                    className={`
                      p-4 cursor-pointer transition-colors
                      ${
                        selectedRoomId === room.id
                          ? 'bg-[#a48c62]/10'
                          : 'hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleSelectRoom(room.id)}
                  >
                    {/* 聊天室標題與狀態 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          單號 #{room.id} - {room.subject || '一般諮詢'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(room.created_at)}
                        </p>
                      </div>
                      <span
                        className={`
                          px-2 py-1 text-xs font-medium flex items-center gap-1
                          ${status.color} ${status.bg}
                        `}
                      >
                        {status.icon}
                        {status.text}
                      </span>
                    </div>

                    {/* 客服資訊 */}
                    {room.agent_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        客服：{room.agent_name}
                      </p>
                    )}

                    {/* 最後一則訊息 */}
                    {lastMessage && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {lastMessage.message_type === 'image'
                          ? '📷 圖片訊息'
                          : lastMessage.message}
                      </p>
                    )}

                    {/* 訊息數量 */}
                    <p className="text-xs text-gray-500 mt-2">
                      {room.message_count} 則訊息
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
