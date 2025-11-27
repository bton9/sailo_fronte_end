/**
 * CheckoutForm - 結帳表單主元件
 * 路徑: app/site/shop/components/checkout/CheckoutForm.jsx
 */

'use client'

import { useState } from 'react'
import ShippingForm from './ShippingForm'
import ShippingMethod from './ShippingMethod'
import PaymentMethod from './PaymentMethod'
import OrderSummary from './OrderSummary'

export default function CheckoutForm({ cartItems, summary, onSubmit, loading }) {
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    phone: '',
    email: '',
    zipCode: '',
    city: '',
    district: '',
    detailAddress: '',
  })

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('ecpay')
  const [errors, setErrors] = useState({})

  // 驗證表單
  const validateForm = () => {
    const newErrors = {}

    if (!shippingInfo.recipientName.trim()) {
      newErrors.recipientName = '請輸入收件人姓名'
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = '請輸入聯絡電話'
    } else if (!/^09\d{8}$/.test(shippingInfo.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = '請輸入有效的手機號碼'
    }

    if (!shippingInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = '請輸入有效的電子郵件'
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = '請選擇城市'
    }

    if (!shippingInfo.district.trim()) {
      newErrors.district = '請選擇區域'
    }

    if (!shippingInfo.detailAddress.trim()) {
      newErrors.detailAddress = '請輸入詳細地址'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交訂單
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('請填寫所有必填欄位')
      return
    }

    onSubmit({
      shippingInfo,
      shippingMethod,
      paymentMethod,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:flex-row md:items-start">
      {/* 左側: 表單區域 */}
      <div className="flex-1 space-y-8">
        {/* 收件資訊 */}
        <ShippingForm
          shippingInfo={shippingInfo}
          setShippingInfo={setShippingInfo}
          errors={errors}
        />

        {/* 配送方式 */}
        <ShippingMethod
          selected={shippingMethod}
          onChange={setShippingMethod}
        />

        {/* 付款方式 */}
        <PaymentMethod
          selected={paymentMethod}
          onChange={setPaymentMethod}
        />
      </div>

      {/* 右側: 訂單摘要 */}
      <OrderSummary
        cartItems={cartItems}
        summary={summary}
        shippingMethod={shippingMethod}
        loading={loading}
      />
    </form>
  )
}