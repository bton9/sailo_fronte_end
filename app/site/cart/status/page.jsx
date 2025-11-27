/**
 * Order Status Page - 訂單成功頁面
 * 路徑: app/site/cart/status/page.jsx
 *
 * 功能: 顯示訂單成功訊息（從外部付款網站返回後）
 * 注意: 不串接 API，所有資料透過 URL 參數傳遞
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 從 URL 取得所有必要參數
  const createdAt = searchParams.get('createdAt') || new Date().toISOString()

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen lg:mx-[70px] md:mx-[25px] py-8 px-2">
        <div className="mx-auto max-w-[1200px] p-5">
          {/* 成功動畫容器 */}
          <div
            className={`transition-all duration-500 ease-out ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-5 opacity-0'
            }`}
          >
            {/* 頂部成功訊息 */}
            <div className="mb-8 p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500">
                <svg className="h-10 w-10 fill-white" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <h1 className="mb-3 text-[28px] font-medium text-gray-800">
                付款完成
              </h1>
              <p className="text-gray-600">
                感謝您的訂購！您的付款已成功完成，我們將盡快為您處理訂單。
              </p>
            </div>

            {/* 主要內容區 */}
            <div className="grid lg:grid-cols-1">
              {/* 左側：訂單詳情 */}
              <div className="lg:col-span-2">
                {/* 訂單基本資訊 */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-xl font-medium text-gray-800">
                    訂單資訊
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600">訂單編號</span>
                      <span className="text-lg font-medium text-primary-500">
                        #000000000
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600">訂單日期</span>
                      <span className="font-medium text-gray-800">
                        {new Date(createdAt).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600">付款方式</span>
                      <span className="font-medium text-gray-800">
                        ECPay 線上付款
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">付款狀態</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        已付款
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右側：提示與操作 */}
              <div className="space-y-6">
                {/* 接下來的步驟 */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-5 text-lg font-medium text-gray-800">
                    接下來會發生什麼？
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white">
                        1
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-gray-800">訂單確認</p>
                        <p className="mt-1 text-sm text-gray-600">
                          我們正在準備您的訂單，預計在 1
                          個工作天內完成出貨準備。
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white">
                        2
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-gray-800">商品配送</p>
                        <p className="mt-1 text-sm text-gray-600">
                          訂單出貨後，您將收到包含物流追蹤號碼的通知信件。
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white">
                        3
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-gray-800">送達收件</p>
                        <p className="mt-1 text-sm text-gray-600">
                          預計 3-5 個工作天送達您指定的地址。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 客服資訊 */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-2 font-medium text-gray-800">需要協助？</h3>
                  <p className="mb-3 text-sm text-gray-600">
                    如有任何問題，歡迎聯絡我們的客服團隊。
                  </p>
                  <p className="text-sm font-medium text-primary-500">
                    support@example.com
                  </p>
                </div>

                {/* 操作按鈕 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/site/product/list')}
                    className="w-full bg-primary-500 rounded-md border text-white hover:bg-[#f5f3ef] font-elegant uppercase tracking-wider py-6"
                  >
                    繼續購物
                  </button>
                  <button
                    onClick={() => router.push('/site/cart/orders')}
                    className="w-full bg-primary rounded-md border text-primary-foreground hover:bg-primary/90 font-elegant uppercase tracking-wider py-6"
                  >
                    查看訂單詳情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
