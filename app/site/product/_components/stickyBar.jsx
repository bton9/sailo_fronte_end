// app/site/product/_components/stickyBar.jsx
'use client'

import { useEffect, useState } from 'react'

export default function StickyBar({
  product,
  quantity,
  onWishlist,
  onAddToCart,
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 組件掛載後觸發滑入動畫
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg transition-transform duration-500 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* 桌面版佈局 */}
        <div className="hidden md:flex items-center justify-between">
          {/* 左側：商品資訊 */}
          <div className="flex items-center gap-4">
            <img
              src={product.images?.[0]}
              className="h-12 w-12 object-cover rounded"
              alt={product.product_name}
            />
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-gray-900">
                {product.product_name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {product.description?.split('，').slice(0, 2).join('，')}
              </p>
            </div>
          </div>

          {/* 右側：價格和按鈕 */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xl font-medium text-gray-900">
                NT$ {Math.round(product.price).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onWishlist}
              className="px-6 py-2.5 border border-gray-900 text-gray-900 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              收藏
            </button>
            <button
              onClick={() => onAddToCart(quantity)}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              加入購物車
            </button>
          </div>
        </div>

        {/* 手機版佈局 (430px+) */}
        <div className="md:hidden">
          {/* 上半部：商品資訊和價格 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={product.images?.[0]}
                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded flex-shrink-0"
                alt={product.product_name}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {product.product_name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {product.description?.split('，').slice(0, 1).join('，')}
                </p>
              </div>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className="text-base sm:text-lg font-medium text-gray-900 whitespace-nowrap">
                NT$ {product.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 下半部：按鈕 */}
          <div className="flex gap-2">
            <button
              onClick={onWishlist}
              className="flex-1 px-4 py-2.5 border border-gray-900 text-gray-900 text-xs sm:text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              收藏
            </button>
            <button
              onClick={() => onAddToCart(quantity)}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}