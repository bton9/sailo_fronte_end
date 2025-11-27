// 商品資訊區
// components/ProductInfo.jsx
import { useState } from 'react'
import { Button } from './button'
import { Card } from './card'
import { useToast } from './toastProvider'

// ✅ UPDATED: 新增 CartContext 和 AuthContext (取代 cartUtils)
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import RIC_fi from '@/lib/react_icon/fi'
import StarRating from './starRating'
import SideCart from '@/components/sideCart'

export default function ProductInfo({
  product,
  quantity,
  onQuantityChange,
  isWishlisted,
  isSharing,
  onWishlist,
  onShare,
  onAddToCart,
  onBuyNow,
  formatPrice,
  formatDate,
}) {
  const { showToast } = useToast()

  // ✅ UPDATED: 新增 CartContext hooks (用於資料庫操作)
  const { addToCart, loading } = useCart()

  // ✅ UPDATED: 新增 AuthContext hook (用於檢查登入狀態)
  const { isAuthenticated } = useAuth()

  // 控制購物車側邊欄的狀態
  const [isCartOpen, setIsCartOpen] = useState(false)

  // ✅ UPDATED: 新增 isAdding 狀態 (用於顯示載入動畫)
  const [isAdding, setIsAdding] = useState(false)

  // ✅ UPDATED: 完全重寫此函式以使用 CartContext + 資料庫
  // 舊版: 使用 localStorage 的 addToCart(product, quantity)
  // 新版: 使用 CartContext 的 async addToCart(productId, quantity)
  const handleAddToCart = async () => {
    // ✅ UPDATED: 新增登入檢查
    if (!isAuthenticated) {
      showToast({
        title: '請先登入',
        description: '登入後即可加入購物車',
        type: 'error',
      })
      return
    }

    // ✅ UPDATED: 新增商品資料檢查，支援多種 ID 欄位名稱
    const productId = product?.product_id || product?.id
    if (!productId) {
      showToast({
        title: '錯誤',
        description: '商品資料錯誤',
        type: 'error',
      })
      return
    }

    // ✅ UPDATED: 使用 try-catch 處理 async 操作
    try {
      setIsAdding(true) // ✅ UPDATED: 顯示載入狀態

      // ✅ UPDATED: 呼叫 CartContext.addToCart (儲存到資料庫)
      // 舊版: const result = addToCart(product, parseInt(quantity))
      // 新版: const result = await addToCart(productId, parseInt(quantity))
      const result = await addToCart(productId, parseInt(quantity))

      if (result.success) {
        // 顯示成功訊息 (保持原有邏輯)
        showToast({
          title: '已加入購物車',
          description: `${product.product_name} 已加入購物車！`,
          type: 'success',
        })

        // 打開側邊購物車 (保持原有邏輯)
        setIsCartOpen(true)

      } else {
        // ✅ UPDATED: 新增錯誤訊息處理
        showToast({
          title: '加入失敗',
          description: result.message || '無法加入購物車，請稍後再試',
          type: 'error',
        })
      }
    } catch (error) {
      // ✅ UPDATED: 新增 catch 錯誤處理
      console.error('加入購物車失敗:', error)
      showToast({
        title: '加入失敗',
        description: '發生錯誤，請稍後再試',
        type: 'error',
      })
    } finally {
      // ✅ UPDATED: 確保載入狀態會被重置
      setIsAdding(false)
    }
  }

  // ✅ UPDATED: 新增登入檢查
  const handleBuyNow = () => {
    // ✅ UPDATED: 檢查登入狀態 (新增)
    if (!isAuthenticated) {
      showToast({
        title: '請先登入',
        description: '登入後即可購買商品',
        type: 'error',
      })
      return
    }

    // 執行原有的購買流程 (保持原有邏輯)
    if (onBuyNow) {
      onBuyNow()
    }

    showToast({
      title: '開始購買流程',
      description: `準備購買：${product.product_name}`,
      type: 'info',
    })
  }

  return (
    <>
      <div className="lg:sticky lg:top-20 space-y-6">
        {/* 產品標題與分類 */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-luxury text-foreground mb-2">
                {product.product_name}
              </h1>
              {product.category_name && (
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.category_name}
                </p>
              )}
            </div>

            {/* 收藏與分享按鈕 */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onWishlist}
                className={
                  isWishlisted ? 'text-red-500' : 'text-muted-foreground'
                }
              >
                <RIC_fi.FiHeart
                  className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                disabled={isSharing}
                className="text-muted-foreground"
              >
                {isSharing ? (
                  <RIC_fi.FiLoader className="h-5 w-5 animate-spin" />
                ) : (
                  <RIC_fi.FiShare2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* 評分 */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={parseFloat(product.avg_rating)} />
              <span className="text-sm text-muted-foreground">
                {parseFloat(product.avg_rating).toFixed(1)} (
                {product.review_count} 則評論)
              </span>
            </div>
          )}
        </div>

        {/* 價格與庫存 */}
        <div className="border-b border-border pb-6 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-luxury text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            庫存:{' '}
            {product.stock_quantity > 0
              ? `${product.stock_quantity} 件`
              : '已售罄'}
          </p>
          {product.favorite_count > 0 && (
            <p className="text-sm text-muted-foreground">
              {product.favorite_count} 人收藏此商品
            </p>
          )}
        </div>

        {/* 商品描述 */}
        {product.description && (
          <div className="space-y-2">
            <h3 className="font-elegant text-sm uppercase tracking-wider text-foreground">
              商品描述
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* 數量選擇 */}
        <div className="space-y-2">
          <h3 className="font-elegant text-sm uppercase tracking-wider text-foreground">
            數量
          </h3>
          <Select value={quantity} onValueChange={onQuantityChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem
                  className="bg-secondary-200"
                  key={num}
                  value={num.toString()}
                  disabled={num > product.stock_quantity}
                >
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-3 pt-4">
          {/* ✅ UPDATED: 按鈕新增 isAdding 和 loading 狀態 */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0 || isAdding || loading} // ✅ UPDATED: 新增 isAdding 和 loading 判斷
            className="w-full bg-primary border text-primary-foreground hover:bg-primary/90 font-elegant uppercase tracking-wider py-6"
          >
            {/* ✅ UPDATED: 新增載入狀態顯示 */}
            {isAdding ? (
              <>
                <RIC_fi.FiLoader className="h-5 w-5 mr-2 animate-spin" />
                加入中...
              </>
            ) : (
              <>
                <RIC_fi.FiShoppingCart className="h-5 w-5 mr-2" />
                {product.stock_quantity > 0 ? '加入購物車' : '已售罄'}
              </>
            )}
          </Button>

          {/* ✅ UPDATED: 新增 loading 狀態判斷 */}
          <Button
            onClick={handleBuyNow}
            variant="outline"
            className="w-full font-elegant uppercase tracking-wider py-6"
            disabled={product.stock_quantity <= 0 || loading} // ✅ UPDATED: 新增 loading 判斷
          >
            立即購買
          </Button>
        </div>

        {/* 商品資訊卡片 */}
        <Card className="p-6">
          <h3 className="font-elegant text-sm uppercase tracking-wider text-foreground mb-4">
            商品資訊
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-elegant text-sm text-muted-foreground">
                分類
              </span>
              <span className="font-elegant text-sm text-foreground">
                {product.category_name || '未分類'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-elegant text-sm text-muted-foreground">
                上架日期
              </span>
              <span className="font-elegant text-sm text-foreground">
                {formatDate(product.created_at)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ✅ UNCHANGED: 購物車側邊欄 (但內部 sideCart.jsx 已更新為使用 CartContext) */}
      <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
