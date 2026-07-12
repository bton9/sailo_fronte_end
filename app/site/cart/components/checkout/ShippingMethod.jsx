/**
 * ShippingMethod - 配送方式選擇
 * 路徑: app/site/shop/components/checkout/ShippingMethod.jsx
 */

'use client'

export default function ShippingMethod({ selected, onChange }) {
  const methods = [
    {
      id: 'standard',
      name: '標準配送',
      fee: 80,
      days: '3-5 個工作天',
      description: '一般宅配服務',
    },
    {
      id: 'express',
      name: '快速配送',
      fee: 150,
      days: '1-2 個工作天',
      description: '快速到貨服務',
    },
  ]

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-medium text-gray-800">配送方式</h2>

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
                name="shippingMethod"
                value={method.id}
                checked={selected === method.id}
                onChange={(e) => onChange(e.target.value)}
                className="h-5 w-5 accent-primary-500"
              />
              <div>
                <div className="font-medium text-gray-800">{method.name}</div>
                <div className="text-sm text-gray-600">
                  {method.description} · 預計 {method.days}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-800">NT$ {method.fee}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        滿 NT$ 1,000 免運費
      </div>
    </div>
  )
}
