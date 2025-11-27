/**
 * Order Detail Page - 訂單詳情頁面
 * 路徑: app/site/orders/[orderId]/page.jsx
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { orderAPI } from '@/lib/cartApi'
import OrderStatus from '../../components/order/OrderStatus'
import OrderTimeline from '../../components/order/OrderTimeline'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const orderId = params.orderId

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  // 載入訂單詳情
  useEffect(() => {
    const loadOrder = async () => {
      if (!isAuthenticated || !orderId) {
        return
      }

      try {
        setLoading(true)
        const response = await orderAPI.getOrder(orderId)

        if (response.success) {
          setOrder(response.data)
        } else {
          alert('無法載入訂單資訊')
          router.push('/site/cart/orders')
        }
      } catch (error) {
        console.error('載入訂單失敗:', error)
        alert('載入訂單失敗')
        router.push('/site/cart/orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [isAuthenticated, orderId, router])

  // 未登入處理
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-500">
        <div className="ml-[70px] flex min-h-screen items-center justify-center md:ml-[100px]">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-medium">請先登入</h2>
            <button
              onClick={() => router.push('/login')}
              className="rounded-lg bg-primary-500 px-8 py-3 text-white transition-colors hover:bg-primary-500/90"
            >
              前往登入
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 載入中
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-500">
        <div className="ml-[70px] flex min-h-screen items-center justify-center md:ml-[100px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="ml-[70px] min-h-screen py-8 md:ml-[100px] md:px-8">
        <div className="container mx-auto max-w-7xl px-4">
          {/* 返回按鈕 */}
          <button
            onClick={() => router.push('/site/cart/orders')}
            className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-primary-500"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回訂單列表
          </button>

          {/* 頁面標題 */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-medium text-gray-900">
                訂單詳情
              </h1>
              <p className="text-gray-600">訂單編號: #{order.orderNumber}</p>
            </div>
            <OrderStatus status={order.status} />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* 左側: 訂單資訊 */}
            <div className="space-y-8 lg:col-span-2">
              {/* 訂單商品 */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-medium text-gray-800">
                  訂單商品
                </h2>
                <div className="divide-y divide-[#e8e5e0]">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-start gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#e8e5e0]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#e8e5e0]" />
                        )}
                      </div>
                      <div className="flex-1">
                        {item.productName && (
                          <div className="mb-1 text-lg font-medium text-gray-900">
                            {item.productName}
                          </div>
                        )}
                        {item.description && (
                          <div className="mb-2 text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          單價: NT$ {(item.unitPrice || 0).toLocaleString()} ×{' '}
                          {item.quantity || 0}
                        </div>
                      </div>
                      <div className="text-xl font-medium text-gray-900">
                        NT${' '}
                        {(
                          (item.unitPrice || 0) * (item.quantity || 0)
                        ).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 金額明細 */}
                <div className="mt-6 space-y-3 border-t border-[#e8e5e0] pt-6">
                  <div className="flex justify-between text-gray-600">
                    <span>商品小計</span>
                    <span>NT$ {(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>運費</span>
                    <span>NT$ {(order.shipping || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-medium text-gray-900">
                    <span>訂單總額</span>
                    <span>NT$ {(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 收件資訊 */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-medium text-gray-800">
                  收件資訊
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="w-24 text-gray-600">收件人:</span>
                    <span className="font-medium text-gray-900">
                      {order.shippingInfo.recipientName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-600">聯絡電話:</span>
                    <span className="font-medium text-gray-900">
                      {order.shippingInfo.phone}
                    </span>
                  </div>
                  {order.shippingInfo.email && (
                    <div className="flex">
                      <span className="w-24 text-gray-600">電子郵件:</span>
                      <span className="font-medium text-gray-900">
                        {order.shippingInfo.email}
                      </span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="w-24 text-gray-600">配送地址:</span>
                    <span className="font-medium text-gray-900">
                      {order.shippingInfo.zipCode &&
                        `${order.shippingInfo.zipCode} `}
                      {order.shippingInfo.city}
                      {order.shippingInfo.district}
                      {order.shippingInfo.detailAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側: 訂單進度 */}
            <div className="space-y-8">
              <OrderTimeline order={order} />

              {/* 操作按鈕 */}
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <button
                    onClick={() => {
                      window.location.href = `http://localhost:5000/api/payment/form/${order.orderId}`
                    }}
                    className="w-full rounded-lg bg-primary-500 py-3 text-white transition-colors hover:bg-primary-"
                  >
                    前往付款
                  </button>
                )}

                {order.status === 'shipped' && (
                  <button
                    onClick={() => alert('物流追蹤功能開發中')}
                    className="w-full rounded-lg bg-primary-500 py-3 text-white transition-colors hover:bg-[#4a7080]"
                  >
                    追蹤物流
                  </button>
                )}

                {['pending', 'ordered'].includes(order.status) && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('確定要取消此訂單嗎？')) return

                      try {
                        const response = await orderAPI.cancelOrder(
                          order.orderId
                        )
                        if (response.success) {
                          alert('訂單已取消')
                          router.push('/site/cart/orders')
                        } else {
                          alert(response.message || '取消訂單失敗')
                        }
                      } catch (error) {
                        console.error('取消訂單失敗:', error)
                        alert('取消訂單失敗')
                      }
                    }}
                    className="w-full rounded-lg border border-red-500 bg-transparent py-3 text-red-500 transition-colors hover:bg-red-50"
                  >
                    取消訂單
                  </button>
                )}

                <button
                  onClick={() => router.push('/site/cart/orders')}
                  className="w-full rounded-lg border border-[#d4d1cc] bg-transparent py-3 text-gray-600 transition-colors hover:border-primary-500 hover:bg-primary-500"
                >
                  返回訂單列表
                </button>
              </div>

              {/* 客服資訊 */}
              <div className="rounded-xl border-1 border-primary-300 p-5">
                <h3 className="mb-2 font-medium text-primary-500">需要協助?</h3>
                <p className="mb-3 text-sm text-primary-300">
                  如有任何問題，歡迎聯絡我們的客服團隊
                </p>
                <a
                  href="mailto:support@example.com"
                  className="text-sm font-medium text-primary-300 hover:underline"
                >
                  support@example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
