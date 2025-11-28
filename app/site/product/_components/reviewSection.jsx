// 主評論區組件
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useReviewPermission } from '../hooks/useReviewPermission'
import { useReviewActions } from '../hooks/useReviewActions'
import { renderStars } from '@/lib/reviewUtils'
import ReviewForm from './reviewForm'
import ReviewCard from './reviewCard'
import {
  ReviewedPrompt,
  NoPermissionPrompt,
  LoginPrompt,
  EmptyReviewsPrompt,
} from './reviewStates'
import {
  EditReviewDialog,
  DeleteReviewDialog,
} from '../_components/reviewDialogs'

export default function ReviewSection({
  product,
  reviews = [],
  onReviewAdded,
  onReviewUpdated,
  onReviewDeleted,
}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  // 權限檢查
  const { canReview, isCheckingPermission, checkReviewPermission } =
    useReviewPermission(product?.product_id)

  // 評論操作
  const { isSubmitting, submitReview, updateReview, deleteReview } =
    useReviewActions(
      product?.product_id,
      onReviewAdded,
      onReviewUpdated,
      onReviewDeleted,
      checkReviewPermission
    )

  // 編輯狀態
  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // 刪除狀態
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // ============ 事件處理 ============

  // 登入跳轉
  const handleLoginClick = () => {
    const currentPath = window.location.pathname
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}&context=review`
    router.push(loginUrl)
  }

  // 提交新評論
  const handleReviewSubmit = async (reviewData) => {
    if (!isAuthenticated) {
      handleLoginClick()
      return false
    }

    const success = await submitReview(
      reviewData.rating,
      reviewData.title,
      reviewData.comment
    )

    //  評論成功後,立即重新檢查權限
    if (success) {
      await checkReviewPermission()
    }

    return success
  }

  // 編輯評論
  const handleEditClick = (review) => {
    if (!isAuthenticated || String(review.user_id) !== String(user?.id)) {
      return
    }

    setEditingReview(review)
    setEditForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleEditFormChange = (updatedData) => {
    setEditForm(updatedData)
  }

  const handleEditSubmit = async () => {
    if (!editForm.comment.trim()) {
      return
    }

    const success = await updateReview(
      editingReview.id,
      editForm.rating,
      editForm.title,
      editForm.comment
    )

    if (success) {
      setIsEditDialogOpen(false)
      setEditingReview(null)
      //  更新成功後重新檢查權限
      await checkReviewPermission()
    }
  }

  const handleEditCancel = () => {
    setIsEditDialogOpen(false)
    setEditingReview(null)
  }

  // 刪除評論
  const handleDeleteClick = (reviewId) => {
    const review = reviews.find((r) => r.id === reviewId)
    if (!isAuthenticated || String(review?.user_id) !== String(user?.id)) {
      return
    }

    setDeletingReviewId(reviewId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const success = await deleteReview(deletingReviewId)

    if (success) {
      setIsDeleteDialogOpen(false)
      setDeletingReviewId(null)
      //  刪除成功後重新檢查權限
      await checkReviewPermission()
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setDeletingReviewId(null)
  }

  // ============ 載入狀態 ============
  if (isCheckingPermission || authLoading) {
    return (
      <div className="mt-20 border-t border-border pt-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground text-lg">載入評論中...</span>
        </div>
      </div>
    )
  }

  // ============ 評論表單顯示邏輯 ============

  /**
   *  修正後的顯示邏輯
   *
   * 優先順序:
   * 1. 未登入 → 顯示登入提示
   * 2. 已評論 → 顯示已評論提示 + 編輯按鈕
   * 3. 未購買 → 顯示無權限提示
   * 4. 可以評論 → 顯示評論表單
   */
  const renderReviewFormSection = () => {
    // 1. 未登入
    if (!isAuthenticated) {
      return <LoginPrompt onLoginClick={handleLoginClick} />
    }

    // 2.  已評論過 → 顯示編輯提示 (優先檢查)
    if (canReview?.hasReviewed && canReview?.review) {
      return (
        <ReviewedPrompt
          review={canReview.review}
          onEditClick={() => handleEditClick(canReview.review)}
        />
      )
    }

    // 3. 檢查是否可以評論
    //  只有在「未評論」且「無權限」時才顯示無權限提示
    if (canReview?.canReview === false && !canReview?.hasReviewed) {
      return (
        <NoPermissionPrompt reason={canReview?.reason || '無法評論此商品'} />
      )
    }

    // 4. 可以評論 → 顯示表單
    return (
      <ReviewForm onSubmit={handleReviewSubmit} isSubmitting={isSubmitting} />
    )
  }

  // ============ 主要渲染 ============
  return (
    <>
      <div className="mt-2  pt-12">
        {/* 標題區域 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-luxury text-foreground">
            顧客評論 ({reviews?.length || 0})
          </h2>

          {product?.avg_rating > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(product.avg_rating))}
              <span className="text-lg font-medium text-foreground ml-2">
                {parseFloat(product.avg_rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* 評論列表 */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          // 沒有評論時的提示
          <EmptyReviewsPrompt />
        )}
      </div>

      {/*  評論表單區域 - 根據狀態動態顯示 */}
      <div className="mt-8 mb-8">{renderReviewFormSection()}</div>

      {/* 編輯評論 Dialog */}
      <EditReviewDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditCancel}
        review={editingReview}
        formData={editForm}
        onFormChange={handleEditFormChange}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      {/* 刪除評論確認 Dialog */}
      <DeleteReviewDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
