'use client'

import React from 'react'
import { FiHeart, FiMapPin, FiCalendar, FiUser } from 'react-icons/fi'

/**
 * 收藏行程列表組件 - 無需 date-fns
 */
export default function FavoritesList({
  favorites,
  onTripClick,
  onRemoveFavorite,
}) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FiHeart className="w-16 h-16 mb-4" />
        <p className="text-lg">還沒有收藏任何行程</p>
        <p className="text-sm mt-2">瀏覽公開行程並收藏喜歡的旅程</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {favorites.map((favorite) => (
        <FavoriteCard
          key={favorite.favorite_id}
          favorite={favorite}
          onTripClick={onTripClick}
          onRemoveFavorite={onRemoveFavorite}
        />
      ))}
    </div>
  )
}

/**
 * 收藏卡片組件
 */
function FavoriteCard({ favorite, onTripClick, onRemoveFavorite }) {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      {/* 封面圖片 */}
      <div
        className="relative h-48 bg-gradient-to-br from-pink-400 to-purple-500"
        onClick={() => onTripClick(favorite.trip_id)}
      >
        {favorite.cover_image_url ? (
          <img
            src={favorite.cover_image_url}
            alt={favorite.trip_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FiMapPin className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* 收藏按鈕 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('確定要取消收藏這個行程嗎?')) {
              onRemoveFavorite(favorite.trip_id)
            }
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
        >
          <FiHeart className="w-5 h-5 text-red-500 fill-current" />
        </button>
      </div>

      {/* 行程資訊 */}
      <div className="p-5">
        <h3
          className="text-xl font-bold text-gray-800 mb-2 truncate hover:text-blue-600"
          onClick={() => onTripClick(favorite.trip_id)}
        >
          {favorite.trip_name}
        </h3>

        {/* 建立者 */}
        {favorite.creator_name && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <FiUser className="w-4 h-4" />
            <span className="text-sm">by {favorite.creator_name}</span>
          </div>
        )}

        {/* 日期 */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <FiCalendar className="w-4 h-4" />
          <span className="text-sm">
            {formatDate(favorite.start_date)} - {formatDate(favorite.end_date)}
          </span>
        </div>

        {/* 摘要 */}
        {favorite.summary_text && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-3">
            {favorite.summary_text}
          </p>
        )}

        {/* 查看按鈕 */}
        <button
          onClick={() => onTripClick(favorite.trip_id)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          查看行程
        </button>
      </div>
    </div>
  )
}
