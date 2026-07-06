/**
 * 自定義 Hook - 分頁換頁邏輯（實際的當頁景點切片由 use-Places.js 的
 * usePlaces() 內部負責，這裡只處理換頁時的邊界檢查與捲動）
 * @param {Object} options - 配置選項
 * @param {Function} options.setCurrentPage - 設置當前頁碼的函數
 * @param {number} options.totalPages - 總頁數
 * @returns {Object} 分頁相關方法
 */
export function usePagination({ setCurrentPage, totalPages }) {
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
