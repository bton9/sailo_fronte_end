// 購物車側邊欄元件 - 使用 CartContext 從資料庫載入
//  UPDATED: 完全重寫以使用 CartContext

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useConfirm } from '@/contexts/ConfirmContext'

/**
 * Shopping Cart Sidebar Component
 *  所有列表都有正確的 key prop
 */

export default function CartSidebar({ isOpen, onClose }) {
  const router = useRouter()
  const confirmAction = useConfirm()

  //  UPDATED: 使用 CartContext 取代 localStorage
  const {
    items: cartItems = [], // 購物車項目 (預設空陣列)
    loading, // 載入狀態
    fetchCart, // 重新載入購物車
    updateQuantity, // 更新數量
    removeItem, // 移除項目
    clearCart, // 清空購物車
  } = useCart()

  //  UPDATED: 當側邊欄打開時，重新載入購物車
  useEffect(() => {
    if (isOpen) {
      fetchCart()
    }
  }, [isOpen, fetchCart])

  //  UPDATED: 監聽購物車更新事件
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [fetchCart])

  //  UPDATED: 計算總金額（使用資料庫的即時價格）
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // 支援兩種資料結構
      const price = item.unitPrice || item.unit_price || item.price || 0
      const quantity = item.quantity || 0
      return total + price * quantity
    }, 0)
  }

  //  UPDATED: 更新數量（調用 CartContext 的 API）
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Update quantity failed:', error)
    }
  }

  //  UPDATED: 移除項目（調用 CartContext 的 API）
  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId)
    } catch (error) {
      console.error('Remove item failed:', error)
    }
  }

  //  UPDATED: 清空購物車（調用 CartContext 的 API）
  const handleClearCart = async () => {
    if (await confirmAction('確定要清空購物車嗎？')) {
      try {
        await clearCart()
      } catch (error) {
        console.error('Clear cart failed:', error)
      }
    }
  }

  const handleCheckout = () => {
    router.push('/site/cart/checkout')
    onClose()
  }

  const handleViewCart = () => {
    router.push('/site/cart')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[100] ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-xl font-medium text-gray-900">
              購物車 ({cartItems.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ height: 'calc(100vh - 240px)' }}
        >
          {/*  UPDATED: 顯示載入狀態 */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500"></div>
              <p className="mt-4 text-sm text-gray-500">載入中...</p>
            </div>
          ) : cartItems.length === 0 ? (
            // Empty Cart
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="mb-4 h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="mb-2 text-lg font-medium text-gray-900">
                購物車是空的
              </p>
              <p className="text-sm text-gray-500">快去挑選喜歡的商品吧！</p>
            </div>
          ) : (
            // Cart Items List
            <div className="space-y-4">
              {cartItems.map((item) => {
                //  UPDATED: 支援多種資料結構
                const itemId = item.id || item.cart_detail_id
                const productId = item.productId || item.product_id
                const productName = item.name || item.product_name
                const imageUrl = item.imageUrl || item.image_url || item.image
                const unitPrice =
                  item.unitPrice || item.unit_price || item.price
                const quantity = item.quantity || 1

                return (
                  <div
                    key={itemId} //  使用購物車項目 ID 作為 key
                    className="flex gap-4 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    {/* Product Image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {productName}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(itemId)}
                          className="ml-2 text-gray-400 transition-colors hover:text-red-500"
                          disabled={loading}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(itemId, quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                            disabled={loading || quantity <= 1}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(itemId, quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                            disabled={loading}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary-500">
                            NT$ {(unitPrice * quantity).toLocaleString()}
                          </p>
                          {quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              NT$ {unitPrice.toLocaleString()} / 個
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">總計</span>
              <span className="text-2xl font-bold text-primary-500">
                NT$ {calculateTotal().toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-500/90 disabled:opacity-50"
                disabled={loading}
              >
                前往結帳
              </button>
              <button
                onClick={handleViewCart}
                className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                查看購物車
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
