/**
 * EmptyCart - 空購物車元件
 * 路徑: app/site/shop/components/cart/EmptyCart.jsx
 */

'use client'

import Link from 'next/link'

export default function EmptyCart() {
  return (
    <div className="rounded-xl bg-white px-5 py-16 text-center">
      {/* 購物車圖標 */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f3ef]">
        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-gray-400">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </div>

      {/* 文字說明 */}
      <h2 className="mb-2 text-2xl font-medium">購物車是空的</h2>
      <p className="mb-5 text-gray-600">快去挑選喜歡的商品吧!</p>

      {/* 開始購物按鈕 */}
      <Link
        href="/site/product/list"
        className="inline-block rounded-lg border-none bg-primary-500 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-primary-500/90"
      >
        開始購物
      </Link>
    </div>
  )
}
