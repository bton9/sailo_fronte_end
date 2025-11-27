/**
 * OrderSummary - 結帳頁面的訂單摘要
 * 路徑: app/site/shop/components/checkout/OrderSummary.jsx
 */

'use client'
import Link from 'next/link'

export default function OrderSummary({
  cartItems,
  summary,
  shippingMethod,
  loading,
}) {
  // 計算配送費用
  const shippingFee = shippingMethod === 'express' ? 150 : 80
  const finalShipping = summary.subtotal >= 1000 ? 0 : shippingFee
  const finalTotal = summary.subtotal + finalShipping

  return (
    <div className="w-full rounded-xl bg-white p-6 shadow-sm md:sticky md:top-5 md:w-[400px]">
      <h2 className="mb-5 text-xl font-medium text-gray-800">訂單摘要</h2>

      {/* 商品列表 */}
      <div className="mb-5 max-h-[300px] space-y-3 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#e8e5e0]">
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
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                {item.name}
              </div>
              <div className="text-xs text-gray-600">數量: {item.quantity}</div>
            </div>
            <div className="text-sm font-medium text-gray-800">
              NT$ {(item.unitPrice * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* 分隔線 */}
      <div className="my-5 h-px bg-[#e8e5e0]" />

      {/* 金額明細 */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>商品小計</span>
          <span>NT$ {summary.subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>運費</span>
          <span>
            {finalShipping === 0 ? (
              <span className="text-green-600">免運費</span>
            ) : (
              `NT$ ${finalShipping.toLocaleString()}`
            )}
          </span>
        </div>

        <div className="h-px bg-[#e8e5e0]" />

        <div className="flex justify-between text-xl font-medium text-gray-800">
          <span>總計</span>
          <span>NT$ {finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* 提交按鈕 */}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg border-none bg-primary-500 py-4 text-base font-medium text-white transition-colors hover:bg-primary-500/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '處理中...' : '確認訂單並付款'}
      </button>

      {/* 繼續購物連結 */}
      <Link
        href="/site/cart"
        className="mt-2.5 block w-full rounded-lg border border-[#d4d1cc] bg-transparent py-3 text-center text-[15px] text-gray-600 transition-all hover:border-primary-500 hover:bg-[#f5f3ef]"
      >
        返回購物車
      </Link>

      {/* 安全提示 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        🔒 您的付款資訊將受到保護
      </div>
    </div>
  )
}
