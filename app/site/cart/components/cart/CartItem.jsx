/**
 * CartItem - 購物車項目元件
 * 路徑: app/site/shop/components/cart/CartItem.jsx
 */

'use client'

import QuantityControl from './QuantityControl'

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled,
}) {
  return (
    <div className="relative flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm md:flex-row md:items-end">
      {/* 商品圖片 */}
      <div className="h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-[#e8e5e0]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#e8e5e0]" />
        )}
      </div>

      {/* 商品詳情 */}
      <div className="flex flex-1 flex-col justify-start text-center md:text-left">
        <div className="mb-2 text-lg font-medium text-gray-800">
          {item.name}
        </div>

        {item.description && (
          <div className="mb-4 text-sm text-gray-600">{item.description}</div>
        )}

        {/* 數量控制 */}
        <div className="flex items-center gap-4 justify-center md:justify-start">
          <span className="text-sm text-gray-600">數量:</span>
          <QuantityControl
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={disabled}
            max={item.stockQuantity || 99}
          />
        </div>

        {/* 庫存提示 */}
        {item.stockQuantity && item.stockQuantity < 10 && (
          <div className="mt-2 text-xs text-orange-600">
            僅剩 {item.stockQuantity} 件
          </div>
        )}
      </div>

      {/* 單價 */}
      <div className="flex min-w-[100px] flex-col justify-end text-center md:text-right">
        <div className="mb-1 text-[13px] text-gray-400">單價</div>
        <div className="text-xl font-medium text-gray-800">
          NT$ {item.unitPrice.toLocaleString()}
        </div>
      </div>

      {/* 刪除按鈕 */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={disabled}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-none bg-transparent text-gray-400 transition-colors hover:bg-[#f5f3ef] hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 md:right-4 md:top-4"
        aria-label="刪除商品"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  )
}
