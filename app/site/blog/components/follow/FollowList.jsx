'use client'

import FollowUserCard from './FollowUserCard'
import * as FaIcons from 'react-icons/fa6'

/**
 * FollowList - 追蹤列表容器元件
 * 
 * 功能:
 * - 顯示使用者列表
 * - 處理載入中、空狀態
 * - 包含分頁功能
 * 
 * @param {array} users - 使用者列表
 * @param {boolean} loading - 是否載入中
 * @param {number} currentUserId - 當前登入使用者 ID
 * @param {object} pagination - 分頁資訊 { page, totalPages, total }
 * @param {function} onUserClick - 點擊使用者時的回調
 * @param {function} onFollowClick - 點擊追蹤按鈕的回調
 * @param {function} onPageChange - 換頁時的回調
 * @param {string} emptyMessage - 空狀態訊息
 * 
 * @example
 * <FollowList
 *   users={followers}
 *   loading={false}
 *   currentUserId={1}
 *   pagination={{ page: 1, totalPages: 5, total: 50 }}
 *   onUserClick={(userId) => router.push(`/blog/profile/${userId}`)}
 *   onFollowClick={handleFollow}
 *   onPageChange={(page) => setPage(page)}
 *   emptyMessage="目前沒有追蹤者"
 * />
 */
export default function FollowList({
  users = [],
  loading = false,
  currentUserId = null,
  pagination = null,
  onUserClick = () => {},
  onFollowClick = () => {},
  onPageChange = () => {},
  emptyMessage = '目前沒有資料',
}) {
  // 載入中狀態
  if (loading) {
    return (
      <div className="text-center py-12">
        <FaIcons.FaSpinner className="inline-block animate-spin text-4xl text-primary mb-4" />
        <p className="text-gray-600">載入中...</p>
      </div>
    )
  }

  // 空狀態
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <FaIcons.FaInbox className="inline-block text-4xl text-gray-400 mb-4" />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 使用者列表 */}
      <div className="bg-white/60 shadow-md overflow-hidden">
        {users.map((user, index) => (
          <div key={user.id || index}>
            <FollowUserCard
              user={user}
              currentUserId={currentUserId}
              onUserClick={onUserClick}
              onFollowClick={onFollowClick}
            />
            
            {/* 分隔線（最後一個不需要） */}
            {index < users.length - 1 && (
              <div className="border-b border-border/30" />
            )}
          </div>
        ))}
      </div>

      {/* 分頁控制 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {/* 上一頁按鈕 */}
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`
              px-4 py-2
              border border-primary
              rounded
              transition-colors
              ${
                pagination.page === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-primary/10'
              }
            `}
          >
            上一頁
          </button>

          {/* 頁碼資訊 */}
          <span className="px-4 py-2 flex items-center text-gray-700">
            第 {pagination.page} / {pagination.totalPages} 頁
            {pagination.total && (
              <span className="ml-2 text-sm text-gray-500">
                (共 {pagination.total} 人)
              </span>
            )}
          </span>

          {/* 下一頁按鈕 */}
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`
              px-4 py-2
              border border-primary
              rounded
              transition-colors
              ${
                pagination.page === pagination.totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-primary/10'
              }
            `}
          >
            下一頁
          </button>
        </div>
      )}

      {/* 統計資訊（可選） */}
      {pagination && pagination.total > 0 && (
        <div className="text-center text-sm text-gray-500">
          顯示 {users.length} / {pagination.total} 位使用者
        </div>
      )}
    </div>
  )
}