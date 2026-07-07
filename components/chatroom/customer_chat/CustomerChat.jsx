/**
 * CustomerChat - 整合 AI 客服的即時聊天元件
 * 路徑: sailo/components/chatroom/customer_chat/CustomerChat.jsx
 * 版本: v3.2.0
 *
 * 功能說明:
 * - 🆕 AI 客服自動接待 (Ollama + llama3.1:8b)
 * - 🆕 關鍵字自動轉接人工客服 (無需手動點擊)
 * - 🆕 訊息智能摺疊 (超過3分鐘自動收合)
 * - 🆕 AI轉接只顯示近期對話 (3分鐘內)
 * - 即時客服聊天 (WebSocket)
 * - 支援文字訊息與圖片上傳 (ImageKit)
 * - 訊息歷史載入與分頁
 * - 已讀狀態顯示
 * - 輸入中狀態 (typing indicator)
 * - 自動滾動到最新訊息
 * - 響應式設計 (手機/桌面)
 *
 * v3.2.0 新增功能:
 * - 訊息時間管理: 超過3分鐘的訊息自動摺疊
 * - 一鍵展開/收合舊訊息
 * - AI轉接時只保留3分鐘內的對話記錄
 * - 優化閱讀體驗,減少訊息堆積
 *
 * v3.1.0 改進:
 * - 移除所有轉人工按鈕
 * - 關鍵字自動轉接: "轉人工"、"人工"、"真人客服"
 * - AI 建議轉接時自動執行 (無需確認)
 * - 更流暢的用戶體驗
 *
 * 工作流程:
 * 1. 使用者開啟聊天室 → AI 自動接待
 * 2. 使用者與 AI 對話 → AI 判斷需求
 * 3. 輸入關鍵字或 AI 建議轉接 → 自動建立客服單號
 * 4. 真人客服接手 → 查看 3分鐘內的 AI 對話記錄
 * 5. 舊訊息自動收合 → 可手動展開查看
 *
 * 使用方式:
 * import CustomerChat from '@/components/chatroom/customer_chat'
 *
 * <CustomerChat
 *   isOpen={isChatOpen}
 *   onClose={() => setIsChatOpen(false)}
 * />
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { useNotify } from '@/contexts/NotificationContext'
import {
  X,
  Send,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  MessageCircle,
  History,
  Bot,
  User,
} from 'lucide-react'
import ImageUploader from './ImageUploader'
import ChatHistory from './ChatHistory'
import HistoryMessageView from './HistoryMessageView'
import RatingModal from './RatingModal'

export default function CustomerChat({ isOpen = false, onClose }) {
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected } = useSocket()
  const notify = useNotify()

  // ============ State 管理 ============
  // 🆕 AI 客服狀態
  const [chatMode, setChatMode] = useState('ai') // 'ai' | 'human'
  const [aiRoom, setAiRoom] = useState(null) // AI 聊天室

  // 人工客服狀態
  const [room, setRoom] = useState(null) // 當前聊天室
  const [messages, setMessages] = useState([]) // 訊息列表
  const [inputMessage, setInputMessage] = useState('') // 輸入框內容
  const [isSending, setIsSending] = useState(false) // 是否正在發送
  const [isLoading, setIsLoading] = useState(false) // 是否正在載入
  const [isTyping, setIsTyping] = useState(false) // 對方是否正在輸入
  const [showImageUploader, setShowImageUploader] = useState(false) // 是否顯示圖片上傳器
  const [showHistory, setShowHistory] = useState(false) // 是否顯示歷史記錄
  const [selectedHistoryRoom, setSelectedHistoryRoom] = useState(null) // 選中的歷史聊天室
  const [showHistoryView, setShowHistoryView] = useState(false) // 是否顯示歷史訊息檢視
  const [isRoomClosed, setIsRoomClosed] = useState(false) // 🆕 聊天室是否已被客服關閉
  const [showOldMessages, setShowOldMessages] = useState(false) // 🆕 v3.2.0: 是否顯示舊訊息 (超過3分鐘)

  // 🆕 評分系統 state
  const [showRatingModal, setShowRatingModal] = useState(false) // 是否顯示評分彈窗
  const [ratingRoomId, setRatingRoomId] = useState(null) // 要評分的聊天室 ID
  const [ratingAgentName, setRatingAgentName] = useState('客服人員') // 客服人員名稱

  // ============ Refs ============
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // ============================================
  // 工具函式: 滾動到底部
  // ============================================
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ============================================
  // 工具函式: 格式化時間
  // ============================================
  const formatTime = (dateString) => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)

      // 檢查是否為有效日期
      if (isNaN(date.getTime())) {
        console.warn(' 無效的日期格式:', dateString)
        return ''
      }

      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (error) {
      console.error(' 時間格式化錯誤:', error, dateString)
      return ''
    }
  }

  // ============================================
  // 🆕 API: 建立或取得 AI 聊天室
  // ============================================
  const createOrGetAIRoom = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)

      const response = await fetch(`${API_URL}/api/ai-chat/rooms`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        setAiRoom(data.room)

        // 若是新建立的聊天室,顯示歡迎訊息
        if (data.isNew && data.welcomeMessage) {
          setMessages([
            {
              id: 'ai-welcome',
              type: 'ai',
              message: data.welcomeMessage,
              sender_id: 'ai',
              created_at: new Date().toISOString(),
            },
          ])
        } else {
          // 載入 AI 歷史訊息
          await loadAIMessages(data.room.id)
        }
      }
    } catch (error) {
      console.error(' 建立 AI 聊天室失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // ============================================
  // 🆕 API: 載入 AI 訊息歷史
  // ============================================
  const loadAIMessages = useCallback(
    async (roomId) => {
      try {
        const response = await fetch(
          `${API_URL}/api/ai-chat/rooms/${roomId}/messages`,
          {
            credentials: 'include',
          }
        )

        const data = await response.json()

        if (data.success) {
          // 🆕 v3.2.0: 計算3分鐘前的時間
          const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)

          // 轉換 AI 訊息格式為統一格式
          const formattedMessages = data.messages.flatMap((msg) => {
            const msgTime = new Date(msg.created_at)
            const isOld = msgTime < threeMinutesAgo

            return [
              {
                id: `user-${msg.id}`,
                type: 'user',
                message: msg.user_message,
                sender_id: user?.id,
                created_at: msg.created_at,
                isOldMessage: isOld, // 🆕 標記舊訊息
              },
              {
                id: `ai-${msg.id}`,
                type: 'ai',
                message: msg.ai_response,
                sender_id: 'ai',
                created_at: msg.created_at,
                shouldTransfer: msg.is_transfer_request,
                isOldMessage: isOld, // 🆕 標記舊訊息
              },
            ]
          })

          setMessages(formattedMessages)
          setTimeout(scrollToBottom, 100)
        }
      } catch (error) {
        console.error(' 載入 AI 訊息失敗:', error)
      }
    },
    [user]
  )

  // ============================================
  // 🆕 API: 轉接到人工客服
  // ============================================
  const transferToHuman = useCallback(async () => {
    if (!aiRoom) return

    try {
      setIsSending(true)
      setIsLoading(true)

      // 呼叫轉接 API
      const response = await fetch(`${API_URL}/api/ai-chat/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: aiRoom.id }),
      })

      const data = await response.json()

      if (data.success) {
        // 切換到人工模式
        setChatMode('human')
        setRoom(data.customerServiceRoom)
        setAiRoom(null)

        // 新增系統訊息
        setMessages((prev) => [
          ...prev,
          {
            id: `system-transfer-${Date.now()}`,
            type: 'system',
            message: ' 已為您轉接真人客服,客服人員將盡快為您服務。',
            sender_id: 'system',
            created_at: new Date().toISOString(),
          },
        ])

        // 加入人工客服聊天室 (WebSocket)
        if (socket && isConnected) {
          socket.emit('join_room', { roomId: data.customerServiceRoom.id })
          console.log(' 已加入人工客服聊天室:', data.customerServiceRoom.id)
        }

        // 載入人工客服訊息 (包含轉接上下文)
        await loadMessages(data.customerServiceRoom.id)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error(' 轉接人工客服失敗:', error)
      notify('轉接失敗,請稍後再試', 'error')
    } finally {
      setIsSending(false)
      setIsLoading(false)
    }
  }, [aiRoom, socket, isConnected, notify])

  // ============================================
  // 🆕 API: 發送訊息給 AI
  // ============================================
  const sendMessageToAI = useCallback(
    async (message) => {
      try {
        // 🆕 檢查是否包含轉人工關鍵字
        const transferKeywords = ['轉人工', '人工', '真人客服']
        const shouldAutoTransfer = transferKeywords.some((keyword) =>
          message.toLowerCase().includes(keyword.toLowerCase())
        )

        // 先發送訊息給 AI（讓後端儲存）
        const response = await fetch(`${API_URL}/api/ai-chat/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: aiRoom.id,
            message,
          }),
        })

        const data = await response.json()

        console.log('🔍 [CustomerChat] 收到 AI 回應:', data)

        if (data.success) {
          // 新增 AI 回應到訊息列表
          const aiMsg = {
            id: `ai-${data.message.id}`,
            type: 'ai',
            message: data.message.aiResponse,
            sender_id: 'ai',
            created_at: data.message.createdAt,
            shouldTransfer: data.message.shouldTransfer,
          }

          setMessages((prev) => [...prev, aiMsg])

          // 🆕 處理特殊指令：導航到密碼修改頁面
          if (data.message.specialAction === 'NAVIGATE_CHANGE_PASSWORD') {
            console.log(' [CustomerChat] 偵測到密碼修改指令，準備跳轉...')

            // 延遲 1.5 秒後跳轉，讓使用者看到 AI 的回應
            setTimeout(() => {
              const targetPath =
                data.message.navigationPath || '/site/membercenter?tab=password'
              console.log('🚀 [CustomerChat] 開始跳轉到:', targetPath)
              window.location.href = targetPath
            }, 1500)

            return data.message
          }

          // 🆕 關鍵字觸發轉接（優先級高於 AI 建議）
          if (shouldAutoTransfer) {
            console.log('🔄 偵測到轉人工關鍵字，自動轉接...')
            setTimeout(() => {
              transferToHuman()
            }, 800)
            return data.message
          }

          // 🆕 若 AI 建議轉接,自動執行轉接
          if (data.message.shouldTransfer) {
            console.log('🔄 AI 建議轉接，自動轉接到真人客服...')
            setTimeout(() => {
              transferToHuman()
            }, 1000)
          }

          return data.message
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error(' 發送 AI 訊息失敗:', error)

        // 顯示錯誤訊息
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            type: 'system',
            message: '抱歉,訊息發送失敗。請稍後再試。',
            sender_id: 'system',
            created_at: new Date().toISOString(),
          },
        ])

        throw error
      }
    },
    [aiRoom, user, transferToHuman]
  )

  // ============================================
  // API: 建立或取得聊天室 (人工客服)
  // ============================================
  const createOrGetRoom = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)

      const response = await fetch(`${API_URL}/api/customer-service/rooms`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '一般諮詢',
          priority: 'medium',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRoom(data.room)
        await loadMessages(data.room.id)
      }
    } catch (error) {
      console.error(' 建立聊天室失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // ============================================
  // API: 載入訊息歷史
  // ============================================
  const loadMessages = useCallback(
    async (roomId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/rooms/${roomId}/messages?limit=50&offset=0`,
          {
            credentials: 'include',
          }
        )

        const data = await response.json()

        if (data.success) {
          // 🆕 v3.2.0: 從 AI 轉接時,只顯示 3 分鐘內的 AI 訊息
          const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)

          const filteredMessages = data.messages.map((msg) => {
            const msgTime = new Date(msg.created_at)
            const isOld = msgTime < threeMinutesAgo
            const isAIMessage =
              msg.sender_id === 'ai' ||
              msg.sender_type === 'ai' ||
              msg.type === 'ai'

            // 如果是超過 3 分鐘的 AI 訊息,標記為舊訊息
            if (isOld && isAIMessage) {
              return { ...msg, isOldMessage: true }
            }
            return msg
          })

          setMessages(filteredMessages)
          setTimeout(scrollToBottom, 100)

          // 標記客服的未讀訊息為已讀
          const unreadAgentMessages = data.messages.filter(
            (msg) => msg.sender_id !== user?.id && msg.is_read === 0
          )

          if (unreadAgentMessages.length > 0 && socket) {
            const messageIds = unreadAgentMessages.map((msg) => msg.id)
            socket.emit('message_read', {
              roomId: roomId,
              messageIds: messageIds,
            })
          }
        }
      } catch (error) {
        console.error(' 載入訊息失敗:', error)
      }
    },
    [scrollToBottom, socket, user]
  )

  // ============================================
  // WebSocket: 加入聊天室
  // ============================================
  useEffect(() => {
    if (socket && room && isOpen) {
      console.log('🔌 加入聊天室:', room.id)
      socket.emit('join_room', { roomId: room.id })

      return () => {
        console.log('🔌 離開聊天室:', room.id)
        socket.emit('leave_room', { roomId: room.id })
      }
    }
  }, [socket, room, isOpen])

  // ============================================
  // WebSocket: 監聽即時訊息
  // ============================================
  useEffect(() => {
    if (!socket || !room) return

    // 收到新訊息
    const handleNewMessage = (message) => {
      console.log('💬 收到新訊息:', message)
      setMessages((prev) => [...prev, message])
      setTimeout(scrollToBottom, 100)

      // 若是對方發送的訊息,標記為已讀
      if (message.sender_id !== user?.id) {
        socket.emit('message_read', {
          roomId: room.id,
          messageIds: [message.id],
        })
      }
    }

    // 對方正在輸入
    const handleUserTyping = (data) => {
      if (data.userId !== user?.id) {
        setIsTyping(data.isTyping)

        // 3 秒後自動取消輸入狀態
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000)
        }
      }
    }

    // 訊息已讀
    const handleMessagesRead = (data) => {
      console.log('👁️ 訊息已讀:', data)
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id) ? { ...msg, is_read: 1 } : msg
        )
      )
    }

    // 🆕 聊天室被關閉
    const handleRoomClosed = (data) => {
      console.log('🔒 聊天室已被客服關閉:', data)
      setIsRoomClosed(true)

      // 顯示系統訊息
      const systemMessage = {
        id: Date.now(),
        room_id: data.roomId,
        sender_id: null,
        message: data.message || '客服已結束此對話，如需繼續諮詢請發送新訊息',
        message_type: 'system',
        created_at: data.closedAt || new Date().toISOString(),
        is_read: 1,
      }

      setMessages((prev) => [...prev, systemMessage])
      setTimeout(scrollToBottom, 100)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('messages_read', handleMessagesRead)
    socket.on('room_closed', handleRoomClosed) // 🆕 監聽聊天室關閉事件

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('messages_read', handleMessagesRead)
      socket.off('room_closed', handleRoomClosed) // 🆕 清除監聽
    }
  }, [socket, room, user, scrollToBottom])

  // ============================================
  // 🆕 事件: 發送訊息 (支援 AI 和人工模式)
  // ============================================
  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault()

      if (!inputMessage.trim() || isSending) return

      const userMessageText = inputMessage.trim()
      setInputMessage('') // 立即清空輸入框
      setIsSending(true)

      try {
        // 🆕 情況 A: AI 模式
        if (chatMode === 'ai') {
          // 立即顯示使用者訊息 (AI 模式需要立即顯示)
          const userMsg = {
            id: `user-${Date.now()}`,
            type: 'user',
            message: userMessageText,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, userMsg])

          if (!aiRoom) {
            console.error(' AI 聊天室不存在')
            throw new Error('AI 聊天室不存在')
          }

          // 發送訊息給 AI
          await sendMessageToAI(userMessageText)
        }
        // 情況 B: 人工模式
        else if (chatMode === 'human') {
          let targetRoom = room

          // 🔧 人工模式: 不要手動新增訊息，等 WebSocket 返回
          // 原因: handleNewMessage 會自動新增，避免重複

          // 情況 B1: 如果沒有聊天室（第一次發送訊息），建立新聊天室
          if (!room && !isRoomClosed) {
            console.log('📝 第一次發送訊息，建立聊天室...')

            const response = await fetch(
              `${API_URL}/api/customer-service/rooms`,
              {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subject: '一般諮詢',
                  priority: 'medium',
                }),
              }
            )

            const data = await response.json()

            if (data.success) {
              targetRoom = data.room
              setRoom(data.room)

              // 加入 WebSocket 聊天室
              if (socket && isConnected) {
                socket.emit('join_room', { roomId: data.room.id })
              }
            } else {
              throw new Error('建立聊天室失敗')
            }
          }
          // 情況 B2: 聊天室已關閉，建立新聊天室
          else if (isRoomClosed && room) {
            console.log('📝 聊天室已關閉，建立新聊天室...')

            const response = await fetch(
              `${API_URL}/api/customer-service/rooms`,
              {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subject: '一般諮詢',
                  priority: 'medium',
                }),
              }
            )

            const data = await response.json()

            if (data.success) {
              targetRoom = data.room
              setRoom(data.room)
              setIsRoomClosed(false)

              // 離開舊聊天室
              if (socket && isConnected) {
                socket.emit('leave_room', { roomId: room.id })
              }

              // 清空訊息列表
              setMessages([])

              // 加入新聊天室
              if (socket && isConnected) {
                socket.emit('join_room', { roomId: data.room.id })
              }
            } else {
              throw new Error('建立新聊天室失敗')
            }
          }

          // 發送訊息 (WebSocket)
          if (socket && isConnected && targetRoom) {
            socket.emit('send_message', {
              roomId: targetRoom.id,
              message: userMessageText.trim(),
              messageType: 'text',
            })

            console.log(' 訊息已發送 (人工模式):', userMessageText)
          } else {
            throw new Error('WebSocket 未連接或聊天室不存在')
          }
        }
      } catch (error) {
        console.error(' 發送訊息失敗:', error)

        // 恢復輸入框內容
        setInputMessage(userMessageText)

        notify('訊息發送失敗,請稍後再試', 'error')
      } finally {
        setIsSending(false)
      }
    },
    [
      inputMessage,
      isSending,
      chatMode,
      aiRoom,
      room,
      isRoomClosed,
      socket,
      isConnected,
      user,
      sendMessageToAI,
      notify,
    ]
  )

  // ============================================
  // 事件: 輸入中狀態
  // ============================================
  const handleTyping = useCallback(() => {
    if (!socket || !room) return

    // 發送輸入中狀態
    socket.emit('typing', { roomId: room.id, isTyping: true })

    // 清除之前的計時器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // 2 秒後自動取消輸入狀態
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { roomId: room.id, isTyping: false })
    }, 2000)
  }, [socket, room])

  // ============================================
  // 事件: 圖片上傳成功
  // ============================================
  const handleImageUploaded = useCallback(
    (imageData) => {
      if (!socket || !room) return

      // 透過 WebSocket 發送圖片訊息
      socket.emit('send_message', {
        roomId: room.id,
        message: null,
        messageType: 'image',
        fileUrl: imageData.imageUrl,
        fileName: imageData.fileName,
        thumbnailUrl: imageData.thumbnailUrl,
      })

      setShowImageUploader(false)
    },
    [socket, room]
  )

  // ============================================
  // 事件: 選擇歷史聊天室
  // ============================================
  const handleSelectHistoryRoom = useCallback(async (roomId) => {
    try {
      // 載入歷史記錄
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/history`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        const room = data.history.find((r) => r.id === roomId)
        if (room) {
          setSelectedHistoryRoom(room)
          setShowHistory(false)
          setShowHistoryView(true)
        }
      }
    } catch (error) {
      console.error(' 載入歷史訊息失敗:', error)
    }
  }, [])

  // ============================================
  // 🆕 事件: 提交客服評分
  // ============================================
  const handleSubmitRating = useCallback(
    async (rating, comment) => {
      try {
        console.log('⭐ 提交評分:', { roomId: ratingRoomId, rating, comment })

        const response = await fetch(
          `${API_URL}/api/customer-service/rooms/${ratingRoomId}/rating`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment }),
          }
        )

        const data = await response.json()

        if (data.success) {
          console.log(' 評分提交成功')
          //   alert('感謝您的評分！')
          setShowRatingModal(false)
          setRatingRoomId(null)
          setRatingAgentName('客服人員')
        } else {
          throw new Error(data.message || '提交評分失敗')
        }
      } catch (error) {
        console.error(' 提交評分失敗:', error)
        throw error
      }
    },
    [ratingRoomId, API_URL]
  )

  // ============================================
  // 🆕 初始化: 開啟聊天室時先建立 AI 聊天室
  // ============================================
  useEffect(() => {
    if (isOpen && isAuthenticated && !aiRoom && !room && chatMode === 'ai') {
      createOrGetAIRoom()
    }
  }, [isOpen, isAuthenticated, aiRoom, room, chatMode, createOrGetAIRoom])

  // ============================================
  // 初始化: 不再自動建立人工客服聊天室
  // 改為 AI 轉接時或使用者主動要求時才建立
  // ============================================
  // useEffect(() => {
  //   if (isOpen && isAuthenticated && !room) {
  //     createOrGetRoom()
  //   }
  // }, [isOpen, isAuthenticated, room, createOrGetRoom])

  // ============================================
  // 自動滾動: 訊息更新時
  // ============================================
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ============================================
  // 🆕 WebSocket: 監聽聊天室關閉事件
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected || chatMode !== 'human') return

    const handleRoomClosed = (data) => {
      console.log('📢 收到聊天室關閉通知:', data)

      // 設定聊天室已關閉狀態
      setIsRoomClosed(true)

      // 顯示系統訊息
      setMessages((prev) => [
        ...prev,
        {
          id: `system-closed-${Date.now()}`,
          type: 'system',
          message: '客服已結束此對話',
          sender_id: 'system',
          created_at: new Date().toISOString(),
        },
      ])

      // 顯示評分彈窗
      setRatingRoomId(data.roomId)
      setRatingAgentName(data.agentName || '客服人員')
      setShowRatingModal(true)
    }

    socket.on('room_closed', handleRoomClosed)

    return () => {
      socket.off('room_closed', handleRoomClosed)
    }
  }, [socket, isConnected, chatMode])

  // ============================================
  // 未登入提示
  // ============================================
  if (!isAuthenticated) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
        )}
        <div
          className={`
            fixed z-50 bg-white shadow-2xl
            w-full md:w-96
            h-2/3 md:h-2/3
            bottom-0 md:bottom-0 right-0 md:right-0
            flex flex-col items-center justify-center
            transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
            md:${isOpen ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-full translate-y-0 opacity-0 pointer-events-none'}
          `}
        >
          <MessageCircle size={48} className="mb-4 text-gray-400" />
          <p className="text-gray-500">請先登入以使用客服功能</p>
        </div>
      </>
    )
  }

  // ============================================
  // 渲染: 聊天室介面
  // ============================================
  return (
    <>
      {/* ============ 遮罩層 ============ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      {/* ============ 聊天室容器 ============ */}
      {/*
        ✨ 參考 ChatRoom v1.7.0: 使用 CSS Transition + Transform
        - 元件始終渲染，使用 CSS transition 控制動畫
        - 使用 transform 改變位置（不觸發重排）
        - 手機版：translate-y（上下滑動）
        - 桌面版：translate-x（左右滑動）
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
        {/* 🎨 參考 ChatRoom: 純色 primary-500 背景 */}
        {/* 🆕 v3.0.0: 支援 AI/人工模式切換顯示 */}
        <div className="bg-primary-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 🆕 AI/人工模式圖示 */}
            {chatMode === 'ai' ? (
              <Bot size={24} className="animate-pulse" />
            ) : (
              <User size={24} />
            )}
            <div>
              {/* 🆕 動態標題 */}
              <h3 className="text-lg font-bold">
                {chatMode === 'ai' ? 'AI 智能助手' : '真人客服'}
              </h3>
              <p className="text-xs opacity-80">
                {chatMode === 'ai'
                  ? 'AI 為您即時解答'
                  : isConnected
                    ? '線上客服為您服務'
                    : '連線中...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 歷史記錄按鈕 */}
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 hover:bg-primary-600 rounded-full transition-colors"
              aria-label="查看歷史記錄"
              title="查看歷史記錄"
            >
              <History size={20} />
            </button>
            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-600 rounded-full transition-colors"
              aria-label="關閉"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ============ 訊息列表 ============ */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p>載入訊息中...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={48} className="mb-4" />
              <p>尚無訊息</p>
              <p className="text-sm">開始與客服對話吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 🆕 v3.2.0: 舊訊息摺疊提示 */}
              {(() => {
                const oldMessages = messages.filter((msg) => msg.isOldMessage)
                const hasOldMessages = oldMessages.length > 0

                if (hasOldMessages && !showOldMessages) {
                  return (
                    <div className="flex justify-center my-4">
                      <button
                        onClick={() => setShowOldMessages(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 bg-white border border-primary-300 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2"
                      >
                        <History size={16} />
                        顯示 {oldMessages.length} 則較早的訊息 (3分鐘前)
                      </button>
                    </div>
                  )
                }

                if (hasOldMessages && showOldMessages) {
                  return (
                    <div className="flex justify-center my-4">
                      <button
                        onClick={() => setShowOldMessages(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
                      >
                        收合較早的訊息
                      </button>
                    </div>
                  )
                }

                return null
              })()}

              {messages.map((msg) => {
                // 🆕 v3.2.0: 如果是舊訊息且未展開,跳過渲染
                if (msg.isOldMessage && !showOldMessages) {
                  return null
                }

                const isOwnMessage = msg.sender_id === user?.id
                const isSystemMessage = msg.message_type === 'system'
                // 🆕 v3.0.0: AI 訊息判斷
                const isAIMessage =
                  msg.sender_id === 'ai' ||
                  msg.sender_type === 'ai' ||
                  msg.type === 'ai'

                // 🆕 v3.2.0: 在【從 AI 客服轉接】標題後顯示提示
                if (
                  msg.message === '【從 AI 客服轉接】 對話記錄:' &&
                  !showOldMessages
                ) {
                  return (
                    <div key={msg.id}>
                      <div className="flex justify-center">
                        <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                          {msg.message}
                        </span>
                      </div>
                      <div className="flex justify-center mt-2">
                        <span className="text-xs text-gray-500 italic">
                          (僅顯示 3 分鐘內的對話記錄)
                        </span>
                      </div>
                    </div>
                  )
                }

                // 系統訊息
                if (isSystemMessage) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  )
                }

                // 🆕 v3.0.0: AI 訊息 (文字)
                if (isAIMessage) {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-start items-start gap-2"
                    >
                      <Bot
                        size={20}
                        className="text-primary-500 mt-2 flex-shrink-0"
                      />
                      <div className="max-w-[75%]">
                        <div className="bg-white border border-primary-200 text-gray-800 shadow-sm px-4 py-2.5 rounded-lg">
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                        <p className="text-xs mt-1 text-gray-500 text-left">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                }

                // 圖片訊息
                if (msg.message_type === 'image') {
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%]`}>
                        <div
                          className={`
                            inline-block overflow-hidden
                            ${isOwnMessage ? 'bg-primary-500' : 'bg-white shadow-sm'}
                          `}
                        >
                          <img
                            src={msg.file_url}
                            alt={msg.file_name}
                            className="max-w-full h-auto cursor-pointer"
                            onClick={() => window.open(msg.file_url, '_blank')}
                          />
                        </div>
                        <p
                          className={`text-xs mt-1 text-gray-500 ${
                            isOwnMessage ? 'text-right' : 'text-left'
                          }`}
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

                // 文字訊息 (真人客服 或 用戶自己)
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%]`}>
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
                        className={`text-xs mt-1 text-gray-500 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                        {isOwnMessage && msg.is_read === 1 && (
                          <span className="ml-1">✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}

              {/* 輸入中指示器 */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              {/* 自動滾動錨點 */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ============ 輸入框 ============ */}
        <div className="p-4 bg-white border-t border-gray-200">
          {/* 🆕 聊天室已關閉提示 */}
          {isRoomClosed && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  客服已結束此對話。發送新訊息將開啟新的諮詢單號。
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* 圖片上傳按鈕 */}
            <button
              type="button"
              onClick={() => setShowImageUploader(true)}
              disabled={!isConnected}
              className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 
                disabled:text-gray-300 disabled:cursor-not-allowed
                transition-colors"
              aria-label="上傳圖片"
            >
              <ImageIcon size={20} />
            </button>

            {/* 輸入框 */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="輸入訊息..."
              disabled={!isConnected || isSending}
              className="flex-1 px-4 py-2 border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
            />

            {/* 發送按鈕 */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected || isSending}
              className="bg-primary-500 text-white p-2
                hover:bg-primary-600 active:bg-primary-700
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors duration-200
                flex items-center justify-center
                w-10 h-10
              "
              aria-label="發送訊息"
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          {/* 連線狀態提示 */}
          <p className="text-xs text-gray-400 mt-2 text-center">
            {!isConnected ? (
              <span className="text-red-500">WebSocket 未連線</span>
            ) : (
              '按 Enter 發送訊息'
            )}
          </p>
        </div>
      </div>

      {/* ============ 圖片上傳器 ============ */}
      {showImageUploader && (
        <ImageUploader
          roomId={room?.id}
          onClose={() => setShowImageUploader(false)}
          onImageUploaded={handleImageUploaded}
        />
      )}

      {/* ============ 歷史記錄列表 ============ */}
      <ChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectRoom={handleSelectHistoryRoom}
      />

      {/* ============ 歷史訊息檢視 ============ */}
      <HistoryMessageView
        isOpen={showHistoryView}
        onClose={() => {
          setShowHistoryView(false)
          setSelectedHistoryRoom(null)
        }}
        roomData={selectedHistoryRoom}
      />

      {/* ============ 🆕 客服評分彈窗 ============ */}
      <RatingModal
        isOpen={showRatingModal}
        roomId={ratingRoomId}
        agentName={ratingAgentName}
        onSubmit={handleSubmitRating}
        onClose={() => {
          setShowRatingModal(false)
          setRatingRoomId(null)
          setRatingAgentName('客服人員')
        }}
      />
    </>
  )
}
