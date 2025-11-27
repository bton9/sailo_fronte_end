'use client'

import { useState } from 'react'
import * as FaIcons from 'react-icons/fa6'

/**
 * CategorySelector - 文章分類選擇器元件
 */
export default function CategorySelector({
  value = 'travel',
  onChange = () => {},
  required = true,
}) {
  const [selectedCategory, setSelectedCategory] = useState(value)

  const categories = [
    { value: 'travel', label: '旅遊紀錄', icon: FaIcons.FaPlane },
    { value: 'food', label: '美食推薦', icon: FaIcons.FaUtensils },
    { value: 'life', label: '生活分享', icon: FaIcons.FaMugHot },
    { value: 'photo', label: '攝影作品', icon: FaIcons.FaCamera },
  ]

  const handleChange = (categoryValue) => {
    setSelectedCategory(categoryValue)
    onChange(categoryValue)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-primary mb-2">
        文章分類
        {required && <span className="text-secondary ml-1">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.value

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => handleChange(category.value)}
              className={`px-5 py-2.5 border-2 rounded-full text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 ${
                isSelected
                  ? 'border-primary bg-primary-500 text-white'
                  : 'border-primary bg-transparent text-primary hover:bg-primary/10'
              }`}
            >
              <Icon />
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}