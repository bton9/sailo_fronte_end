'use client'

import TravelApp, {
  NavigationProvider,
  useNavigation,
} from '@/app/site/custom/components/addtotrip/travelApp'
import Footer from '@/components/footer'
import ProductsList from './list/page'

import '@/app/globals.css'

// PageContent 組件 - 在 NavigationProvider 內部
function PageContent() {
  const { navigateToSettings } = useNavigation()

  return (
    <div className="relative min-h-screen">
      {/* 主要內容區塊 */}
      <main className="md:ml-16 lg:p-4">
        <ProductsList />
      </main>

      {/* 傳遞導航函數給 ToggleBar */}
      {/* <ToggleBar onNavigateToSettings={navigateToSettings} /> */}

      {/* TravelApp 會根據導航狀態顯示對應的頁面 */}
      {/* <TravelApp /> */}
    </div>
  )
}

// Product 主組件 - 用 NavigationProvider 包裹
function Product() {
  return (
    <NavigationProvider>
      <PageContent />
    </NavigationProvider>
  )
}

export default Product
