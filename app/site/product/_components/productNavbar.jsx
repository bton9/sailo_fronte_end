//app/site/product/_components/productNavbar.jsx

'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

const ProductNavbar = ({
  searchInput,
  onSearchChange,
  onClearSearch,
  filters,
  onFiltersChange,
  onFilterClick,
  getActiveFiltersCount,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // 更新多個篩選條件
  const updateMultipleFilters = (updates) => {
    onFiltersChange({
      ...filters,
      ...updates,
    })
  }

  // 清除所有篩選
  const clearAllFilters = () => {
    onFiltersChange({
      categoryId: '',
      inStock: false,
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      specialFilter: '',
    })
    onClearSearch()
  }

  // 檢查是否有啟用的篩選
  const hasActiveFilters = () => {
    return (
      filters.categoryId ||
      filters.inStock ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.specialFilter ||
      searchInput
    )
  }

  // 處理 Select 變更
  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-')
    updateMultipleFilters({ sortBy, sortOrder })
  }

  // 處理手機版搜尋 Enter 鍵
  const handleMobileSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      // 關閉搜尋彈出層
      setShowMobileSearch(false)
      // 搜尋功能已經通過 onSearchChange 觸發,這裡只需要關閉彈出層
    }
  }

  return (
    <>
      {/* 桌面版 Navbar - 手機版隱藏 */}
      {/* 使用 left-16 2xl:left-0 來避免在中等螢幕擋住 sidebar */}
      <div className="hidden md:block fixed top-5 left-16 2xl:left-0 right-0 z-50 mb-8 px-4 lg:px-4">
        <div className="bg-white w-full max-w-7xl mx-auto rounded-full border border-gray-200 px-6 py-1.5 lg:pl-6 pl-4">
          <div className="flex items-center gap-3">
            {/* 搜尋輸入框 */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="搜尋商品名稱..."
                className="w-full pl-10 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent rounded-full"
              />
            </div>

            {/* 分隔線 */}
            <div className="h-6 w-px bg-gray-300" />

            {/* 篩選按鈕 - 保持原樣式 */}
            <button
              onClick={onFilterClick}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary/50 transition-colors relative bg-primary-500 text-white hover:bg-[#7a6449]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap font-medium">篩選</span>
            </button>

            {/* 排序選單 - 使用 Radix Select,保持原樣式 */}
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px] border border-border rounded-lg bg-white focus:ring-2 focus:ring-accent h-auto py-2.5 px-4">
                <SelectValue placeholder="價格: 高到低" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-DESC">最新上架</SelectItem>
                <SelectItem value="price-ASC">價格: 低到高</SelectItem>
                <SelectItem value="price-DESC">價格: 高到低</SelectItem>
                <SelectItem value="avg_rating-DESC">評分: 高到低</SelectItem>
                <SelectItem value="favorite_count-DESC">最多收藏</SelectItem>
                <SelectItem value="product_name-ASC">名稱: A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* 清除按鈕 - 保持原樣式 */}
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 border border-border rounded-lg hover:bg-secondary/50 bg-white"
              >
                <X className="h-4 w-4" />
                <span className="whitespace-nowrap">清除</span>
              </button>
            )}

            {/* 彈性空間 */}
            <div className="flex-1" />

            {/* 購物車按鈕 - 最右邊 */}
            <button
              onClick={() => (window.location.href = '/site/cart')}
              className="flex items-center gap-2 px-6 py-2.5 bg-secondary-600 text-white rounded-full hover:bg-secondary-900 transition-colors whitespace-nowrap"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap font-medium">購物車</span>
            </button>
          </div>
        </div>
      </div>

      {/* 手機版底部按鈕列 */}
      <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3">
        {/* 篩選按鈕 */}
        <button
          onClick={onFilterClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#B8A68F] text-white rounded-full shadow-lg hover:bg-[#a89680] transition-colors"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="text-sm whitespace-nowrap font-medium">篩選</span>
        </button>

        {/* 購物車按鈕 */}
        <button className="flex items-center gap-2 px-6 py-3 bg-[#4A4A4A] text-white rounded-full shadow-lg hover:bg-[#3a3a3a] transition-colors">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm whitespace-nowrap font-medium">購物車</span>
        </button>

        {/* 搜尋按鈕 */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-300 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* 手機版搜尋彈出層 */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white">
          <div className="flex flex-col h-full">
            {/* 搜尋頭部 */}
            <div className="flex items-center gap-3 p-4 border-b">
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleMobileSearchKeyDown}
                  placeholder="搜尋商品名稱..."
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
              </div>
            </div>

            {/* 搜尋結果或提示 */}
            <div className="flex-1 p-4">
              {searchInput ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    搜尋 "{searchInput}"
                  </p>

                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  輸入關鍵字搜尋商品
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductNavbar