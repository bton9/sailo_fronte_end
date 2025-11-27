// hooks/useReviewActions.jsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '../_components/toastProvider'

export function useReviewActions(
  productId,
  onReviewAdded,
  onReviewUpdated,
  onReviewDeleted,
  checkPermission
) {
  const { user, isAuthenticated, token } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast() // 新增這一行

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // 提交新評論
  const submitReview = async (rating, title, comment) => {
    if (!isAuthenticated) {
      showToast({
        title: '請先登入',
        description: '登入後即可發表評論',
        type: 'error',
      })
      router.push('/login')
      return false
    }

    if (!comment.trim()) {
      showToast({
        title: '請輸入評論內容',
        type: 'error',
      })
      return false
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `${API_URL}/api/products/${productId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            rating,
            title,
            comment,
          }),
        }
      )

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('後端 API 路由未配置: POST /api/products/:id/reviews')
      }

      const data = await response.json()

      if (data.success) {
        showToast({
          title: '評論提交成功！',
          description: '感謝您的回饋！',
          type: 'success',
        })

        if (onReviewAdded) {
          onReviewAdded(data.data)
        }
        if (checkPermission) {
          checkPermission()
        }
        return true
      } else {
        showToast({
          title: '提交失敗',
          description: data.error || '請稍後再試',
          type: 'error',
        })
        if (response.status === 401 || response.status === 403) {
          setTimeout(() => router.push('/login'), 1500)
        }
        return false
      }
    } catch (error) {
      console.error('提交評論失敗:', error)
      showToast({
        title: '提交失敗',
        description: error.message,
        type: 'error',
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新評論
  const updateReview = async (reviewId, rating, title, comment) => {
    if (!comment.trim()) {
      showToast({
        title: '請輸入評論內容',
        type: 'error',
      })
      return false
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          rating,
          title,
          comment,
        }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('後端 API 路由未配置: PUT /api/reviews/:id')
      }

      const data = await response.json()

      if (data.success) {
        showToast({
          title: '評論更新成功！',
          type: 'success',
        })

        if (onReviewUpdated) {
          onReviewUpdated(data.data)
        }

        return true
      } else {
        showToast({
          title: '更新失敗',
          description: data.error || '請稍後再試',
          type: 'error',
        })
        return false
      }
    } catch (error) {
      console.error('更新評論失敗:', error)
      showToast({
        title: '更新失敗',
        description: error.message,
        type: 'error',
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // 刪除評論
  const deleteReview = async (reviewId) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('後端 API 路由未配置: DELETE /api/reviews/:id')
      }

      const data = await response.json()

      if (data.success) {
        showToast({
          title: '評論已刪除',
          type: 'success',
        })

        if (onReviewDeleted) {
          onReviewDeleted(reviewId)
        }
        if (checkPermission) {
          checkPermission()
        }
        return true
      } else {
        showToast({
          title: '刪除失敗',
          description: data.error || '請稍後再試',
          type: 'error',
        })
        return false
      }
    } catch (error) {
      console.error('刪除評論失敗:', error)
      showToast({
        title: '刪除失敗',
        description: error.message,
        type: 'error',
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    submitReview,
    updateReview,
    deleteReview,
  }
}
