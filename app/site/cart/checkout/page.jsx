/**
 * Checkout Page - 結帳頁面
 * 路徑: app/site/shop/checkout/page.jsx
 *
 * 功能: 填寫收件資訊、選擇配送/付款方式、確認訂單
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotify } from '@/contexts/NotificationContext'
import { orderAPI } from '@/lib/cartApi'
import CheckoutForm from '../components/checkout/CheckoutForm'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { cartItems, summary, loading: cartLoading } = useCart()
  const notify = useNotify()
  const [submitting, setSubmitting] = useState(false)

  // 未登入處理
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
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

  // 購物車為空
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className=" flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-medium">購物車是空的</h2>
            <p className="mb-5 text-gray-600">請先加入商品到購物車</p>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-primary-500 px-8 py-3 text-white transition-colors hover:bg-primary-500/90"
            >
              開始購物
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 提交訂單
  const handleSubmit = async ({
    shippingInfo,
    shippingMethod,
    paymentMethod,
  }) => {
    try {
      setSubmitting(true)

      // 🔥 確保 userId 是數字
      const userId = parseInt(user.userId || user.id || user.user_id)

      // 🔥 組合完整地址（適配後端格式）
      const fullAddress =
        [
          shippingInfo.zipCode,
          shippingInfo.city,
          shippingInfo.district,
          shippingInfo.detailAddress,
        ]
          .filter(Boolean)
          .join(' ')
          .trim() || shippingInfo.detailAddress

      const orderData = {
        userId: userId,
        items: cartItems.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
        shippingInfo: {
          recipientName: shippingInfo.recipientName, // ← 後端需要
          phone: shippingInfo.phone, // ← 後端驗證
          email: shippingInfo.email, // ← 後端驗證
          address: fullAddress, // ← 組合後的完整地址
          // 🔥 也可以保留原始欄位給後端使用
          zipCode: shippingInfo.zipCode,
          city: shippingInfo.city,
          district: shippingInfo.district,
          detailAddress: shippingInfo.detailAddress,
        },
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod,
      }

      console.log('📦 準備送出訂單:', orderData)

      const response = await orderAPI.createOrder(orderData)

      console.log(' 訂單回應:', response)

      if (response.success) {
        const { orderId } = response.data

        if (paymentMethod === 'ecpay') {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          // window.location.href = `${apiUrl}/api/payment/form/${orderId}?email=${encodeURIComponent(shippingInfo.email || user.email)}`
          window.location.href = `${apiUrl}/api/payment/ecpay2?amount=${summary.total}&items=${''}`
        } else {
          router.push(`/site/cart/success`)
        }
      } else {
        notify(response.message || '建立訂單失敗', 'error')
        setSubmitting(false)
      }
    } catch (error) {
      console.error(' 建立訂單錯誤:', error)
      notify(error.message || '建立訂單失敗,請稍後再試', 'error')
      setSubmitting(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="ml-[70px] flex min-h-screen items-center justify-center md:ml-[100px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen lg:mx-[70px] md:mx-[25px] py-8 px-2">
        <div className="mx-auto max-w-[1200px] p-5">
          {/* 頁面標題 */}
          <div className="mb-6">
            <h1 className="text-[28px] font-medium text-gray-800">結帳</h1>
            <p className="mt-2 text-gray-600">請填寫收件資訊並確認訂單</p>
          </div>

          {/* 結帳表單 */}
          <CheckoutForm
            cartItems={cartItems}
            summary={summary}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </div>
      </div>
    </div>
  )
}
