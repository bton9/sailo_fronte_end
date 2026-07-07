/**
 * 客服管理後台頁面
 * 路徑: app/admin/customer-service/page.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 客服人員接單介面
 * - 即時聊天室管理
 * - 等待中/進行中/已關閉聊天室列表
 * - 統計資訊儀表板
 * - AI 客服轉接預留
 * - WebSocket 即時更新
 *
 * 權限要求:
 * - 需要 admin 權限
 * - 使用 AuthGuard + requireRole 驗證
 *
 * 架構設計:
 * - 左側：聊天室列表（可篩選狀態）
 * - 右側：聊天視窗 + 統計資訊
 * - 響應式設計（手機版上下排列）
 *
 * 使用方式:
 * - 訪問: /admin/customer-service
 * - 僅限 admin 使用者
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { useNotify } from '@/contexts/NotificationContext'
import { MessageCircle } from 'lucide-react'
import AuthGuard from '@/components/auth/AuthGuard'
import SideMenu from '@/components/sidebar'
import ConfirmModal from '@/components/confirmModal'
import AdminChatList from '@/components/chatroom/admin_chat/AdminChatList'
import AdminChatRoom from '@/components/chatroom/admin_chat/AdminChatRoom'
import AdminDashboard from '@/components/chatroom/admin_chat/AdminDashboard'

export default function CustomerServicePage() {
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected } = useSocket()
  const notify = useNotify()

  // ============ State 管理 ============
  const [selectedRoom, setSelectedRoom] = useState(null) // 當前選中的聊天室
  const [rooms, setRooms] = useState([]) // 聊天室列表
  const [statusFilter, setStatusFilter] = useState('all') // 狀態篩選：all, waiting, active, closed
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    waiting: 0,
    active: 0,
    closed_today: 0,
    avg_response_time: 0,
  })
  const [agentRating, setAgentRating] = useState({
    avg_rating: 0,
    total_ratings: 0,
  }) // 🆕 客服評分統計
  //  新增：ConfirmModal 狀態
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    roomId: null,
  })

  // ============================================
  // 權限檢查：必須是 admin
  // ============================================
  useEffect(() => {
    if (isAuthenticated && user?.access !== 'admin') {
      notify('您沒有權限訪問此頁面', 'error')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
  }, [isAuthenticated, user])

  // ============================================
  // 載入聊天室列表
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) return

    loadRooms()
    loadStats() // 🆕 載入統計資訊
    loadAgentRating() // 🆕 載入客服評分
  }, [isAuthenticated, statusFilter])

  const loadRooms = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/admin/rooms?status=${statusFilter}`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error(' 載入聊天室失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // 🆕 載入統計資訊
  // ============================================
  const loadStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/admin/stats`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        console.log(' 統計資訊已更新:', data.stats)
      }
    } catch (error) {
      console.error(' 載入統計資訊失敗:', error)
    }
  }

  // ============================================
  // 🆕 載入客服評分統計
  // ============================================
  const loadAgentRating = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/admin/agent-rating/${user.id}`,
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        setAgentRating(data.rating)
        console.log(' 客服評分已更新:', data.rating)
      }
    } catch (error) {
      console.error(' 載入客服評分失敗:', error)
    }
  }

  // ============================================
  // WebSocket: 監聽新聊天室
  // ============================================
  useEffect(() => {
    if (!socket) return

    // 新聊天室建立
    socket.on('new_room_created', (data) => {
      console.log('🆕 新聊天室:', data)
      loadRooms() // 重新載入列表
      loadStats() // 🆕 更新統計資訊
    })

    // 聊天室狀態更新
    socket.on('room_status_updated', (data) => {
      console.log('🔄 聊天室狀態更新:', data)
      loadRooms()
      loadStats() // 🆕 更新統計資訊
    })

    return () => {
      socket.off('new_room_created')
      socket.off('room_status_updated')
    }
  }, [socket])

  // ============================================
  // 處理接單
  // ============================================
  const handleAcceptRoom = async (roomId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/admin/rooms/${roomId}/accept`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        console.log(' 接單成功:', roomId)
        loadRooms()
        loadStats() // 🆕 更新統計資訊
        setSelectedRoom(data.room)
      } else {
        notify(data.message || '接單失敗', 'error')
      }
    } catch (error) {
      console.error(' 接單失敗:', error)
      notify('接單失敗，請稍後再試', 'error')
    }
  }

  // ============================================
  // 處理關閉聊天室 - 顯示確認對話框
  // ============================================
  const handleCloseRoom = (roomId) => {
    setConfirmModal({
      isOpen: true,
      roomId: roomId,
    })
  }

  // 確認關閉聊天室
  const confirmCloseRoom = async () => {
    const roomId = confirmModal.roomId

    // 關閉 Modal
    setConfirmModal({ isOpen: false, roomId: null })

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/admin/rooms/${roomId}/close`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (data.success) {
        console.log(' 關閉成功:', roomId)
        loadRooms()
        loadStats() // 🆕 更新統計資訊
        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null)
        }
      } else {
        notify(data.message || '關閉失敗', 'error')
      }
    } catch (error) {
      console.error(' 關閉聊天室失敗:', error)
      notify('關閉失敗，請稍後再試', 'error')
    }
  }

  // ============================================
  // 渲染：權限檢查
  // ============================================
  if (!isAuthenticated || user?.access !== 'admin') {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-secondary-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              權限不足
            </h1>
            <p className="text-secondary-600 mb-6">此頁面僅限管理員訪問</p>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-6 py-2 bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              返回首頁
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // ============================================
  // 渲染：客服管理介面
  // ============================================
  return (
    <AuthGuard>
      <div className="min-h-screen bg-secondary-200">
        <div className="ml-[70px] md:ml-[100px] p-4">
          {/* 頁面標題 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              客服管理中心
            </h1>
            <p className="text-secondary-600 flex items-center gap-4">
              <span>
                {isConnected ? (
                  <span className="text-green-600">● 線上</span>
                ) : (
                  <span className="text-red-600">● 離線</span>
                )}
              </span>
              <span>客服人員：{user?.nickname}</span>
              {/* 🆕 滿意度評分顯示 */}
              {agentRating.total_ratings > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold text-yellow-600">
                    {agentRating.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({agentRating.total_ratings} 則評價)
                  </span>
                </span>
              )}
            </p>
          </div>

          {/* 統計儀表板 */}
          <AdminDashboard stats={stats} onRefresh={loadStats} />

          {/* 主要內容區 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* 左側：聊天室列表 */}
            <div className="lg:col-span-1">
              <AdminChatList
                rooms={rooms}
                selectedRoom={selectedRoom}
                statusFilter={statusFilter}
                isLoading={isLoading}
                onSelectRoom={setSelectedRoom}
                onAcceptRoom={handleAcceptRoom}
                onCloseRoom={handleCloseRoom}
                onFilterChange={setStatusFilter}
              />
            </div>

            {/* 右側：聊天室視窗 */}
            <div className="lg:col-span-2">
              {selectedRoom ? (
                <AdminChatRoom
                  room={selectedRoom}
                  onClose={() => setSelectedRoom(null)}
                  onRoomUpdate={loadRooms}
                />
              ) : (
                <div className="bg-white shadow-sm p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <MessageCircle size={64} className="mx-auto opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    請選擇聊天室
                  </h3>
                  <p className="text-gray-500">從左側列表選擇要處理的聊天室</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/*  確認關閉聊天室 Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, roomId: null })}
          onConfirm={confirmCloseRoom}
          title="確認關閉"
          message="確定要關閉此聊天室嗎？"
          confirmText="確定"
          cancelText="取消"
          confirmButtonStyle="bg-point-500 hover:bg-point-400"
        />
      </div>
    </AuthGuard>
  )
}
