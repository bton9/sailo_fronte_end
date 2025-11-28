/**
 * Socket Context - WebSocket 連線管理
 * 路徑: sailo/contexts/SocketContext.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 管理 Socket.IO 客戶端連線
 * - 整合 AuthContext,使用 JWT Token 認證
 * - 提供全域 Socket 實例
 * - 自動重連機制
 * - 連線狀態管理
 *
 * 使用方式:
 * import { useSocket } from '@/contexts/SocketContext'
 *
 * const { socket, isConnected, connect, disconnect } = useSocket()
 *
 * 注意事項:
 * - 不使用 localStorage
 * - 使用 authV2 的 JWT Token
 * - 連線需在登入後進行
 */

'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

// WebSocket 伺服器 URL
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'

// ============================================
// Context 定義
// ============================================
// Context 定義
// ============================================
const SocketContext = createContext(null)

/**
 * Socket Provider - 提供 WebSocket 連線管理
 */
export function SocketProvider({ children }) {
  const { isAuthenticated, getAccessToken } = useAuth() // 從 AuthContext 取得認證狀態
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const socketRef = useRef(null) // 用於保存 Socket 實例

  /**
   * 建立 Socket 連線
   */
  const connect = useCallback(async () => {
    // 若已連線或正在連線,不重複連線
    if (socketRef.current?.connected || isConnecting) {
      console.log('⚠️ Socket 已連線或正在連線中')
      return
    }

    // 必須在登入狀態下才能連線
    if (!isAuthenticated) {
      console.log('⚠️ 使用者未登入,無法建立 Socket 連線')
      return
    }

    try {
      setIsConnecting(true)

      console.log('🔌 正在建立 Socket 連線...')

      // ============================================
      // 建立 Socket.IO 客戶端連線
      // Token 從 httpOnly Cookie 中自動傳送
      // ============================================
      const newSocket = io(SOCKET_URL, {
        withCredentials: true, // 🔑 重要: 允許傳送 Cookie
        transports: ['websocket', 'polling'], // 優先使用 WebSocket,備援使用 Polling
        reconnection: true, // 自動重連
        reconnectionAttempts: 5, // 重連嘗試次數
        reconnectionDelay: 1000, // 重連延遲 (ms)
        reconnectionDelayMax: 5000, // 最大重連延遲 (ms)
      })

      // ============================================
      // Socket 事件監聽
      // ============================================

      // 連線成功
      newSocket.on('connect', () => {
        console.log(' Socket 連線成功:', newSocket.id)
        setIsConnected(true)
        setIsConnecting(false)
      })

      // 連線失敗
      newSocket.on('connect_error', (error) => {
        console.error(' Socket 連線失敗:', error.message)
        setIsConnected(false)
        setIsConnecting(false)
      })

      // 斷線
      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket 斷線:', reason)
        setIsConnected(false)

        // 若是因為 Token 過期斷線,嘗試重新取得 Token 並重連
        if (reason === 'io server disconnect') {
          console.log('⚠️ 伺服器主動斷線 (可能是 Token 過期),嘗試重新連線...')
          setTimeout(() => {
            if (isAuthenticated) {
              connect() // 重新連線
            }
          }, 2000)
        }
      })

      // 認證錯誤
      newSocket.on('error', (error) => {
        console.error(' Socket 錯誤:', error)
      })

      // 收到伺服器確認連線訊息
      newSocket.on('connected', (data) => {
        console.log(' 收到伺服器連線確認:', data)
      })

      // ============================================
      // 儲存 Socket 實例
      // ============================================
      socketRef.current = newSocket
      setSocket(newSocket)
    } catch (error) {
      console.error(' 建立 Socket 連線時發生錯誤:', error)
      setIsConnecting(false)
    }
  }, [isAuthenticated]) // 🔑 移除 getAccessToken 和 isConnecting 依賴

  /**
   * 斷開 Socket 連線
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 正在斷開 Socket 連線...')
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  // ============================================
  // 自動連線/斷線管理
  // ============================================
  useEffect(() => {
    // 當使用者登入時,自動建立 Socket 連線
    if (isAuthenticated && !socketRef.current) {
      console.log('👤 使用者已登入,自動建立 Socket 連線')
      connect()
    }

    // 當使用者登出時,自動斷開 Socket 連線
    if (!isAuthenticated && socketRef.current) {
      console.log('👤 使用者已登出,自動斷開 Socket 連線')
      disconnect()
    }
  }, [isAuthenticated]) // 🔑 只依賴 isAuthenticated

  // ============================================
  // 元件卸載時清理
  // ============================================
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('🧹 元件卸載,斷開 Socket 連線')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, []) // 🔑 只在元件卸載時執行

  // ============================================
  // Context Value
  // ============================================
  const value = {
    socket,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  }

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

/**
 * useSocket Hook - 取得 Socket Context
 *
 * @returns {object} { socket, isConnected, isConnecting, connect, disconnect }
 */
export function useSocket() {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocket 必須在 SocketProvider 內使用')
  }

  return context
}
