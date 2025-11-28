/**
 * OrderCard - 訂單卡片元件
 * 路徑: app/site/components/shop/order/OrderCard.jsx
 */

'use client'

import { useRouter } from 'next/navigation'

export default function OrderCard({ order }) {
  const router = useRouter()

  const statusStyles = {
    ordered: 'bg-green-200 text-green-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-600', //  FIXED: 'completed' not 'delivered'
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusText = {
    ordered: '已下單',
    processing: '處理中',
    shipped: '配送中',
    delivered: '已送達', //  FIXED
    cancelled: '已取消',
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* 訂單標題 */}
      <div className="flex flex-col justify-between border-b border-[#e8e5e0] pb-4 md:flex-row md:items-center">
        <div className="mb-3 flex flex-col gap-2 md:mb-0 md:flex-row md:items-center md:gap-5">
          <div className="text-lg font-medium text-gray-900">
            {order.orderNumber}
          </div>
          <div className="text-sm text-gray-400">
            {order.date || new Date(order.createdAt).toLocaleString('zh-TW')}
          </div>
        </div>
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-xs font-medium ${
            statusStyles[order.status]
          }`}
        >
          {statusText[order.status] || order.statusText || '未知狀態'}
        </span>
      </div>

      {/* 訂單商品 */}
      <div className="my-5 divide-y divide-[#e8e5e0]">
        {order.items &&
          order.items.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-4 py-4 md:flex-row md:items-center"
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#e8e5e0]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name || item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#e8e5e0]" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {item.name || item.productName}
                </div>
                {item.description && (
                  <div className="my-1 text-sm text-gray-400">
                    {item.description}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  數量：{item.quantity}
                </div>
              </div>
              <div className="text-base font-medium text-gray-900 md:ml-4">
                NT$ {(item.unitPrice * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        {order.items && order.items.length > 3 && (
          <div className="py-3 text-center text-sm text-gray-500">
            還有 {order.items.length - 3} 項商品...
          </div>
        )}
      </div>

      {/* 訂單總額與操作按鈕 */}
      <div className="flex flex-col items-start justify-between gap-4 border-t border-[#e8e5e0] pt-4 md:flex-row md:items-center">
        <div>
          <span className="mr-2 text-sm text-gray-600">訂單總額：</span>
          <span className="text-xl font-medium text-gray-900">
            NT$ {order.total.toLocaleString()}
          </span>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <button
            onClick={() => router.push(`/site/cart/orders/${order.id}`)}
            className="w-full rounded-lg border border-[#d4d1cc] bg-transparent px-6 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:bg-primary-500 md:w-auto"
          >
            查看詳情
          </button>

          {order.status === 'shipped' && (
            <button
              onClick={() => alert('物流追蹤功能開發中')}
              className="w-full rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-500/90 md:w-auto"
            >
              追蹤物流
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
