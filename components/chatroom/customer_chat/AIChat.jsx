/**
 * AIChat - AI 客服聊天元件 (Ollama 整合版)
 * 路徑: sailo/components/chatroom/customer_chat/AIChat.jsx
 * 版本: v2.0.0
 *
 * 功能說明:
 * - 整合本地 Ollama AI (llama3.1:8b)
 * - 即時 AI 對話
 * - 智慧轉接人工客服
 * - 對話歷史保存
 * - 快速回覆功能
 *
 * 技術特色:
 * - 依據 CustomerChat 架構設計
 * - 方形設計 (無圓角)
 * - 主題色: #a48c62
 * - 使用 authV2 (httpOnly Cookie)
 * - 不使用 localStorage
 *
 * AI 模型:
 * - 模型: llama3.1:8b
 * - 後端: Ollama (本地運行)
 * - 上下文記憶: 10 輪對話
 *
 * 使用方式:
 * import AIChat from '@/components/chatroom/customer_chat/AIChat'
 *
 * <AIChat
 *   isOpen={isAIChatOpen}
 *   onClose={() => setIsAIChatOpen(false)}
 *   onTransferToHuman={(csRoomId) => {...}}
 * />
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotify } from '@/contexts/NotificationContext'
import { Bot, ArrowRight, X, Send, Loader2, Sparkles } from 'lucide-react'

// ============================================
// API 配置
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AIChat({ isOpen = false, onClose, onTransferToHuman }) {
  // ============================================
  // Hooks & Refs
  // ============================================
  const { user, isAuthenticated } = useAuth()
  const notify = useNotify()
  const messagesEndRef = useRef(null)

  // ============================================
  // 狀態管理
  // ============================================
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTransferPrompt, setShowTransferPrompt] = useState(false)

  // ============================================
  // 快速回覆按鈕
  // ============================================
  const quickReplies = [
    { id: 1, text: '訂單查詢', icon: '📦' },
    { id: 2, text: '退換貨政策', icon: '🔄' },
    { id: 3, text: '付款方式', icon: '💳' },
    { id: 4, text: '行程規劃', icon: '🗺️' },
  ]

  // ============================================
  // 自動滾動到底部
  // ============================================
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ============================================
  // 建立或取得 AI 聊天室
  // ============================================
  const createOrGetRoom = useCallback(async () => {
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
        setRoom(data.room)

        // 若是新建立的聊天室,顯示歡迎訊息
        if (data.isNew && data.welcomeMessage) {
          setMessages([
            {
              id: 'welcome',
              type: 'ai',
              message: data.welcomeMessage,
              timestamp: new Date(),
            },
          ])
        } else {
          // 載入歷史訊息
          await loadMessages(data.room.id)
        }
      }
    } catch (error) {
      console.error(' 建立 AI 聊天室失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // ============================================
  // 載入歷史訊息
  // ============================================
  const loadMessages = async (roomId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/ai-chat/rooms/${roomId}/messages`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        // 轉換訊息格式
        const formattedMessages = data.messages.flatMap((msg) => [
          {
            id: `user-${msg.id}`,
            type: 'user',
            message: msg.user_message,
            timestamp: new Date(msg.created_at),
          },
          {
            id: `ai-${msg.id}`,
            type: 'ai',
            message: msg.ai_response,
            timestamp: new Date(msg.created_at),
            shouldTransfer: msg.is_transfer_request,
          },
        ])

        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error(' 載入訊息失敗:', error)
    }
  }

  // ============================================
  // 開啟聊天室時自動建立
  // ============================================
  useEffect(() => {
    if (isOpen && isAuthenticated && !room) {
      createOrGetRoom()
    }
  }, [isOpen, isAuthenticated, room, createOrGetRoom])

  // ============================================
  // 發送訊息給 AI
  // ============================================
  const handleSendMessage = async (e) => {
    e?.preventDefault()

    if (!inputMessage.trim() || isSending || !room) return

    const userMessageText = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    // 立即顯示使用者訊息
    const userMsg = {
      id: `user-${Date.now()}`,
      type: 'user',
      message: userMessageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])

    try {
      const response = await fetch(`${API_URL}/api/ai-chat/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          message: userMessageText,
        }),
      })

      const data = await response.json()

      console.log('🔍 [AIChat] 收到 API 回應:', data)

      if (data.success) {
        // 顯示 AI 回應
        const aiMsg = {
          id: `ai-${data.message.id}`,
          type: 'ai',
          message: data.message.aiResponse,
          timestamp: new Date(data.message.createdAt),
          shouldTransfer: data.message.shouldTransfer,
        }

        setMessages((prev) => [...prev, aiMsg])

        // 🆕 處理特殊指令：導航到密碼修改頁面
        console.log('🔍 [AIChat] 檢查特殊指令:', {
          hasSpecialAction: !!data.message.specialAction,
          specialAction: data.message.specialAction,
          navigationPath: data.message.navigationPath,
        })

        if (data.message.specialAction === 'NAVIGATE_CHANGE_PASSWORD') {
          console.log(' [AIChat] 偵測到密碼修改指令，準備跳轉...')

          // 延遲 1.5 秒後跳轉，讓使用者看到 AI 的回應
          setTimeout(() => {
            const targetPath =
              data.message.navigationPath || '/site/membercenter?tab=password'
            console.log('🚀 [AIChat] 開始跳轉到:', targetPath)
            window.location.href = targetPath
          }, 1500)
        }

        // 若 AI 建議轉接,顯示轉接提示
        if (data.message.shouldTransfer) {
          setShowTransferPrompt(true)
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error(' 發送訊息失敗:', error)

      // 顯示錯誤訊息
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: 'system',
          message: '抱歉,訊息發送失敗。請稍後再試或轉接真人客服。',
          timestamp: new Date(),
        },
      ])

      setShowTransferPrompt(true)
    } finally {
      setIsSending(false)
    }
  }

  // ============================================
  // 快速回覆
  // ============================================
  const handleQuickReply = (reply) => {
    setInputMessage(reply.text)
    // 自動聚焦到輸入框
    document.querySelector('#ai-chat-input')?.focus()
  }

  // ============================================
  // 轉接人工客服
  // ============================================
  const handleTransferToHuman = async () => {
    if (!room) return

    try {
      setIsSending(true)

      const response = await fetch(`${API_URL}/api/ai-chat/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id }),
      })

      const data = await response.json()

      if (data.success) {
        // 通知父元件轉接成功
        if (onTransferToHuman) {
          onTransferToHuman(data.customerServiceRoom.id)
        }

        // 關閉 AI 聊天室
        onClose()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error(' 轉接失敗:', error)
      notify('轉接失敗,請稍後再試', 'error')
    } finally {
      setIsSending(false)
    }
  }

  // ============================================
  // 渲染: AI 聊天介面
  // ============================================
  // ============================================
  // 渲染: AI 聊天介面
  // ============================================
  return (
    <div
      className={`
        fixed bottom-0 right-0 z-50
        w-full md:w-96
        bg-white shadow-2xl
        transition-all duration-300 ease-in-out
        ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }
        md:${isOpen ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-full translate-y-0 opacity-0 pointer-events-none'}
        flex flex-col
        h-2/3 md:h-[600px]
      `}
    >
      {/* 標題列 */}
      <div className="flex items-center justify-between p-4 bg-[#a48c62] text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot size={24} />
            <Sparkles
              size={12}
              className="absolute -top-1 -right-1 text-yellow-300"
            />
          </div>
          <div>
            <h3 className="font-semibold">AI 智能助手</h3>
            <span className="text-xs opacity-90">Powered by Ollama</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 p-2 transition-colors"
          aria-label="關閉"
        >
          <X size={20} />
        </button>
      </div>

      {/* 載入狀態 */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-[#a48c62]" size={32} />
          <span className="ml-3 text-gray-600">載入中...</span>
        </div>
      )}

      {/* 訊息列表 */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => {
            // 系統訊息
            if (msg.type === 'system') {
              return (
                <div
                  key={msg.id}
                  className="flex flex-col items-center gap-2 my-4"
                >
                  <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1">
                    {msg.message}
                  </span>
                </div>
              )
            }

            // 使用者訊息
            if (msg.type === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[75%]">
                    <div className="bg-[#a48c62] text-white px-4 py-2.5">
                      <p className="whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              )
            }

            // AI 訊息
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[75%]">
                  <div className="flex items-start gap-2">
                    <Bot
                      size={20}
                      className="text-[#a48c62] mt-1 flex-shrink-0"
                    />
                    <div>
                      <div className="bg-white border border-gray-200 px-4 py-2.5 shadow-sm">
                        <p className="whitespace-pre-wrap break-words text-gray-800">
                          {msg.message}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 若 AI 建議轉接,顯示轉接按鈕 */}
                  {msg.shouldTransfer && showTransferPrompt && (
                    <div className="mt-2 ml-7">
                      <button
                        onClick={handleTransferToHuman}
                        disabled={isSending}
                        className="flex items-center gap-2 px-4 py-2 bg-[#a48c62] text-white hover:bg-[#8a7550] transition-colors disabled:opacity-50"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>轉接中...</span>
                          </>
                        ) : (
                          <>
                            <span>轉接真人客服</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* 載入動畫 (發送中) */}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 shadow-sm">
                <Bot size={18} className="text-[#a48c62]" />
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-[#a48c62] rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#a48c62] rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#a48c62] rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 快速回覆 */}
      {!isLoading && messages.length > 0 && (
        <div className="p-3 bg-gray-100 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">快速選項:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply)}
                disabled={isSending}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span className="mr-1">{reply.icon}</span>
                {reply.text}
              </button>
            ))}
            <button
              onClick={() => setShowTransferPrompt(true)}
              disabled={isSending}
              className="px-3 py-1.5 text-sm bg-[#a48c62] text-white hover:bg-[#8a7550] transition-colors disabled:opacity-50"
            >
              轉真人客服
            </button>
          </div>
        </div>
      )}

      {/* 輸入框 */}
      {!isLoading && (
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-gray-200"
        >
          <div className="flex gap-2">
            <input
              id="ai-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="輸入您的問題..."
              disabled={isSending || !room}
              className="flex-1 px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#a48c62] focus:border-transparent disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending || !room}
              className="px-5 py-2.5 bg-[#a48c62] text-white hover:bg-[#8a7550] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
