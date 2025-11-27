/**
 * Pagination - 分頁控制器組件
 * @param {number} currentPage - 當前頁碼
 * @param {number} totalPages - 總頁數
 * @param {Function} onPageChange - 頁碼變更回調函數
 * @returns {JSX.Element}
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (page) => {
        return (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 2 && page <= currentPage + 2)
        )
      }
    )
  }

  const pageNumbers = getPageNumbers()

  return (
    <>
      <div className="flex justify-center items-center gap-2 mt-8 mb-6 flex-wrap px-4">
        {/* 第一頁 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          aria-label="第一頁"
        >
          ««
        </button>

        {/* 上一頁 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          aria-label="上一頁"
        >
          ‹ 上一頁
        </button>

        {/* 頁碼 */}
        <div className="flex items-center gap-2 flex-wrap">
          {pageNumbers.map((page, index, array) => {
            const showEllipsis = index > 0 && page - array[index - 1] > 1

            return (
              <div key={page} className="flex items-center gap-2">
                {showEllipsis && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-100 bg-white'
                  }`}
                >
                  {page}
                </button>
              </div>
            )
          })}
        </div>

        {/* 下一頁 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          aria-label="下一頁"
        >
          下一頁 ›
        </button>

        {/* 最後一頁 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          aria-label="最後一頁"
        >
          »»
        </button>
      </div>

      {/* 頁面資訊 */}
      <div className="text-center text-gray-600 text-sm mb-6">
        第 {currentPage} 頁，共 {totalPages} 頁
      </div>
    </>
  )
}
