/**
 * 客服聊天室列表元件
 * 路徑: components/chatroom/admin_chat/AdminChatList.jsx
 * 版本: v1.0.0
 *
 * 功能說明:
 * - 顯示所有聊天室列表
 * - 支援狀態篩選（全部/等待中/進行中/已關閉）
 * - 優先級標記（低/中/高）
 * - 未讀訊息數量顯示
 * - 等待時間顯示
 * - 客服接單/關閉功能
 *
 * 設計規範:
 * - 方形設計（無圓角）
 * - Primary 配色（金棕色）
 * - 響應式設計
 */

'use client'

import { MessageCircle, Clock, User, AlertCircle } from 'lucide-react'

export default function AdminChatList({
  rooms = [],
  selectedRoom,
  statusFilter,
  isLoading,
  onSelectRoom,
  onAcceptRoom,
  onCloseRoom,
  onFilterChange,
}) {
  // ============================================
  // 工具函式：格式化時間
  // ============================================
  const formatWaitTime = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return '剛剛'
    if (minutes < 60) return `${minutes}分鐘`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小時`
    return `${Math.floor(hours / 24)}天`
  }

  // ============================================
  // 工具函式：優先級樣式
  // ============================================
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  // ============================================
  // 工具函式：狀態文字
  // ============================================
  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return '等待中'
      case 'active':
        return '進行中'
      case 'closed':
        return '已關閉'
      default:
        return status
    }
  }

  // ============================================
  // 渲染：篩選按鈕（優化過渡動畫）
  // ============================================
  const renderFilterButtons = () => (
    <div className="flex gap-2 mb-4">
      {[
        { value: 'all', label: '全部' },
        { value: 'waiting', label: '等待中' },
        { value: 'active', label: '進行中' },
        { value: 'closed', label: '已關閉' },
      ].map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`
            flex-1 px-3 py-2 text-sm font-medium 
            transition-all duration-200 ease-in-out
            border-2 border-transparent
            ${
              statusFilter === filter.value
                ? 'bg-primary-500 text-white border-primary-600 shadow-sm'
                : 'bg-white text-secondary-600 hover:bg-secondary-200 hover:border-secondary-300'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )

  // ============================================
  // 渲染：聊天室列表（統一結構，避免載入時變形）
  // ============================================
  return (
    <div className="bg-white shadow-sm">
      {/* 標題 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-secondary-900">聊天室列表</h2>
      </div>

      {/* 篩選按鈕 */}
      <div className="p-4 border-b border-gray-200">
        {renderFilterButtons()}
      </div>

      {/* 列表內容（固定最小高度，避免閃動）*/}
      <div className="overflow-y-auto max-h-[calc(100vh-300px)] min-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center min-h-[400px] flex items-center justify-center">
            <p className="text-gray-500">載入中</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">目前沒有聊天室</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`
                p-4 border-b border-gray-200 cursor-pointer 
                transition-all duration-200 ease-in-out
                ${
                  selectedRoom?.id === room.id
                    ? 'bg-primary-500 bg-opacity-10 border-l-4 border-l-primary-500'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }
              `}
            >
              {/* 使用者資訊 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-600" />
                  <span className="font-medium text-secondary-900">
                    {room.user_name || '訪客'}
                  </span>
                </div>

                {/* 優先級標籤 */}
                <span
                  className={`
                    px-2 py-0.5 text-xs border
                    ${getPriorityColor(room.priority)}
                  `}
                >
                  {room.priority === 'high'
                    ? '高'
                    : room.priority === 'medium'
                      ? '中'
                      : '低'}
                </span>
              </div>

              {/* 主題 */}
              <p className="text-sm text-gray-700 mb-2 line-clamp-1">
                {room.subject || '一般諮詢'}
              </p>

              {/* 狀態與時間 */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  {/* 狀態 */}
                  <span
                    className={`
                      ${room.status === 'waiting' ? 'text-orange-600 font-medium' : ''}
                      ${room.status === 'active' ? 'text-green-600 font-medium' : ''}
                      ${room.status === 'closed' ? 'text-gray-500' : ''}
                    `}
                  >
                    {getStatusText(room.status)}
                  </span>

                  {/* 等待時間（僅等待中顯示）*/}
                  {room.status === 'waiting' && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Clock size={12} />
                      {formatWaitTime(room.created_at)}
                    </span>
                  )}
                </div>

                {/* 未讀訊息數 */}
                {room.unread_count > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold">
                    {room.unread_count}
                  </span>
                )}
              </div>

              {/* AI 轉接標記 */}
              {room.source === 'ai_transfer' && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                  <AlertCircle size={12} />
                  <span>AI 轉接</span>
                </div>
              )}

              {/* 快速操作按鈕（等待中）*/}
              {room.status === 'waiting' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAcceptRoom(room.id)
                    }}
                    className="
                      flex-1 px-3 py-1.5 
                      bg-primary-500 text-white text-sm 
                      hover:bg-primary-600 hover:shadow-sm
                      transition-all duration-200
                    "
                  >
                    接單
                  </button>
                </div>
              )}

              {/* 快速操作按鈕（進行中）*/}
              {room.status === 'active' && room.agent_id && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCloseRoom(room.id)
                    }}
                    className="
                      flex-1 px-3 py-1.5 
                      bg-gray-500 text-white text-sm 
                      hover:bg-gray-600 hover:shadow-sm
                      transition-all duration-200
                    "
                  >
                    關閉
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
