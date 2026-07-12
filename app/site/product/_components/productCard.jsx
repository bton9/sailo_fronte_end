'use client'

import { useRouter } from 'next/navigation'
import { Card } from './card'
import Badge from './badge'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotify } from '@/contexts/NotificationContext'

const ProductCard = ({
  id, // 商品 ID
  name,
  price,
  category,
  image,
  rating,
  favoriteCount,
  reviewCount,
  initialIsFavorite = false,
  onFavoriteToggle,
}) => {
  const router = useRouter()
  const { user, isAuthenticated, setShowLoginModal } = useAuth()
  const notify = useNotify()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  /**
   * 組件載入時檢查收藏狀態
   */
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // 如果沒有登入或沒有商品 ID，跳過檢查
      if (!isAuthenticated || !user || !id) {
        return
      }

      const userId = user.user_id || user.id
      if (!userId) return

      try {
        setIsCheckingFavorite(true)

        const response = await fetch(
          `${API_URL}/api/products/${id}/favorite/check?userId=${userId}`,
          {
            credentials: 'include',
          }
        )

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setIsFavorite(result.isFavorite)
          }
        }
      } catch (error) {
        console.error(' 檢查收藏狀態失敗:', error)
      } finally {
        setIsCheckingFavorite(false)
      }
    }

    checkFavoriteStatus()
  }, [id, user, isAuthenticated, API_URL]) // 依賴這些值變化時重新檢查

  // 處理收藏按鈕點擊
  const handleFavoriteClick = async (e) => {
    e.stopPropagation()

    if (isLoading) return

    // 檢查是否登入
    if (!isAuthenticated || !user) {
      setShowLoginModal(true)
      return
    }

    // 從 Context 取得 userId
    const userId = user.user_id || user.id

    if (!userId) {
      console.error(' user 物件中沒有 user_id 或 id')
      notify('無法取得使用者 ID，請重新登入', 'error')
      return
    }

    const newFavoriteState = !isFavorite

    try {
      setIsLoading(true)
      setIsAnimating(true)

      // 樂觀更新 UI
      setIsFavorite(newFavoriteState)

      const apiUrl = `${API_URL}/api/products/${id}/favorite`
      const requestBody = { userId }

      // 呼叫 API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '操作失敗')
      }

      // 使用 API 返回的實際狀態
      setIsFavorite(result.isFavorite)

      // 呼叫父組件的回調函式（如果有的話）
      if (onFavoriteToggle) {
        onFavoriteToggle(id, result.isFavorite)
      }
    } catch (error) {
      console.error(' 收藏操作失敗:', error)
      // 恢復原狀態
      setIsFavorite(!newFavoriteState)
      notify(`收藏操作失敗：${error.message}`, 'error')
    } finally {
      setIsLoading(false)
      // 動畫結束後重置
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  // 處理卡片點擊 - 導航到商品細節頁
  const handleCardClick = () => {
    if (id) {
      router.push(`/site/product/${id}`)
    }
  }

  return (
    <Card
      className="group border-0 bg-transparent overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[3/4] bg-secondary mb-4 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-105"
        />
        {/* 左上角 - HOT/NEW 標籤 */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {reviewCount > 1 && (
            <Badge variant="solid" color="hot" size="sm" className="shadow-lg">
              熱門品項
            </Badge>
          )}
        </div>
      </div>

      <div className="relative space-y-2 px-2">
        <h3 className="text-sm font-medium tracking-wide uppercase">{name}</h3>
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading || isCheckingFavorite}
          className={`
            absolute top-0 right-1
            flex items-center justify-center
            rounded-full
            transition-all duration-300
            hover:scale-110
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          aria-label={isFavorite ? '取消收藏' : '加入收藏'}
        >
          <Heart
            className={`
              w-5 h-5 
              transition-all duration-300
              ${
                isFavorite
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'fill-none text-gray-400 hover:text-red-400'
              }
              ${isCheckingFavorite ? 'opacity-50' : ''}
            `}
          />
        </button>
        <p className="text-xs text-muted-foreground">
          ★ {rating} ({reviewCount})
        </p>

        <p className="text-sm font-medium pt-2">NT${price.toLocaleString()}</p>
      </div>
    </Card>
  )
}

export default ProductCard
