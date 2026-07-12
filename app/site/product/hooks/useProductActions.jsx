//app/site/product/hooks/useProductActions.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '../_components/toastProvider'

//  UPDATED: 新增 CartContext import
import { useCart } from '@/contexts/CartContext'

export function useProductActions(product) {
  const router = useRouter()
  const { user, isAuthenticated, setShowLoginModal } = useAuth() // 從 Context 取得使用者資料

  const { showToast } = useToast()

  //  UPDATED: 新增 CartContext hooks
  const { addToCart: addToCartDB, loading: cartLoading } = useCart()

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  /**
   * 檢查收藏狀態
   */
  useEffect(() => {
    const checkFavoriteStatus = async () => {

      try {
        if (!isAuthenticated || !user || !product?.product_id) {
          setIsCheckingFavorite(false)
          return
        }

        // 從 Context 取得 userId
        const userId = user.user_id || user.id

        if (!userId) {
          console.error(' [useProductActions] user 物件中沒有 user_id 或 id')
          setIsCheckingFavorite(false)
          return
        }

        const apiUrl = `${API_URL}/api/products/${product.product_id}/favorite/check?userId=${userId}`

        const response = await fetch(apiUrl, {
          credentials: 'include', // 重要：攜帶 httpOnly cookies
        })

        const result = await response.json()

        if (result.success) {
          setIsWishlisted(result.isFavorite)
        }
      } catch (error) {
        console.error(' [useProductActions] 檢查收藏狀態失敗:', error)
      } finally {
        setIsCheckingFavorite(false)
      }
    }

    checkFavoriteStatus()
  }, [product?.product_id, API_URL, user, isAuthenticated])

  /**
   * 切換收藏狀態
   */
  const handleWishlist = async () => {

    if (isTogglingFavorite) {
      return
    }

    try {
      setIsTogglingFavorite(true)

      // 檢查是否登入
      if (!isAuthenticated || !user) {
        showToast({
          title: '請先登入',
          description: '登入後才能使用收藏功能',
          variant: 'destructive',
        })
        setShowLoginModal(true) // 顯示登入視窗
        return
      }

      // 從 Context 取得 userId
      const userId = user.user_id || user.id

      if (!userId) {
        console.error(' [useProductActions] user 物件中沒有 user_id 或 id')
        showToast({
          title: '錯誤',
          description: '無法取得使用者 ID，請重新登入',
          variant: 'destructive',
        })
        return
      }

      const apiUrl = `${API_URL}/api/products/${product.product_id}/favorite`
      const requestBody = { userId }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include', // 重要：攜帶 httpOnly cookies
      })

      const result = await response.json()

      if (result.success) {
        setIsWishlisted(result.isFavorite)

        showToast({
          title: result.isFavorite ? '已加入收藏' : '已取消收藏',
          description: product.product_name,
        })
      } else {
        throw new Error(result.error || '操作失敗')
      }
    } catch (error) {
      console.error(' [useProductActions] 收藏操作失敗:', error)
      showToast({
        title: '操作失敗',
        description: error.message || '網路錯誤，請稍後再試',
        variant: 'destructive',
      })
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  /**
   * 加入購物車
   */
  const handleAddToCart = async (quantity = 1) => {
    if (product.stock_quantity <= 0) {
      showToast({
        title: '商品已售罄',
        description: '此商品目前缺貨中',
        variant: 'destructive',
      })
      return
    }

    //  UPDATED: 檢查登入狀態
    if (!isAuthenticated || !user) {
      showToast({
        title: '請先登入',
        description: '登入後即可加入購物車',
        variant: 'destructive',
      })
      setShowLoginModal(true) // 顯示登入視窗
      return
    }

    try {
      //  UPDATED: 使用 CartContext 加入購物車（儲存到資料庫）
      const result = await addToCartDB(product.product_id, parseInt(quantity))

      if (result.success) {
        showToast({
          title: '已加入購物車',
          description: `${product.product_name} x ${quantity}`,
        })

        // 觸發購物車更新事件
        window.dispatchEvent(new Event('cartUpdated'))
      } else {
        throw new Error(result.message || '加入購物車失敗')
      }
    } catch (error) {
      console.error(' [useProductActions] 加入購物車失敗:', error)
      showToast({
        title: '加入購物車失敗',
        description: error.message || '請稍後再試',
        variant: 'destructive',
      })
    }
  }

  /**
   * 分享商品
   */
  const handleShare = async () => {
    if (isSharing) return

    try {
      setIsSharing(true)

      const shareData = {
        title: product.product_name,
        text: product.description || `查看這個商品: ${product.product_name}`,
        url: window.location.href,
      }

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData)
          showToast({ title: '分享成功' })
        } catch (shareError) {
          if (shareError.name !== 'AbortError') {
            throw shareError
          }
        }
      } else {
        await navigator.clipboard.writeText(window.location.href)
        showToast({
          title: '連結已複製',
          description: '可以貼上分享給朋友',
        })
      }
    } catch (error) {
      console.error('分享失敗:', error)
      showToast({
        title: '分享失敗',
        description: '請稍後再試',
        variant: 'destructive',
      })
    } finally {
      setTimeout(() => {
        setIsSharing(false)
      }, 1000)
    }
  }

  return {
    isWishlisted,
    isSharing,
    isCheckingFavorite,
    isTogglingFavorite,
    cartLoading, //  UPDATED: 新增此項，讓元件知道購物車載入狀態
    handleWishlist,
    handleAddToCart,
    handleShare,
  }
}
