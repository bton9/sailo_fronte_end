/**
 * OrderStatus - 訂單狀態元件
 * 路徑: app/site/components/shop/order/OrderStatus.jsx
 */

'use client'

export default function OrderStatus({ status }) {
  const statusConfig = {
    ordered: {
      label: '已下單',
      color: 'bg-green-200 text-green-700 border-green-300',
      icon: '',
    },
    processing: {
      label: '處理中',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: '📦',
    },
    shipped: {
      label: '配送中',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: '🚚',
    },
    delivered: {
      label: '已送達',
      color: 'bg-green-100 text-green-600 border-green-200',
      icon: '🎉',
    },
    cancelled: {
      label: '已取消',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: '',
    },
  }

  const config = statusConfig[status] || statusConfig.ordered
}
