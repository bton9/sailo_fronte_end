'use client'

export default function SortBar({
  sortOptions = [],
  currentSort = 'newest',
  onSortChange = () => {},
  className = '',
}) {
  // 預設排序選項（如果沒有傳入）
  const defaultOptions = [
    { value: 'newest', label: '最新發布' },
    { value: 'likes', label: '最多按讚' },
    { value: 'comments', label: '最多留言' },
    { value: 'bookmarks', label: '最多收藏' },
  ]

  const options = sortOptions.length > 0 ? sortOptions : defaultOptions

  return (
    <div className={`bg-transparent px-6 py-4 flex justify-between items-center border-b border-border ${className}`}>
      <span className="text-sm text-gray-600 font-medium">排序方式</span>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="py-2 px-4 border border-gray-300 rounded-lg text-sm cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}