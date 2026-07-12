/**
 * PaymentMethod - 付款方式選擇
 * 路徑: app/site/shop/components/checkout/PaymentMethod.jsx
 */

'use client'

import { CreditCard, Banknote } from 'lucide-react'

export default function PaymentMethod({ selected, onChange }) {
  const methods = [
    {
      id: 'ecpay',
      name: 'ECPay 線上付款',
      description: '信用卡 / ATM / 超商代碼',
      icon: CreditCard,
    },
    {
      id: 'cod',
      name: '貨到付款',
      description: '收到商品後付款',
      icon: Banknote,
    },
  ]

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-medium text-gray-800">付款方式</h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
              selected === method.id
                ? 'border-primary-500 bg-[#f5f3ef]'
                : 'border-[#e8e5e0] hover:border-primary-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selected === method.id}
                onChange={(e) => onChange(e.target.value)}
                className="h-5 w-5 accent-primary-500"
              />
              <div className="text-primary-500">
                <method.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium text-gray-800">{method.name}</div>
                <div className="text-sm text-gray-600">
                  {method.description}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {selected === 'ecpay' && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          安全的第三方金流服務
        </div>
      )}
    </div>
  )
}
