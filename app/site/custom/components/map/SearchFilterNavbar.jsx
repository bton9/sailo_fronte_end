'use client'
import React from 'react'
import { Search, MapPin, X, Map, Landmark, Utensils, Hotel } from 'lucide-react'

/**
 * 搜尋與篩選 Navbar 元件
 * 類似旅遊網站的橫向導航列設計
 *
 * @param {string} searchTerm - 搜尋關鍵字
 * @param {function} onSearchChange - 搜尋改變回調
 * @param {string} selectedCity - 選中的城市
 * @param {function} onCityChange - 城市改變回調
 * @param {string} selectedCategory - 選中的分類
 * @param {function} onCategoryChange - 分類改變回調
 * @param {array} cities - 城市列表
 * @param {array} categories - 分類列表
 * @param {number} resultCount - 結果數量
 * @param {function} onClearFilters - 清除篩選回調
 * @param {boolean} showResultCount - 是否顯示結果數量
 * @param {string} placeholder - 搜尋框占位文字
 */
export default function SearchFilterNavbar({
  searchTerm = '',
  onSearchChange,
  selectedCity = '',
  onCityChange,
  selectedCategory = '',
  onCategoryChange,
  cities = [],
  // 將預設的 categories 裡的 icon 從 Emoji 改為一個識別字串，以便映射到 Lucide 元件
  categories = [
    { value: '景點', label: '景點', icon: 'Landmark' }, // 景點對應 Landmark
    { value: '餐廳', label: '美食', icon: 'Utensils' }, // 餐廳對應 Utensils
    { value: '住宿', label: '住宿', icon: 'Hotel' }, // 住宿對應 Hotel
  ],
  resultCount = 0,
  onClearFilters,
  showResultCount = true,
  placeholder = '搜尋景點名稱、描述或城市...',
}) {
  const hasActiveFilters = searchTerm || selectedCity || selectedCategory

  // 1. 定義 Lucide 圖示元件的映射表
  // 這樣可以使用 cat.icon 字串來動態載入對應的 React 元件
  const IconMap = {
    Landmark: Landmark,
    Utensils: Utensils,
    Hotel: Hotel,
    // 如果傳入的 categories 陣列有額外的項目，可以根據需要在這裡擴展映射
  }

  return (
    <div className="sticky top-0 md:top-5 z-40 px-2 sm:px-4 mb-4 md:mb-8 pt-0 md:pt-5 md:mx-5">
      <div className="bg-white w-full max-w-7xl mx-auto rounded-2xl md:rounded-full border border-gray-300 px-3 sm:px-4 md:px-6 py-3 md:py-1.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
          {/* 第一行：搜尋框 + 城市篩選（手機版） */}
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            {/* 搜尋框 */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent rounded-full"
              />
            </div>

            {/* 分隔線 - 桌面版顯示 */}
            <div className="hidden md:block h-6 w-px bg-gray-300" />

            {/* 城市篩選 */}
            <select
              value={selectedCity}
              onChange={(e) => onCityChange?.(e.target.value)}
              className={`px-3 md:px-4 py-2 rounded-full border text-xs md:text-sm whitespace-nowrap cursor-pointer transition flex-shrink-0 ${
                selectedCity
                  ? 'bg-gray-50 border-gray-400 text-secondary-600 font-normal'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <option value="">所有城市</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* 第二行：分類按鈕 + 清除按鈕 + 結果統計（手機版分行） */}
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            {/* 分類篩選按鈕 */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.value
              let bgColor = 'bg-gray-400'
              let hoverColor = 'hover:bg-gray-500'

              // 2. 根據 cat.icon 字串查找對應的 Lucide 圖示元件
              // 如果 IconMap 中找不到，則預設使用 MapPin
              const IconComponent = IconMap[cat.icon] || MapPin

              // 根據分類設定顏色
              if (cat.value === '景點') {
                bgColor = isSelected ? 'bg-secondary-500' : 'bg-secondary-500'
                hoverColor = 'hover:bg-gray-500'
              } else if (cat.value === '餐廳') {
                bgColor = isSelected ? 'bg-primary-500' : 'bg-primary-500'
                hoverColor = 'hover:bg-amber-600'
              } else if (cat.value === '住宿') {
                bgColor = isSelected ? 'bg-secondary-600' : 'bg-secondary-600'
                hoverColor = 'hover:bg-secondary-900'
              }

              return (
                <button
                  key={cat.value}
                  onClick={() =>
                    onCategoryChange?.(
                      selectedCategory === cat.value ? '' : cat.value
                    )
                  }
                  className={`flex items-center gap-2 md:gap-3 rounded-xs px-2.5 md:px-3 py-1.5 transition-colors text-white text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0 ${bgColor} ${hoverColor}`}
                >
                  {/* 3. 渲染動態圖示元件 */}
                  <IconComponent className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>{cat.label}</span>
                </button>
              )
            })}

            {/* 清除篩選按鈕 */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm text-point-500 hover:text-red-700 transition-colors flex items-center gap-1 border border-red-500 hover:bg-red-50 bg-white whitespace-nowrap flex-shrink-0 rounded-xs"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>清除</span>
              </button>
            )}

            {/* 彈性空間 - 桌面版 */}
            <div className="hidden md:block flex-1" />

            {/* 結果統計 */}
            {showResultCount && (
              <div className="text-xs md:text-sm text-gray-400 whitespace-nowrap flex-shrink-0 ml-auto md:ml-0">
                <span className="font-normal">{resultCount} 個結果</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 隱藏滾動條樣式 */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}