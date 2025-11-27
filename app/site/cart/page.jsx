/**
 * Shopping Cart Page
 * 路徑: app/site/cart/page.jsx
 */

'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import CartItem from './components/cart/CartItem'
import CartSummary from './components/cart/CartSummary'
import EmptyCart from './components/cart/EmptyCart'
import LoadingSpinner from './components/shared/LoadingSpinner'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { cartItems, summary, loading, error, updateQuantity, removeItem } =
    useCart()

  // 未登入處理
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-170px)] bg-background text-gray-800">
        <div className="ml-[70px] flex min-h-[calc(100vh-170px)] items-center justify-center md:ml-[100px]">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-medium">請先登入</h2>
            <p className="mb-5 text-gray-600">登入後即可查看購物車</p>
            <button
              onClick={() => router.push('/login')}
              className="rounded-lg bg-primary-500  px-8 py-3 text-white transition-colors hover:bg-primary-500/50"
            >
              前往登入
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 載入中
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-170px)] bg-primary-500 text-gray-800">
        <div className="ml-[70px] flex min-h-[calc(100vh-170px)] items-center justify-center md:ml-[100px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // 更新數量處理
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return

    const result = await updateQuantity(itemId, newQuantity)
    if (!result.success) {
      alert(result.message || '更新數量失敗')
    }
  }

  // 刪除商品處理
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('確定要移除此商品嗎?')) return

    const result = await removeItem(itemId)
    if (!result.success) {
      alert(result.message || '刪除商品失敗')
    }
  }

  // 前往結帳
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('購物車是空的!')
      return
    }
    router.push('/site/cart/checkout')
  }

  return (
    <div className="min-h-[calc(100vh-170px)] --color-secondary-200 text-gray-800">
      <div className="lg:mx-[70px] md:mx-[25px] py-8 px-2">
        <div className="mx-auto max-w-[1200px] p-5">
          {/* 頁面標題 */}
          <h1 className="mb-8 text-[28px] font-medium text-gray-800">
            購物車 {cartItems.length > 0 && `(${cartItems.length})`}
          </h1>

          {/* 錯誤訊息 */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* 購物車內容 */}
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="flex flex-col items-start gap-8 md:flex-row">
              {/* 商品列表 */}
              <div className="flex w-full flex-1 flex-col gap-5">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* 訂單摘要 */}
              <CartSummary
                summary={summary}
                onCheckout={handleCheckout}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
