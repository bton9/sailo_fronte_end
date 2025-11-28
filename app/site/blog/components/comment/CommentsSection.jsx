'use client'

import { useRef, useState } from 'react'
import * as FaIcons from 'react-icons/fa6'
import CommentItem from './CommentItem'
import NewCommentInput from './NewCommentInput'
import ConfirmModal from '@/components/confirmModal'

/**
 * CommentsSection - 留言區元件
 *
 * @param {Object} props
 * @param {Array} props.comments - 留言列表
 * @param {number} props.totalComments - 留言總數
 * @param {Object} props.currentUser - 當前使用者資訊
 * @param {boolean} props.isLoading - 是否載入中
 * @param {Function} props.onCommentSubmit - 提交留言
 * @param {Function} props.onCommentLike - 按讚留言
 * @param {Function} props.onCommentEdit - 編輯留言
 * @param {Function} props.onCommentDelete - 刪除留言
 * @param {Function} props.onAvatarClick - 點擊頭貼
 * @param {Function} props.onUsernameClick - 點擊使用者名稱
 */
export default function CommentsSection({
  comments = [],
  totalComments = 0,
  currentUser = null,
  isLoading = false,
  onCommentSubmit = () => {},
  onCommentLike = () => {},
  onCommentEdit = () => {},
  onCommentDelete = () => {},
  onAvatarClick = () => {},
  onUsernameClick = () => {},
}) {
  const commentInputRef = useRef(null)
  //  新增：ConfirmModal 狀態
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    commentId: null,
  })

  // 處理回覆（填入 @使用者名稱）
  const handleReply = (username) => {
    if (commentInputRef.current) {
      commentInputRef.current.setContent(`@${username} `)
      commentInputRef.current.focus()
    }
  }

  // 處理編輯留言（直接傳遞給 CommentItem）
  const handleEdit = async (commentId, content) => {
    try {
      await onCommentEdit(commentId, content)
    } catch (error) {
      console.error('編輯留言失敗:', error)
      throw error
    }
  }

  // 處理刪除留言 - 顯示確認對話框
  const handleDelete = (commentId) => {
    setConfirmModal({
      isOpen: true,
      commentId: commentId,
    })
  }

  // 確認刪除留言
  const confirmDelete = async () => {
    const commentId = confirmModal.commentId

    // 關閉 Modal
    setConfirmModal({ isOpen: false, commentId: null })

    try {
      await onCommentDelete(commentId)
    } catch (error) {
      console.error('刪除留言失敗:', error)
    }
  }

  return (
    <>
      <section
        className="bg-white/60 p-8 shadow-md border-l-[3px] border-primary mb-6"
        id="comments"
      >
        {/* 留言標題 */}
        <div className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <FaIcons.FaComments />
          留言
          <span className="text-base text-gray-500 font-normal">
            ({totalComments})
          </span>
        </div>

        {/* 留言列表 */}
        <div>
          {isLoading ? (
            // 載入中
            <div className="text-center py-12">
              <FaIcons.FaSpinner className="inline text-4xl text-primary animate-spin" />
              <p className="mt-4 text-gray-600">載入留言中...</p>
            </div>
          ) : comments.length > 0 ? (
            // 顯示留言
            comments.map((comment) => (
              <CommentItem
                key={comment.comment_id}
                comment={comment}
                currentUserId={currentUser?.id}
                onLike={onCommentLike}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAvatarClick={onAvatarClick}
                onUsernameClick={onUsernameClick}
              />
            ))
          ) : (
            // 無留言
            <div className="text-center py-12 text-gray-500">
              <FaIcons.FaInbox className="inline text-4xl mb-2" />
              <p>目前還沒有留言，成為第一個留言的人吧！</p>
            </div>
          )}
        </div>

        {/* 新增留言輸入框（已登入才顯示） */}
        {currentUser ? (
          <NewCommentInput
            ref={commentInputRef}
            currentUserAvatar={currentUser.avatar}
            currentUserId={currentUser.id}
            onSubmit={onCommentSubmit}
          />
        ) : (
          <div className="mt-8 pt-8 border-t-2 border-border">
            <div className="py-8 text-center text-gray-500">
              <FaIcons.FaLock className="inline text-2xl mb-2" />
              <p>請先登入以發表留言</p>
            </div>
          </div>
        )}
      </section>

      {/*  確認刪除留言 Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, commentId: null })}
        onConfirm={confirmDelete}
        title="確認刪除"
        message="確定要刪除這則留言嗎？"
        confirmText="確定"
        cancelText="取消"
        confirmButtonStyle="bg-point-500 hover:bg-point-400"
      />
    </>
  )
}
