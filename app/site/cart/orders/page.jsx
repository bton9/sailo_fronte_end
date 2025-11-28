/**
 * Orders Page - 訂單歷史頁面
 * 路徑: app/site/orders/page.jsx
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { orderAPI } from '@/lib/cartApi'
import OrderCard from '../components/order/OrderCard'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function OrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  // 載入訂單列表
  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated || (!user?.user_id && !user?.id)) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const status = activeFilter === 'all' ? null : activeFilter
        const userId = user.user_id || user.id
        const response = await orderAPI.getUserOrders(userId, status)

        console.log('📦 Orders API Response:', response)

        if (response.success) {
          //  FIXED: Backend returns { success: true, data: { orders: [...], total: n } }
          const ordersData = Array.isArray(response.data?.orders)
            ? response.data.orders
            : Array.isArray(response.data)
              ? response.data
              : []

          console.log(' Orders loaded:', ordersData)
          setOrders(ordersData)
        } else {
          console.warn(' API returned success: false')
          setOrders([])
        }
      } catch (error) {
        console.error(' 載入訂單失敗:', error)
        setOrders([])
        alert('載入訂單失敗: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, user?.user_id, user?.id, activeFilter])

  // 未登入處理
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-500">
        <div className="ml-[70px] flex min-h-screen items-center justify-center md:ml-[100px]">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-medium">請先登入</h2>
            <button
              onClick={() => router.push('/login')}
              className="rounded-lg bg-primary-500 px-8 py-3 text-white transition-colors hover:bg-[#4a7080]"
            >
              前往登入
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 確保 orders 是陣列
  const safeOrders = Array.isArray(orders) ? orders : []

  // 統計資料
  const stats = {
    all: safeOrders.length,
    ordered: safeOrders.filter((o) => o.status === 'ordered').length,
    processing: safeOrders.filter((o) => o.status === 'processing').length,
    shipped: safeOrders.filter((o) => o.status === 'shipped').length,
    delivered: safeOrders.filter((o) => o.status === 'delivered').length,
    cancelled: safeOrders.filter((o) => o.status === 'cancelled').length,
  }

  // 篩選按鈕
  const FilterButton = ({ label, value, count }) => (
    <button
      onClick={() => setActiveFilter(value)}
      className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
        activeFilter === value
          ? 'border-primary-500 bg-primary-500 text-white'
          : 'border-[#d4d1cc] bg-white text-gray-600 hover:border-primary-500 hover:bg-primary-500'
      }`}
    >
      {label} {count > 0 && `(${count})`}
    </button>
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen lg:mx-[70px] md:mx-[25px] py-8 px-2">
        <div className="mx-auto max-w-[1200px] p-5">
          <h1 className="mb-2 text-3xl font-medium text-gray-900">訂單記錄</h1>
          <p className="mb-8 text-gray-600">查看您的所有訂單與購買記錄</p>

          {/* 訂單統計 */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-3xl font-medium text-primary-500">
                {stats.all}
              </div>
              <div className="text-sm text-gray-600">總訂單數</div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-3xl font-medium text-primary-300">
                {stats.ordered}
              </div>
              <div className="text-sm text-gray-600">已下單</div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-3xl font-medium text-primary-300">
                {stats.processing}
              </div>
              <div className="text-sm text-gray-600">處理中</div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-3xl font-medium text-primary-300">
                {stats.shipped}
              </div>
              <div className="text-sm text-gray-600">配送中</div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-3xl font-medium text-primary-300">
                {stats.delivered}
              </div>
              <div className="text-sm text-gray-600">已送達</div>
            </div>
          </div>

          {/* 篩選器 */}
          <div className="mb-8 flex flex-wrap gap-3">
            <FilterButton label="全部訂單" value="all" count={stats.all} />
            <FilterButton
              label="已下單"
              value="ordered"
              count={stats.ordered}
            />
            <FilterButton
              label="處理中"
              value="processing"
              count={stats.processing}
            />
            <FilterButton
              label="配送中"
              value="shipped"
              count={stats.shipped}
            />
            <FilterButton
              label="已送達"
              value="delivered"
              count={stats.delivered}
            />
          </div>

          {/* 訂單列表 */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : safeOrders.length > 0 ? (
            <div className="flex flex-col gap-5">
              {safeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-20 text-center shadow-sm">
              <h3 className="text-xl font-medium text-gray-900">
                沒有符合條件的訂單
              </h3>
              <p className="mt-2 text-gray-500">
                {activeFilter === 'all'
                  ? '您還沒有任何訂單'
                  : '請嘗試選擇其他的篩選條件'}
              </p>
              {activeFilter === 'all' && (
                <button
                  onClick={() => (window.location.href = '/site/product/list')}
                  className="mt-6 rounded-lg bg-primary-500 px-8 py-3 text-white transition-colors hover:bg-primary-500/90"
                >
                  開始購物
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
