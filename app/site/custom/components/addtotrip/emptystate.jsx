/**
 * EmptyState - 無資料提示組件
 * @param {Function} onClearFilters - 清除篩選的回調函數
 * @returns {JSX.Element}
 */
export default function EmptyState({ onClearFilters }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md mx-4 lg:mx-0">
      <p className="text-gray-500 text-lg mb-2">找不到符合條件的景點</p>
      <p className="text-gray-400 text-sm mb-4">試試調整搜尋條件或清除篩選</p>
      <button
        onClick={onClearFilters}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        清除所有篩選
      </button>
    </div>
  )
}
