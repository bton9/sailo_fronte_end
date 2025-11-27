/**
 * OrderTimeline - 訂單時間軸元件
 * 路徑: app/site/components/shop/order/OrderTimeline.jsx
 */

'use client'

export default function OrderTimeline({ order }) {
  const timeline = [
    {
      status: 'ordered',
      label: '下單成功',
      time: order.orderedAt,
      completed: ['ordered', 'processing', 'shipped', 'delivered'].includes(order.status),
    },
    {
      status: 'processing',
      label: '訂單處理',
      time: order.processingAt,
      completed: ['processing', 'shipped', 'delivered'].includes(order.status),
    },
    {
      status: 'shipped',
      label: '商品出貨',
      time: order.shippedAt,
      completed: ['shipped', 'delivered'].includes(order.status),
    },
    {
      status: 'delivered',
      label: '送達完成',
      time: order.deliveredAt,
      completed: order.status === 'delivered',
    },
  ]

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-medium text-gray-800">訂單進度</h3>
      
      <div className="relative">
        {timeline.map((step, index) => (
          <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {/* 連接線 */}
            {index < timeline.length - 1 && (
              <div
                className={`absolute left-[15px] top-[30px] h-full w-0.5 ${
                  step.completed ? 'bg-primary-500' : 'bg-[#e8e5e0]'
                }`}
              />
            )}
            
            {/* 圓點 */}
            <div
              className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                step.completed
                  ? 'bg-primary-500 text-white'
                  : 'bg-[#e8e5e0] text-gray-400'
              }`}
            >
              {step.completed ? (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-400" />
              )}
            </div>
            
            {/* 內容 */}
            <div className="flex-1 pt-0.5">
              <div className={`font-medium ${
                step.completed ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {step.label}
              </div>
              {step.time && (
                <div className="mt-1 text-sm text-gray-500">
                  {new Date(step.time).toLocaleString('zh-TW')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {order.status === 'cancelled' && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          訂單已於 {new Date(order.cancelledAt).toLocaleString('zh-TW')} 取消
        </div>
      )}
    </div>
  )
}