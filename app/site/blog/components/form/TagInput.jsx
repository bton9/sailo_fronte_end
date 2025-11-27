'use client'

import { useState, useRef, useEffect } from 'react'
import * as FaIcons from 'react-icons/fa6'

/**
 * TagInput - 標籤輸入元件
 */
export default function TagInput({
  tags = [],
  onTagsChange = () => {},
  maxTags = 10,
  minTagLength = 2,
  existingTags = [],
  suggestedTags = ['日本', '美食', '景點', '攝影', '旅遊', '自由行'],
}) {
  const [inputValue, setInputValue] = useState('')
  const [dropdown, setDropdown] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target) &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 處理輸入變化
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/^#/, '')
    setInputValue(value)

    if (!value.trim()) {
      setShowDropdown(false)
      return
    }

    // 搜尋匹配的標籤
    const matches = existingTags
      .filter((tag) => {
        const tagName = typeof tag === 'string' ? tag : tag.tagname || tag.name
        return tagName.toLowerCase().includes(value.toLowerCase())
      })
      .sort((a, b) => {
        const aName = typeof a === 'string' ? a : a.tagname || a.name
        const bName = typeof b === 'string' ? b : b.tagname || b.name
        const aExact = aName.toLowerCase() === value.toLowerCase()
        const bExact = bName.toLowerCase() === value.toLowerCase()
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        const aCount = typeof a === 'string' ? 0 : a.usage_count || 0
        const bCount = typeof b === 'string' ? 0 : b.usage_count || 0
        return bCount - aCount
      })
      .slice(0, 5)

    setDropdown(matches)
    setShowDropdown(true)
  }

  // 新增標籤
  const addTag = (tagName) => {
    const trimmedTag = tagName.trim()

    if (!trimmedTag) return

    if (trimmedTag.length < minTagLength) {
      alert(`標籤至少需要 ${minTagLength} 個字元`)
      return
    }

    if (tags.length >= maxTags) {
      alert(`最多只能新增 ${maxTags} 個標籤`)
      return
    }

    if (tags.includes(trimmedTag)) {
      alert('此標籤已存在')
      return
    }

    onTagsChange([...tags, trimmedTag])
    setInputValue('')
    setShowDropdown(false)
  }

  // 移除標籤
  const removeTag = (tagToRemove) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  // 選擇現有標籤
  const selectTag = (tag) => {
    const tagName = typeof tag === 'string' ? tag : tag.tagname || tag.name
    addTag(tagName)
  }

  // Enter 鍵新增標籤
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  // 格式化使用次數
  const formatCount = (count) => {
    if (!count) return ''
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count
  }

  // 高亮匹配文字
  const highlightMatch = (text, query) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i} className="text-secondary">
          {part}
        </strong>
      ) : (
        part
      )
    )
  }

  // 是否為精確匹配
  const hasExactMatch = dropdown.some((tag) => {
    const tagName = typeof tag === 'string' ? tag : tag.tagname || tag.name
    return tagName.toLowerCase() === inputValue.toLowerCase()
  })

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-primary mb-2">
        文章標籤
      </label>

      {/* 輸入框與下拉選單 */}
      <div className="relative mb-3">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="輸入標籤（例如：美食、日本、攝影）"
          className="w-full py-3 px-4 border-2 border-primary rounded-xl text-sm focus:outline-none focus:shadow-md focus:bg-white transition-all"
          autoComplete="off"
        />

        {/* 下拉選單 */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 bg-white border-2 border-primary border-t-0 rounded-b-xl max-h-60 overflow-y-auto z-10 shadow-lg"
          >
            {inputValue.length < minTagLength ? (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm">
                <FaIcons.FaCircleInfo className="inline mr-1" />
                標籤至少需要 {minTagLength} 個字元
              </div>
            ) : (
              <>
                {/* 現有標籤 */}
                {dropdown.map((tag, index) => {
                  const tagName =
                    typeof tag === 'string' ? tag : tag.tagname || tag.name
                  const usageCount =
                    typeof tag === 'string' ? 0 : tag.usage_count || 0

                  return (
                    <div
                      key={index}
                      onClick={() => selectTag(tag)}
                      className="p-3 cursor-pointer hover:bg-primary/10 transition-colors border-b border-gray-200 flex items-center justify-between"
                    >
                      <span className="text-primary font-semibold flex items-center gap-2">
                        <FaIcons.FaTag />
                        {highlightMatch(tagName, inputValue)}
                      </span>
                      {usageCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {formatCount(usageCount)} 次使用
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* 建立新標籤 */}
                {!hasExactMatch && inputValue.length >= minTagLength && (
                  <div
                    onClick={() => addTag(inputValue)}
                    className="p-3 bg-secondary/10 text-secondary font-semibold cursor-pointer hover:bg-secondary/20 transition-colors flex items-center gap-2"
                  >
                    <FaIcons.FaCirclePlus />
                    建立新標籤「#{inputValue}」
                  </div>
                )}

                {/* 無結果 */}
                {dropdown.length === 0 && hasExactMatch && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <FaIcons.FaMagnifyingGlass className="inline mr-1" />
                    找不到相關標籤
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 提示 */}
      <div className="text-sm text-gray-500 mb-2">
        <FaIcons.FaCircleInfo className="inline mr-1" />
        標籤會自動加上 # 符號，最多可新增 {maxTags} 個標籤
      </div>

      {/* 已選標籤 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-2 bg-transparent text-primary border-2 border-primary rounded-full text-sm inline-flex items-center gap-2"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="cursor-pointer text-secondary font-bold hover:text-secondary-light transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 推薦標籤 */}
      {suggestedTags.length > 0 && (
        <div className="mt-2 pt-2">
          <div className="text-sm text-gray-600 mb-2">
            <FaIcons.FaLightbulb className="inline mr-1" />
            熱門標籤推薦
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={tags.includes(tag)}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary rounded-full text-xs cursor-pointer hover:bg-primary hover:text-point-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
