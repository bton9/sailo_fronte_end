/**
 * 客服聊天室視窗元件
 * 路徑: components/chatroom/admin_chat/AdminChatRoom.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 客服端聊天介面
 * - 即時訊息收發（WebSocket）
 * - 支援文字與圖片訊息
 * - 使用者資訊顯示
 * - 聊天室狀態管理
 * - AI 客服記錄查看（預留）
 *
 * 設計規範:
 * - 方形設計（無圓角）
 * - Primary 配色（金棕色）
 * - 與 CustomerChat 一致的訊息樣式
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  X,
  Send,
  Image as ImageIcon,
  User,
  Clock,
  MessageCircle,
} from 'lucide-react'
import ImageUploader from '../customer_chat/ImageUploader'

export default function AdminChatRoom({ room, onClose, onRoomUpdate }) {
  const { socket, isConnected } = useSocket()
  const { user } = useAuth()

  // ============ State 管理 ============
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)

  const messagesEndRef = useRef(null)

  // ============================================
  // 工具函式：滾動到底部
  // ============================================
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ============================================
  // 工具函式：格式化時間
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
      return ''
    }
  }

  // ============================================
  // 載入訊息歷史
  // ============================================
  useEffect(() => {
    if (!room) return

    loadMessages()
  }, [room])

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/rooms/${room.id}/messages?limit=50&offset=0`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        setMessages(data.messages)
        setTimeout(scrollToBottom, 100)

        // 標記使用者的未讀訊息為已讀
        const unreadUserMessages = data.messages.filter(
          (msg) => msg.sender_id !== user?.id && msg.is_read === 0
        )

        if (unreadUserMessages.length > 0 && socket) {
          const messageIds = unreadUserMessages.map((msg) => msg.id)
          socket.emit('message_read', {
            roomId: room.id,
            messageIds: messageIds,
          })
        }
      }
    } catch (error) {
      console.error('❌ 載入訊息失敗:', error)
    }
  }

  // ============================================
  // WebSocket: 加入聊天室
  // ============================================
  useEffect(() => {
    if (!socket || !room) return

    console.log('🔌 客服加入聊天室:', room.id)
    socket.emit('join_room', { roomId: room.id })

    return () => {
      console.log('🔌 客服離開聊天室:', room.id)
      socket.emit('leave_room', { roomId: room.id })
    }
  }, [socket, room])

  // ============================================
  // WebSocket: 監聽即時訊息
  // ============================================
  useEffect(() => {
    if (!socket || !room) return

    const handleNewMessage = (message) => {
      console.log('💬 客服收到新訊息:', message)
      setMessages((prev) => [...prev, message])
      setTimeout(scrollToBottom, 100)

      // 標記為已讀
      if (message.sender_id !== user?.id) {
        socket.emit('message_read', {
          roomId: room.id,
          messageIds: [message.id],
        })
      }
    }

    const handleMessagesRead = (data) => {
      console.log('👁️ 訊息已讀:', data)
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id) ? { ...msg, is_read: 1 } : msg
        )
      )
    }

    socket.on('new_message', handleNewMessage)
    socket.on('messages_read', handleMessagesRead)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('messages_read', handleMessagesRead)
    }
  }, [socket, room, user])

  // ============================================
  // 發送訊息
  // ============================================
  const handleSendMessage = () => {
    if (!inputMessage.trim() || isSending || !socket) return

    setIsSending(true)

    socket.emit('send_message', {
      roomId: room.id,
      message: inputMessage.trim(),
      messageType: 'text',
    })

    setInputMessage('')
    setIsSending(false)
  }

  // ============================================
  // 圖片上傳成功
  // ============================================
  const handleImageUploaded = (imageData) => {
    if (!socket || !room) return

    socket.emit('send_message', {
      roomId: room.id,
      message: null,
      messageType: 'image',
      fileUrl: imageData.imageUrl,
      fileName: imageData.fileName,
      thumbnailUrl: imageData.thumbnailUrl,
    })

    setShowImageUploader(false)
  }

  // ============================================
  // 渲染：使用者資訊卡
  // ============================================
  const renderUserInfo = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* 使用者頭像 */}
          <div className="w-12 h-12 bg-primary-500 text-white flex items-center justify-center">
            <User size={24} />
          </div>

          {/* 使用者資訊 */}
          <div>
            <h3 className="font-semibold text-secondary-900">
              {room.user_name || '訪客'}
            </h3>
            <p className="text-sm text-gray-600">{room.user_email}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>主題：{room.subject || '一般諮詢'}</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(room.created_at).toLocaleString('zh-TW')}
              </span>
            </div>

            {/* AI 轉接標記 */}
            {room.source === 'ai_transfer' && (
              <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs">
                🤖 AI 轉接
                {room.transfer_context && (
                  <span className="ml-2 text-gray-600">
                    （{room.transfer_context}）
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )

  // ============================================
  // 渲染：訊息列表
  // ============================================
  const renderMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 bg-secondary-200">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <MessageCircle size={48} className="mb-3 opacity-50" />
          <p>尚無訊息</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isOwnMessage = msg.sender_id === user?.id
          const isSystemMessage = msg.message_type === 'system'

          // 系統訊息
          if (isSystemMessage) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1">
                  {msg.message}
                </span>
              </div>
            )
          }

          // 圖片訊息
          if (msg.message_type === 'image') {
            return (
              <div
                key={msg.id}
                className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[75%]">
                  <div
                    className={`inline-block overflow-hidden ${isOwnMessage ? 'bg-primary-500' : 'bg-white shadow-sm'}`}
                  >
                    <img
                      src={msg.file_url}
                      alt={msg.file_name}
                      className="max-w-full h-auto cursor-pointer"
                      onClick={() => window.open(msg.file_url, '_blank')}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                  >
                    {formatTime(msg.created_at)}
                    {isOwnMessage && msg.is_read === 1 && (
                      <span className="ml-1">✓</span>
                    )}
                  </p>
                </div>
              </div>
            )
          }

          // 文字訊息
          return (
            <div
              key={msg.id}
              className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
                <p
                  className={`text-xs mt-1 text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                >
                  {formatTime(msg.created_at)}
                  {isOwnMessage && msg.is_read === 1 && (
                    <span className="ml-1">✓</span>
                  )}
                </p>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )

  // ============================================
  // 渲染：輸入區
  // ============================================
  const renderInputArea = () => (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center gap-2">
        {/* 圖片上傳按鈕 */}
        <button
          onClick={() => setShowImageUploader(true)}
          className="p-2 hover:bg-gray-100 transition-colors"
          title="上傳圖片"
        >
          <ImageIcon size={20} className="text-gray-600" />
        </button>

        {/* 輸入框 */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="輸入訊息..."
          className="flex-1 px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          disabled={isSending || !isConnected}
        />

        {/* 發送按鈕 */}
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isSending || !isConnected}
          className="bg-primary-500 text-white p-2 w-10 h-10 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </div>

      {!isConnected && (
        <p className="text-xs text-red-500 mt-2 text-center">
          WebSocket 未連線，無法發送訊息
        </p>
      )}
    </div>
  )

  // ============================================
  // 主渲染
  // ============================================
  return (
    <div className="bg-white shadow-sm flex flex-col h-[calc(100vh-200px)]">
      {/* 使用者資訊 */}
      {renderUserInfo()}

      {/* 訊息列表 */}
      {renderMessages()}

      {/* 輸入區 */}
      {renderInputArea()}

      {/* 圖片上傳器 */}
      {showImageUploader && (
        <ImageUploader
          roomId={room.id}
          onClose={() => setShowImageUploader(false)}
          onImageUploaded={handleImageUploaded}
        />
      )}
    </div>
  )
}
