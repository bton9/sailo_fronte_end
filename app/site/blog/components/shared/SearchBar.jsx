'use client'

import { useState } from 'react'
import * as FaIcons from 'react-icons/fa6'

export default function SearchBar({
  placeholder = '搜尋文章、標籤、使用者...',
  onSearch = () => {},
  className = '',
}) {
  const [keyword, setKeyword] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmedKeyword = keyword.trim()
      if (trimmedKeyword) {
        onSearch(trimmedKeyword)
      }
    }
  }

  const handleSearchClick = () => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      onSearch(trimmedKeyword)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full py-3 px-4 pr-12 border-2 border-primary rounded-full text-sm bg-white/60 hover:bg-white focus:bg-white focus:shadow-md transition-all focus:outline-none"
      />
      <button
        onClick={handleSearchClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-light transition-colors"
        aria-label="搜尋"
      >
        <FaIcons.FaMagnifyingGlass size={18} />
      </button>
    </div>
  )
}