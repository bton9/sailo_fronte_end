'use client'

import React from 'react'
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiTrash2,
  FiCopy,
  FiEdit,
} from 'react-icons/fi'

/**
 * 我的行程列表組件 - 無需 date-fns
 */
export default function MyTripsList({
  trips,
  onTripClick,
  onDeleteTrip,
  onCopyTrip,
}) {
  if (!trips || trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FiMapPin className="w-16 h-16 mb-4" />
        <p className="text-lg">還沒有建立任何行程</p>
        <p className="text-sm mt-2">點擊「建立新行程」開始規劃你的旅程</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {trips.map((trip) => (
        <TripCard
          key={trip.trip_id}
          trip={trip}
          onTripClick={onTripClick}
          onDeleteTrip={onDeleteTrip}
          onCopyTrip={onCopyTrip}
        />
      ))}
    </div>
  )
}

/**
 * 行程卡片組件
 */
function TripCard({ trip, onTripClick, onDeleteTrip, onCopyTrip }) {
  // 使用原生 JavaScript 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    } catch (error) {
      return dateString
    }
  }

  const getDuration = () => {
    const days = trip.total_days || 1
    return `${days} 天`
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      {/* 封面圖片 */}
      <div
        className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500"
        onClick={() => onTripClick(trip.trip_id)}
      >
        {trip.cover_image_url ? (
          <img
            src={trip.cover_image_url}
            alt={trip.trip_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FiMapPin className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* 公開/私人標籤 */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              trip.is_public
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-white bg-opacity-70'
            }`}
          >
            {trip.is_public ? '公開' : '私人'}
          </span>
        </div>
      </div>

      {/* 行程資訊 */}
      <div className="p-5">
        <h3
          className="text-xl font-bold text-gray-800 mb-2 truncate hover:text-blue-600"
          onClick={() => onTripClick(trip.trip_id)}
        >
          {trip.trip_name}
        </h3>

        {/* 地點 */}
        {trip.location_name && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <FiMapPin className="w-4 h-4" />
            <span className="text-sm">{trip.location_name}</span>
          </div>
        )}

        {/* 日期 */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <FiCalendar className="w-4 h-4" />
          <span className="text-sm">
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </span>
        </div>

        {/* 天數與景點數 */}
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            <span className="text-sm">{getDuration()}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiMapPin className="w-4 h-4" />
            <span className="text-sm">{trip.total_items || 0} 個景點</span>
          </div>
        </div>

        {/* 摘要 */}
        {trip.summary_text && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {trip.summary_text}
          </p>
        )}

        {/* 操作按鈕 */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTripClick(trip.trip_id)
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <FiEdit className="w-4 h-4" />
            編輯
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopyTrip(trip.trip_id)
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="複製行程"
          >
            <FiCopy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('確定要刪除這個行程嗎?')) {
                onDeleteTrip(trip.trip_id)
              }
            }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="刪除行程"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
