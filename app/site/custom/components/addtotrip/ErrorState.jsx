export default function ErrorState({ error, onRetry, testedEndpoints }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md mx-4 lg:mx-0">
      <div className="text-6xl mb-4">⚠️</div>
      <p className="text-red-600 text-lg font-semibold mb-2">
        載入資料時發生錯誤
      </p>
      <p className="text-gray-600 text-sm mb-4 px-4 max-w-2xl mx-auto">
        {error || '請稍後再試'}
      </p>

      {/* 測試過的端點 */}
      {testedEndpoints && testedEndpoints.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            已測試的 API 端點：
          </p>
          <div className="text-xs text-left text-gray-600 space-y-1">
            {testedEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="font-mono bg-white p-2 rounded border border-gray-200"
              >
                <div className="text-blue-600">{endpoint.url}</div>
                <div className="text-gray-500">
                  狀態: {endpoint.status} | Content-Type:{' '}
                  {endpoint.contentType || '無'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 除錯資訊 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
        <p className="text-xs text-gray-500 mb-2">常見問題：</p>
        <ul className="text-xs text-left text-gray-600 space-y-1">
          <li>• 確認後端伺服器是否正在運行 (http://localhost:5000)</li>
          <li>• 檢查 API 路徑是否正確 (/api/places)</li>
          <li>• 查看瀏覽器 Console 獲取更多錯誤資訊</li>
          <li>• 確認後端 CORS 設定是否正確</li>
        </ul>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          🔄 重新載入
        </button>
      )}
    </div>
  )
}
