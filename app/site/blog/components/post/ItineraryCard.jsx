'use client'

import { useRouter } from 'next/navigation'
import * as FaIcons from 'react-icons/fa6'

/**
 * ItineraryCard - 行程/景點卡片元件（通用）
 * 
 * 用於在文章中顯示關聯的行程或景點資訊
 * 
 * @param {Object} itinerary - 行程資料（當顯示行程時使用）
 * @param {Object} place - 景點資料（當顯示景點時使用）
 * @param {Function} [onClick] - 點擊卡片的回調
 * @param {Function} [onCopy] - 點擊複製/編輯按鈕的回調
 * @param {boolean} [showCopyButton=false] - 是否顯示複製/編輯按鈕
 * @param {number} [currentUserId] - 當前使用者 ID
 * @param {string} [className] - 額外的 CSS class
 */
export default function ItineraryCard({
  itinerary = null,
  place = null,
  onClick,
  onCopy,
  showCopyButton = false,
  currentUserId = null,
  className = '',
}) {
  const router = useRouter()

  // 判斷是行程還是景點
  const isPlace = !!place
  const data = isPlace ? place : itinerary

  // 如果沒有資料，不顯示
  if (!data) return null

  // 判斷是否為作者本人（只有行程才需要）
  const isOwnTrip = !isPlace && currentUserId && itinerary?.user_id && currentUserId === itinerary.user_id

  // 點擊卡片
  const handleCardClick = (e) => {
    if (e.target.closest('.copy-button')) {
      return
    }
    
    if (onClick) {
      onClick(isPlace ? place.place_id : itinerary.trip_id)
    } else if (isPlace) {
      // 景點：開啟 Modal（待實作）
      console.log('🎯 點擊景點卡片:', place.place_id)
    } else {
      // 行程：跳轉編輯
      console.log('🎯 點擊行程卡片:', itinerary.trip_id)
      sessionStorage.setItem('openTripId', itinerary.trip_id)
      router.push('/site/custom')
    }
  }

  // 點擊複製/編輯按鈕
  const handleCopyClick = (e) => {
    e.stopPropagation()
    
    if (onCopy) {
      onCopy(isPlace ? place.place_id : itinerary.trip_id)
    } else if (!isPlace) {
      sessionStorage.setItem('openTripId', itinerary.trip_id)
      router.push('/site/custom')
    }
  }

  // 處理圖片 URL
  const getImageUrl = () => {
    const image = isPlace ? place.cover_image : itinerary.cover_image_url
    if (!image) return null
    if (image.startsWith('http')) return image
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    if (image.startsWith('/uploads/')) return `${API_URL}${image}`
    return `${API_URL}/uploads/${image}`
  }

  const imageUrl = getImageUrl()

  // ==================== 景點卡片 ====================
  if (isPlace) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
        onClick={handleCardClick}
      >
        {/* 頂部標籤 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FaIcons.FaLocationDot />
            <span>關聯景點</span>
          </div>
          {/* 類別標籤 */}
          {place.category && (
            <div className={`flex items-center gap-1 px-3 py-1 ${
              place.category === '景點' ? 'bg-blue-500' :
              place.category === '餐廳' ? 'bg-orange-500' :
              place.category === '住宿' ? 'bg-purple-500' :
              'bg-gray-500'
            } text-white rounded-full text-xs font-semibold`}>
              {place.category === '景點' && <FaIcons.FaLocationDot />}
              {place.category === '餐廳' && <FaIcons.FaUtensils />}
              {place.category === '住宿' && <FaIcons.FaBed />}
              <span>{place.category}</span>
            </div>
          )}
        </div>

        {/* 景點主體 */}
        <div className="flex gap-4">
          {/* 封面圖（如果有） */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt={place.name}
                className="w-24 h-24 object-cover rounded-lg border-2 border-white/50"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* 景點資訊 */}
          <div className="flex-1 min-w-0">
            {/* 景點名稱 */}
            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={place.name}>
              {place.name}
            </h3>

            {/* 詳情 */}
            <div className="flex flex-wrap gap-3 text-sm mb-2">
              {/* 評分 */}
              {place.rating && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <FaIcons.FaStar />
                  {place.rating.toFixed(1)}
                </span>
              )}

              {/* 地點 */}
              {place.location_name && (
                <span className="flex items-center gap-1 text-gray-600">
                  <FaIcons.FaLocationDot />
                  {place.location_name}
                </span>
              )}
            </div>

            {/* 描述（如果有） */}
            {place.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {place.description}
              </p>
            )}
          </div>
        </div>

        {/* 底部提示（如果可點擊） */}
        {onClick && (
          <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-600 flex items-center gap-1">
            <FaIcons.FaArrowRight className="text-xs" />
            點擊查看景點詳情
          </div>
        )}
      </div>
    )
  }

  // ==================== 行程卡片 ====================
  // 處理地點（相容字串和陣列兩種格式）
  let locationArray = []
  if (itinerary.locations) {
    if (Array.isArray(itinerary.locations)) {
      locationArray = itinerary.locations.filter(loc => loc && loc.trim())
    } else if (typeof itinerary.locations === 'string') {
      locationArray = itinerary.locations.split('、').filter(loc => loc && loc.trim())
    }
  }

  return (
    <div
      className={`bg-gradient-to-br bg-primary-500 p-6 rounded-lg text-white shadow-lg hover:shadow-xl transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={handleCardClick}
    >
      {/* 頂部標籤與複製按鈕 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm">
          <FaIcons.FaRoute />
          <span>關聯行程</span>
        </div>
        {showCopyButton && onCopy && (
          <button
            onClick={handleCopyClick}
            className="copy-button flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-all"
            title={isOwnTrip ? "編輯行程" : "複製行程到我的行程"}
          >
            {isOwnTrip ? (
              <>
                <FaIcons.FaPen />
                <span>編輯</span>
              </>
            ) : (
              <>
                <FaIcons.FaCopy />
                <span>複製行程</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 行程主體 */}
      <div className="flex gap-4">
        {/* 封面圖（如果有） */}
        {imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={imageUrl}
              alt={itinerary.trip_name}
              className="w-24 h-24 object-cover rounded-lg border-2 border-white/30"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* 行程資訊 */}
        <div className="flex-1 min-w-0">
          {/* 行程標題 */}
          <h3 className="text-lg font-bold mb-2 truncate" title={itinerary.trip_name}>
            {itinerary.trip_name}
          </h3>

          {/* 行程詳情 */}
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            {/* 天數 */}
            {(itinerary.days !== undefined && itinerary.days !== null) && (
              <span className="flex items-center gap-1">
                <FaIcons.FaCalendarDays />
                {itinerary.days}天{itinerary.nights || 0}夜
              </span>
            )}

            {/* 地點 */}
            {locationArray.length > 0 && (
              <span className="flex items-center gap-1">
                <FaIcons.FaLocationDot />
                <span className="truncate">
                  {locationArray.slice(0, 3).join('、')}
                  {locationArray.length > 3 && '...'}
                </span>
              </span>
            )}
          </div>

          {/* 簡介（如果有） */}
          {itinerary.summary_text && (
            <p className="text-sm text-white/90 line-clamp-2">
              {itinerary.summary_text}
            </p>
          )}
        </div>
      </div>

      {/* 底部提示（如果可點擊） */}
      {onClick && (
        <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/80 flex items-center gap-1">
          <FaIcons.FaArrowRight className="text-xs" />
          點擊查看完整行程
        </div>
      )}
    </div>
  )
}