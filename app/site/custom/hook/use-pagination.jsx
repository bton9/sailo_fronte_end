import { useEffect } from 'react'

/**
 * 自定義 Hook - 管理分頁邏輯
 * @param {Object} options - 配置選項
 * @param {number} options.currentPage - 當前頁碼
 * @param {Function} options.setCurrentPage - 設置當前頁碼的函數
 * @param {Array} options.filteredPlaces - 篩選後的景點數據
 * @param {Function} options.setPlaces - 設置當前頁顯示景點的函數
 * @param {number} options.itemsPerPage - 每頁顯示的項目數量
 * @param {number} options.totalPages - 總頁數
 * @returns {Object} 分頁相關方法
 */
export function usePagination({
  currentPage,
  setCurrentPage,
  filteredPlaces,
  setPlaces,
  itemsPerPage,
  totalPages,
}) {
  // 分頁邏輯
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentPageData = filteredPlaces.slice(startIndex, endIndex)
    setPlaces(currentPageData)
  }, [currentPage, filteredPlaces, itemsPerPage, setPlaces])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  return {
    handlePageChange,
  }
}
