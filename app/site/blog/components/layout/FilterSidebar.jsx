'use client'

import { useState } from 'react'
import * as FaIcons from 'react-icons/fa6'

export default function FilterSidebar({
  config = [],
  onFilterChange,
  initialFilters = {},
  isLoading = false,
}) {
  const [filters, setFilters] = useState(initialFilters)

  //  修正:過濾無效的值
  const updateFilter = (key, value) => {
    const newFilters = { ...filters }

    //  如果是 category 且值為空字串或 'all',移除這個欄位
    if (key === 'category' && (!value || value === '' || value === 'all')) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }

    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const resetFilters = () => {
    setFilters({})
    onFilterChange?.({})
  }

  return (
    <div className="bg-white/50 p-6 rounded-xl shadow-md border-2 border-primary-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-300">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaIcons.FaFilter />
          篩選條件
        </h3>
        <button
          type="button"
          onClick={resetFilters}
          className="px-3 py-1.5 bg-transparent border border-gray-500 text-gray-500 rounded-md text-sm hover:bg-gray-500 hover:text-white transition-all"
        >
          重置
        </button>
      </div>

      {/* Filter Fields */}
      {config.map((field) => (
        <div key={field.name} className="mb-6 last:mb-0">
          <label className="block text-sm font-medium mb-2 text-gray-600">
            {field.label}
          </label>

          {/* 分類按鈕 */}
          {field.type === 'category' && (
            <div className="flex flex-col gap-2">
              {field.options.map((option) => {
                const isSelected = filters[field.name] === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFilter(field.name, option.value)}
                    className={`px-4 py-2.5 border-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-primary-500 border-secondary-600 bg-transparent text-secondary-600 hover:bg-primary-500/30'
                    }`}
                    disabled={isLoading}
                  >
                    {option.icon && <option.icon size={16} />}
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}

          {/*  標籤按鈕（用於搜尋或篩選） */}
          {field.type === 'tagButtons' && (
            <div className="flex flex-wrap gap-2">
              {field.options.map((option) => {
                const optionValue =
                  typeof option === 'string'
                    ? option
                    : option.value || option.tagname
                const optionLabel =
                  typeof option === 'string'
                    ? option
                    : option.label || option.tagname

                //  檢查是否選中（支援篩選模式）
                const isSelected =
                  filters.tags && filters.tags.includes(optionValue)

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => {
                      //  觸發標籤點擊事件
                      if (field.onTagClick) {
                        field.onTagClick(optionValue)
                      }
                    }}
                    className={`px-3 py-2 border rounded-full text-sm transition-all ${
                      isSelected
                        ? 'border-primary-900 bg-primary-900 text-white'
                        : 'border-primary-900 bg-transparent text-primary hover:bg-primary-500 hover:text-white'
                    }`}
                    disabled={isLoading}
                  >
                    #{optionLabel}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* 無資料提示 */}
      {config.length === 0 && (
        <div className="text-center text-gray-500 py-6">
          <p className="text-sm">暫無篩選條件</p>
        </div>
      )}
    </div>
  )
}
