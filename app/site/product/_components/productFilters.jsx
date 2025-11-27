//app/site/product/_components/productFilters.jsx

'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react'

const ProductFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  categories = [],
  showFilters,
  setShowFilters 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    stock: true,
    category: true,
    price: true,
    special: false,
  })
  const [isAnimating, setIsAnimating] = useState(false)

  // 當 showFilters 變化時觸發動畫
  useEffect(() => {
    if (showFilters) {
      setIsAnimating(true)
    }
  }, [showFilters])

  // 切換展開/收合
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  // 更新單一篩選條件
  const updateFilter = useCallback((key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }, [filters, onFiltersChange])

  // 更新多個篩選條件
  const updateMultipleFilters = useCallback((updates) => {
    onFiltersChange({
      ...filters,
      ...updates,
    })
  }, [filters, onFiltersChange])

  // 清除所有篩選
  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      categoryId: '',
      inStock: false,
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      specialFilter: '',
    })
  }, [onFiltersChange])

  // 檢查是否有啟用的篩選
  const hasActiveFilters = useCallback(() => {
    return (
      filters.categoryId ||
      filters.inStock ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.specialFilter
    )
  }, [filters])

  // 計算啟用的篩選數量
  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    if (filters.categoryId) count++
    if (filters.inStock) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.specialFilter) count++
    return count
  }, [filters])

  // 處理關閉側邊欄
  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShowFilters(false)
    }, 300) // 等待動畫完成
  }

  // 篩選區塊標題元件
  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-accent transition-colors"
      >
        <span className="font-medium text-sm uppercase tracking-wider">
          {title}
        </span>
        {expandedSections[section] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="pb-4 space-y-3">{children}</div>
      )}
    </div>
  )

  const FilterContent = () => (
    <>
      {/* 庫存篩選 */}
      <FilterSection title="庫存狀態" section="stock">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            僅顯示有庫存商品
          </span>
        </label>
      </FilterSection>

      {/* 特殊篩選 */}
      <FilterSection title="其他篩選" section="special">
        <div className="space-y-2">
          <button
            onClick={() =>
              updateFilter(
                'specialFilter',
                filters.specialFilter === 'popular' ? '' : 'popular'
              )
            }
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              filters.specialFilter === 'popular'
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            熱門收藏
          </button>
          <button
            onClick={() =>
              updateFilter(
                'specialFilter',
                filters.specialFilter === 'bestseller' ? '' : 'bestseller'
              )
            }
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              filters.specialFilter === 'bestseller'
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            熱銷品項
          </button>
          <button
            onClick={() =>
              updateFilter(
                'specialFilter',
                filters.specialFilter === 'highrated' ? '' : 'highrated'
              )
            }
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              filters.specialFilter === 'highrated'
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            高評分商品
          </button>
        </div>
      </FilterSection>

      {/* 分類篩選 */}
      <FilterSection title="商品分類" section="category">
        <div className="space-y-2">
          {/* 全部分類 */}
          <button
            onClick={() => updateFilter('categoryId', '')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              !filters.categoryId
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            全部分類
          </button>

          {/* 預設分類 1-10 */}
          {[
            { id: '1', name: '盥洗用品' },
            { id: '2', name: '電子產品' },
            { id: '3', name: '衣物收納' },
            { id: '4', name: '旅行配件' },
            { id: '5', name: '戶外露營' },
            { id: '6', name: '登山健行' },
            { id: '7', name: '攝影器材' },
            { id: '8', name: '防護用品' },
            { id: '9', name: '運動用品' },
            { id: '10', name: '雨具防水' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('categoryId', cat.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                filters.categoryId === cat.id
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-muted-foreground hover:bg-primary-400 hover:text-primary-900'
              }`}
            >
              {cat.name}
            </button>
          ))}

          {/* 從 API 動態載入的額外分類 */}
          {categories
            .filter((cat) => cat.category_id > 10)
            .map((category) => (
              <button
                key={category.category_id}
                onClick={() =>
                  updateFilter('categoryId', category.category_id.toString())
                }
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  filters.categoryId === category.category_id.toString()
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <span>{category.category_name}</span>
                {category.product_count > 0 && (
                  <span className="text-xs opacity-60">
                    ({category.product_count})
                  </span>
                )}
              </button>
            ))}
        </div>
      </FilterSection>

      {/* 價格篩選 */}
      <FilterSection title="價格範圍" section="price">
        <div className="space-y-4">
          {/* 快速價格選項 */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateMultipleFilters({ minPrice: '', maxPrice: '500' })
              }}
              className={`px-3 py-1.5 text-xs border rounded-full transition-colors ${
                filters.maxPrice === '500' && !filters.minPrice
                  ? 'border-accent bg-accent/10 text-accent font-medium'
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              $500 以下
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateMultipleFilters({ minPrice: '500', maxPrice: '1000' })
              }}
              className={`px-3 py-1.5 text-xs border rounded-full transition-colors ${
                filters.minPrice === '500' && filters.maxPrice === '1000'
                  ? 'border-accent bg-accent/10 text-accent font-medium'
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              $500 - $1,000
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateMultipleFilters({ minPrice: '1000', maxPrice: '3000' })
              }}
              className={`px-3 py-1.5 text-xs border rounded-full transition-colors ${
                filters.minPrice === '1000' && filters.maxPrice === '3000'
                  ? 'border-accent bg-accent/10 text-accent font-medium'
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              $1,000 - $3,000
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateMultipleFilters({ minPrice: '3000', maxPrice: '' })
              }}
              className={`px-3 py-1.5 text-xs border rounded-full transition-colors ${
                filters.minPrice === '3000' && !filters.maxPrice
                  ? 'border-accent bg-accent/10 text-accent font-medium'
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              $3,000 以上
            </button>
          </div>
        </div>
      </FilterSection>
    </>
  )

  return (
    <>
      {/* 篩選側邊欄 (右滑出現) */}
      {showFilters && (
        <>
          {/* 背景遮罩 - z-[65] 確保在 sidebar 之上,加入淡入動畫 */}
          <div
            className={`fixed inset-0 z-[65] bg-black/50 transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />

          {/* 側邊欄 - z-[70] 確保在所有元素之上,加入由右至左滑入動畫 */}
          <div 
            className={`fixed right-0 top-0 h-full w-100 max-w-[100vw] bg-white shadow-2xl z-[70] overflow-hidden flex flex-col transition-transform duration-300 ease-out ${
              isAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* 側邊欄標題 */}
            <div className="flex-shrink-0 border-b border-gray-200 p-6 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-accent" />
                <h3 className="font-medium text-lg text-gray-900">篩選條件</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* 篩選內容區域 (可滾動) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {hasActiveFilters() && (
                <div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-accent">
                      已啟用 {getActiveFiltersCount()} 個篩選
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-muted-foreground hover:text-accent transition-colors underline"
                    >
                      清除全部
                    </button>
                  </div>
                </div>
              )}

              <FilterContent />
            </div>

            {/* 底部按鈕 */}
            <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    clearAllFilters()
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
                >
                  重置
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
                >
                  套用篩選
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ProductFilters