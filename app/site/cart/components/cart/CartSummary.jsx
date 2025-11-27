/**
 * CartSummary - 購物車摘要元件
 * 路徑: app/site/shop/components/cart/CartSummary.jsx
 */

'use client'

import Link from 'next/link'

export default function CartSummary({ summary, onCheckout, loading }) {
  const { subtotal, shipping, total } = summary

  return (
    <div className="w-full rounded-xl bg-white p-6 shadow-sm md:sticky md:top-5 md:w-[350px]">
      <div className="mb-5 text-lg font-medium text-gray-800">訂單摘要</div>

      {/* 小計 */}
      <div className="mb-3 flex justify-between text-[15px] text-gray-600">
        <span>商品小計</span>
        <span>NT$ {subtotal.toLocaleString()}</span>
      </div>

      {/* 運費 */}
      <div className="mb-3 flex justify-between text-[15px] text-gray-600">
        <span>運費</span>
        <span>
          {shipping === 0 ? (
            <span className="text-green-600">免運費</span>
          ) : (
            `NT$ ${shipping.toLocaleString()}`
          )}
        </span>
      </div>

      {/* 分隔線 */}
      <div className="my-5 h-px bg-[#e8e5e0]" />

      {/* 總計 */}
      <div className="flex justify-between text-xl font-medium text-gray-800">
        <span>總計</span>
        <span>NT$ {total.toLocaleString()}</span>
      </div>

      {/* 結帳按鈕 */}
      <button
        onClick={onCheckout}
        disabled={loading}
        className="mt-5 w-full rounded-lg border-none bg-primary-500 py-4 text-base font-medium text-white transition-colors hover:bg-primary-500/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '處理中...' : '前往結帳'}
      </button>

      {/* 繼續購物連結 */}
      <Link
        href="/site/product/list"
        className="mt-2.5 block w-full rounded-lg border border-[#d4d1cc] bg-transparent py-3 text-center text-[15px] text-gray-600 transition-all hover:border-primary-500 hover:bg-[#f5f3ef]"
      >
        繼續購物
      </Link>
    </div>
  )
}
