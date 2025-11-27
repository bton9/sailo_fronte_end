/**
 * LoadingSpinner - 載入中的旋轉動畫組件
 * @returns {JSX.Element}
 */
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">載入中...</span>
    </div>
  )
}
