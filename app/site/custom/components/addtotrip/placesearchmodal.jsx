'use client'

import React, { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'

/**
 * 景點搜尋彈窗元件
 * 用於在行程詳細頁面搜尋並加入景點
 *
 * @param {boolean} isOpen - 是否顯示彈窗
 * @param {function} onClose - 關閉彈窗的回調
 * @param {number} tripDayId - 要加入景點的日期 ID
 * @param {number} userId - 使用者 ID
 * @param {function} onPlaceSelect - 選擇景點的回調 (placeId, placeName, placeCategory, placeImage)
 */
export default function PlaceSearchModal({
  isOpen,
  onClose,
  tripDayId,
  userId,
  onPlaceSelect,
}) {
  const [keyword, setKeyword] = useState('') // 搜尋關鍵字
  const [locationId, setLocationId] = useState('') // 地區篩選
  const [category, setCategory] = useState('') // 類別篩選
  const [places, setPlaces] = useState([]) // 景點列表
  const [locations, setLocations] = useState([]) // 地區列表
  const [loading, setLoading] = useState(false) // 載入中
  const [searched, setSearched] = useState(false) // 是否已搜尋過

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // 載入地區列表
  useEffect(() => {
    if (isOpen) {
      loadLocations()
    }
  }, [isOpen])
  // 鎖住背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null
  // 載入地區列表
  const loadLocations = async () => {
    try {
      // 假設你有這個 API,如果沒有可以先註解掉
      const response = await fetch(`${API_URL}/api/locations`)
      const data = await response.json()

      if (data.success && data.data) {
        setLocations(data.data)
      }
    } catch (error) {
      console.error('❌ 載入地區列表失敗:', error)
    }
  }

  // 搜尋景點
  const handleSearch = async () => {
    try {
      setLoading(true)
      setSearched(true)

      // 建立查詢參數
      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      if (locationId) params.append('location_id', locationId)
      if (category) params.append('category', category)

      const url = params.toString()
        ? `${API_URL}/api/places?${params.toString()}`
        : `${API_URL}/api/places`

      const response = await fetch(url)
      const data = await response.json()

      console.log('🔍 搜尋結果:', data)

      if (data.success && data.data) {
        setPlaces(data.data)
      } else {
        setPlaces([])
      }
    } catch (error) {
      console.error('❌ 搜尋失敗:', error)
      alert('搜尋失敗,請稍後再試')
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  // Enter 鍵觸發搜尋
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 選擇景點
  const handleSelectPlace = (place) => {
    // 取得景點的封面圖
    let coverImage = null

    // 如果景點有 cover_image 欄位
    if (place.cover_image) {
      coverImage = place.cover_image
    }

    onPlaceSelect(place.place_id, place.name, place.category, coverImage)
  }

  // 關閉彈窗並重置
  const handleClose = () => {
    setKeyword('')
    setLocationId('')
    setCategory('')
    setPlaces([])
    setSearched(false)
    onClose()
  }

  // 處理圖片 URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http')) return imageUrl
    if (imageUrl.startsWith('/uploads/')) return `${API_URL}${imageUrl}`
    return `${API_URL}/uploads/${imageUrl}`
  }

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-150">
        {/* 彈窗 */}
        <div className="fixed inset-x-4 top-20 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl bg-white shadow-2xl z-50 max-h-[80vh] flex flex-col">
          {/* 標題列 */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-secondary-900">搜尋景點</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* 搜尋區 */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* 關鍵字搜尋 */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="搜尋景點名稱或描述..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 outline-none"
              />
            </div>

            {/* 篩選器 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 地區篩選 */}
              {locations.length > 0 && (
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="px-4 py-3 border border-gray-300 outline-none"
                >
                  <option value="">所有地區</option>
                  {locations.map((loc) => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              )}

              {/* 類別篩選 */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 outline-none"
              >
                <option value="">所有類別</option>
                <option value="景點">景點</option>
                <option value="餐廳">餐廳</option>
                <option value="住宿">住宿</option>
              </select>
            </div>

            {/* 搜尋按鈕 */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full py-3 bg-secondary-900 text-white font-semibold hover:bg-secondary-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '搜尋中...' : '搜尋'}
            </button>
          </div>

          {/* 結果區 */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">搜尋中...</p>
                </div>
              </div>
            ) : !searched ? (
              <div className="text-center py-12 text-gray-500">
                請輸入關鍵字或選擇篩選條件後搜尋
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                找不到符合條件的景點
              </div>
            ) : (
              <div className="space-y-3">
                {places.map((place) => (
                  <div
                    key={place.place_id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 hover:border-secondary-900 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSelectPlace(place)}
                  >
                    {/* 景點圖片 */}
                    {place.cover_image && getImageUrl(place.cover_image) ? (
                      <img
                        src={getImageUrl(place.cover_image)}
                        alt={place.name}
                        className="w-20 h-20 object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs">無圖片</span>
                      </div>
                    )}

                    {/* 景點資訊 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-1 truncate">
                        {place.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                          {place.category}
                        </span>
                        {place.rating && (
                          <span className="text-sm text-gray-600">
                            ⭐ {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {place.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {place.description}
                        </p>
                      )}
                    </div>

                    {/* 加入按鈕 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectPlace(place)
                      }}
                      className="flex-shrink-0 px-4 py-2 bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
                    >
                      + 加入
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}