/**
 * QuantityControl - 數量控制元件
 * 路徑: app/site/shop/components/cart/QuantityControl.jsx
 */

'use client'

export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
  min = 1,
  max = 99,
}) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#d4d1cc] bg-white transition-all hover:border-primary-500 hover:bg-[#f5f3ef] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="減少數量"
      >
        −
      </button>

      <span className="min-w-[30px] text-center font-medium">{quantity}</span>

      <button
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#d4d1cc] bg-white transition-all hover:border-primary-500 hover:bg-[#f5f3ef] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="增加數量"
      >
        +
      </button>
    </div>
  )
}
