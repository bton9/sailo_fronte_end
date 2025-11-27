/**
 * HistoryMessageView - 歷史訊息檢視元件
 * 路徑: sailo/components/chatroom/customer_chat/HistoryMessageView.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 顯示選定歷史聊天室的所有訊息
 * - 唯讀模式（不可發送新訊息）
 * - 支援圖片訊息顯示
 * - 顯示聊天室狀態資訊
 *
 * 使用方式:
 * import HistoryMessageView from '@/components/chatroom/customer_chat/HistoryMessageView'
 *
 * <HistoryMessageView
 *   isOpen={isViewOpen}
 *   onClose={() => setIsViewOpen(false)}
 *   roomData={selectedRoom}
 * />
 */

'use client'

import { useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, CheckCircle, Clock, MessageCircle } from 'lucide-react'

export default function HistoryMessageView({
  isOpen = false,
  onClose,
  roomData,
}) {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  // ============================================
  // 自動滾動到底部
  // ============================================
  useEffect(() => {
    if (isOpen && roomData) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [isOpen, roomData])

  // ============================================
  // 格式化時間
  // ============================================
  const formatTime = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (error) {
      console.error('❌ 時間格式化錯誤:', error)
      return ''
    }
  }

  // ============================================
  // 格式化日期時間
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
          icon: null,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
        }
    }
  }

  if (!isOpen || !roomData) return null

  const status = getStatusDisplay(roomData.status)

  return (
    <>
      {/* 遮罩層 */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 主視窗 */}
      <div
        className={`
          fixed inset-0 md:inset-auto
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-[600px] md:h-[80vh] md:max-h-[800px]
          bg-white shadow-2xl z-[9999]
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-0 opacity-0'}
        `}
      >
        {/* 標題欄 */}
        <div className="flex flex-col border-b border-gray-200 bg-[#a48c62] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">
                單號 #{roomData.id} - {roomData.subject || '一般諮詢'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/90">
            <span
              className={`
                px-2 py-1 text-xs font-medium flex items-center gap-1
                bg-white/20
              `}
            >
              {status.icon}
              {status.text}
            </span>
            {roomData.agent_name && <span>客服：{roomData.agent_name}</span>}
            <span>{formatDateTime(roomData.created_at)}</span>
          </div>
        </div>

        {/* 訊息區 */}
        <div className="h-[calc(100%-120px)] overflow-y-auto p-4 bg-gray-50">
          {roomData.messages && roomData.messages.length > 0 ? (
            <div className="space-y-3">
              {roomData.messages.map((msg) => {
                const isMyMessage = msg.sender_id === user?.id
                const isSystem = msg.message_type === 'system'

                // 系統訊息
                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-center items-center my-2"
                    >
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1">
                        {msg.message}
                      </div>
                    </div>
                  )
                }

                // 一般訊息
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[70%] px-4 py-2 
                        ${
                          isMyMessage
                            ? 'bg-[#a48c62] text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }
                      `}
                    >
                      {/* 發送者名稱 */}
                      {!isMyMessage && msg.sender_display_name && (
                        <div className="text-xs text-gray-500 mb-1">
                          {msg.sender_display_name}
                        </div>
                      )}

                      {/* 訊息內容 */}
                      {msg.message_type === 'image' ? (
                        <div>
                          <img
                            src={msg.file_url}
                            alt={msg.file_name || '圖片'}
                            className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.file_url, '_blank')}
                          />
                          {msg.message && (
                            <p className="mt-2 text-sm">{msg.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      )}

                      {/* 時間 */}
                      <div
                        className={`
                          text-xs mt-1 
                          ${isMyMessage ? 'text-white/70' : 'text-gray-500'}
                        `}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>此聊天室沒有訊息</p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="h-[50px] border-t border-gray-200 bg-gray-100 flex items-center justify-center text-sm text-gray-600">
          {roomData.status === 'closed' ? (
            <p>此聊天室已結束，如需協助請開啟新的客服對話</p>
          ) : (
            <p>請返回客服聊天視窗繼續對話</p>
          )}
        </div>
      </div>
    </>
  )
}
