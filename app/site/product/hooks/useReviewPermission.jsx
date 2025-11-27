// 檢查用戶評論權限
// hooks/useReviewPermission.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useReviewPermission(productId) {
  const { user, isAuthenticated, token } = useAuth()
  const [canReview, setCanReview] = useState(null)
  const [isCheckingPermission, setIsCheckingPermission] = useState(false)

  const checkReviewPermission = async () => {
    if (!isAuthenticated || !user?.id) {
      setCanReview({
        canReview: false,
        reason: '請先登入',
        hasReviewed: false,
        userId: null,
      })
      return
    }

    setIsCheckingPermission(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(
        `${API_URL}/api/products/${productId}/reviews/permission?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API 路由錯誤或不存在')
      }

      const data = await response.json()

      if (response.ok) {
        setCanReview(data)
      } else {
        setCanReview({
          canReview: false,
          reason: data.error || '無法檢查權限',
          hasReviewed: false,
          userId: user.id,
        })
      }
    } catch (error) {
      console.error('檢查評論權限失敗:', error)
      setCanReview({
        canReview: false,
        reason: '伺服器錯誤',
        hasReviewed: false,
        userId: user.id,
      })

      toast({
        title: 'API 錯誤',
        description: '無法連接到評論服務',
        variant: 'destructive',
      })
    } finally {
      setIsCheckingPermission(false)
    }
  }

  useEffect(() => {
    if (productId && isAuthenticated) {
      checkReviewPermission()
    }
  }, [productId, isAuthenticated, user?.id])

  return {
    canReview,
    setCanReview,
    isCheckingPermission,
    checkReviewPermission,
  }
}
