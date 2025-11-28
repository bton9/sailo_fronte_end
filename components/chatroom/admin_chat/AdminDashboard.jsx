/**
 * 客服統計儀表板元件
 * 路徑: components/chatroom/admin_chat/AdminDashboard.jsx
 * 版本: v2.0.0
 *
 * 功能說明:
 * - 顯示客服即時統計資訊
 * - 等待中數量（待接單）
 * - 進行中數量（處理中）
 * - 今日已關閉數量（完成數）
 * - 平均回應時間（首次回覆速度）
 * - 支援自動刷新（每30秒）
 * - 即時 WebSocket 更新
 *
 * 設計規範:
 * - 方形設計（無圓角）
 * - Secondary 配色（深藍灰色）
 * - 響應式網格布局（1/2/4 欄）
 *
 * Props:
 * @param {Object} stats - 統計資料物件
 * @param {number} stats.waiting - 等待中數量
 * @param {number} stats.active - 進行中數量
 * @param {number} stats.closed_today - 今日已關閉數量
 * @param {number} stats.avg_response_time - 平均回應時間（秒）
 * @param {Function} onRefresh - 刷新統計資料的回調函式
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'

export default function AdminDashboard({ stats, onRefresh }) {
  // ============================================
  // 狀態管理
  // ============================================
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  // ============================================
  // 自動刷新（每 30 秒）
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh && !isRefreshing) {
        handleRefresh()
      }
    }, 30000) // 30 秒

    return () => clearInterval(interval)
  }, [onRefresh, isRefreshing])

  // ============================================
  // 手動刷新處理
  // ============================================
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error(' 刷新統計資訊失敗:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // ============================================
  // 工具函式：格式化時間
  // ============================================
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '無資料'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`
    }
    if (minutes > 0) {
      return `${minutes}分鐘`
    }
    return `${remainingSeconds}秒`
  }

  // ============================================
  // 預設統計資料
  // ============================================
  const defaultStats = {
    waiting: 0,
    active: 0,
    closed_today: 0,
    avg_response_time: 0,
  }

  const currentStats = stats || defaultStats

  // ============================================
  // 統計卡片資料
  // ============================================
  const cards = [
    {
      title: '等待中',
      value: currentStats.waiting,
      icon: MessageCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: '待處理的聊天室',
      trend: currentStats.waiting > 0 ? 'high' : 'normal',
    },
    {
      title: '進行中',
      value: currentStats.active,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: '客服處理中',
      trend: 'normal',
    },
    {
      title: '今日已關閉',
      value: currentStats.closed_today,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '本日完成數',
      trend: 'normal',
    },
    {
      title: '平均回應時間',
      value: formatDuration(currentStats.avg_response_time),
      icon: Clock,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      description: '首次回應時間',
      isTime: true,
      trend: 'normal',
    },
  ]

  // ============================================
  // 主渲染
  // ============================================
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      {/* 標題與刷新按鈕 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">
            客服儀表板
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            最後更新: {lastUpdateTime.toLocaleTimeString('zh-TW')}
          </p>
        </div>

        {/* 手動刷新按鈕（僅圖示旋轉，文字不變）*/}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 
            bg-secondary-600 text-white 
            hover:bg-secondary-700 
            disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors duration-200
            ${isRefreshing ? 'opacity-70' : ''}
          `}
          title="手動刷新統計資料"
        >
          <RefreshCw
            size={16}
            className={`transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="text-sm">刷新</span>
        </button>
      </div>

      {/* 統計卡片網格（優化過渡效果）*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`
              bg-white border-2 p-4 
              hover:shadow-md hover:border-opacity-80
              transition-all duration-300 ease-in-out
              ${card.borderColor}
              ${card.trend === 'high' ? 'ring-2 ring-yellow-300 animate-pulse' : ''}
            `}
          >
            {/* 圖示與標題 */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              {/* 趨勢指標 */}
              {card.trend === 'high' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1">
                  需注意
                </span>
              )}
            </div>

            {/* 數值 */}
            <div className="mb-1">
              <p
                className={`
                  ${card.isTime ? 'text-2xl' : 'text-3xl'} 
                  font-bold text-secondary-900
                  ${card.trend === 'high' ? 'text-yellow-600' : ''}
                `}
              >
                {card.value}
              </p>
            </div>

            {/* 標題與描述 */}
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {card.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 提示資訊 */}
      <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
        <span>💡 自動刷新間隔: 30 秒</span>
        <span>📊 資料來源: MySQL 即時查詢</span>
        {currentStats.waiting > 5 && (
          <span className="text-yellow-600 font-semibold">
            等待中聊天室較多，請注意處理
          </span>
        )}
      </div>

      {/* AI 客服預留區域（未來擴充）*/}
      {/* 
      未來可擴充功能：
      - AI 自動回覆數量統計
      - AI 轉接人工次數
      - AI 問題解決率
      - AI 平均回應速度
      - AI 滿意度評分
      */}
    </div>
  )
}
