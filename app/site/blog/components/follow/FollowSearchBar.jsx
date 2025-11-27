'use client'

import { useState } from 'react'
import * as FaIcons from 'react-icons/fa6'

/**
 * FollowSearchBar - 追蹤列表內的搜尋元件
 * 
 * 功能:
 * - 在追蹤列表中搜尋特定使用者
 * - 支援 Enter 鍵搜尋
 * - 可清除搜尋關鍵字
 * 
 * @param {string} placeholder - 搜尋框提示文字
 * @param {string} initialValue - 初始搜尋關鍵字
 * @param {function} onSearch - 搜尋時的回調
 * @param {function} onClear - 清除搜尋時的回調
 * @param {string} className - 自訂 CSS 類別
 * 
 * @example
 * <FollowSearchBar
 *   placeholder="搜尋使用者..."
 *   onSearch={(keyword) => handleSearch(keyword)}
 *   onClear={() => handleClear()}
 * />
 */
export default function FollowSearchBar({
  placeholder = '搜尋使用者...',
  initialValue = '',
  onSearch = () => {},
  onClear = () => {},
  className = '',
}) {
  const [keyword, setKeyword] = useState(initialValue)

  // 處理搜尋
  const handleSearch = () => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      onSearch(trimmedKeyword)
    }
  }

  // 處理 Enter 鍵
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 處理清除
  const handleClear = () => {
    setKeyword('')
    onClear()
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="
          w-full
          py-3 px-5
          pr-24
          border-2 border-primary
          rounded-full
          text-sm
          bg-white/60
          focus:outline-none
          focus:bg-white
          focus:shadow-md
          transition-all
        "
      />
      
      {/* 右側按鈕區 */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* 清除按鈕（有關鍵字時才顯示） */}
        {keyword && (
          <button
            onClick={handleClear}
            className="
              text-gray-400
              hover:text-gray-600
              transition-colors
              p-1
            "
            aria-label="清除搜尋"
          >
            <FaIcons.FaXmark size={16} />
          </button>
        )}
        
        {/* 搜尋按鈕 */}
        <button
          onClick={handleSearch}
          className="
            text-primary
            hover:text-primary-light
            transition-colors
            p-1
          "
          aria-label="搜尋"
        >
          <FaIcons.FaMagnifyingGlass size={18} />
        </button>
      </div>
    </div>
  )
}