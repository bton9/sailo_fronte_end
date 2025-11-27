'use client'
import SideMenu from '@/components/sidebar'
import NavBar from '@/components/navbar'
import Footer from '@/components/footer'
import Breadcrumb from '@/components/breadcrumb'
import GlobalButton from '@/components/button'
import Card from '@/app/site/custom/components/location/card'
import SoloTravelWishlist from '@/app/site/custom/components/addtotrip/SoloTravelWishlist'
const breadcrumbItems = [
  { label: '首頁', href: '/', icon: 'home' },
  { label: '產品分類', href: '/products' },
  { label: '當前頁面' },
]
function App() {
  return (
    <div className="relative min-h-screen">
      <SideMenu />
      {/* <Navbar /> */}
      {/* 主要內容區塊 */}
      <main className="md:ml-16 lg:p-4">
        {/* 這裡的 ml-16 是為了確保內容不會被收合的 SideMenu 遮擋 */}
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl font-bold">歡迎來到網站</h1>
        <p className="mt-4">這是您的主要內容區塊...</p>
        {/* 增加一些內容以便測試 fixed 效果 */}
        {/* <div style={{ height: '100vh' }}>滾動測試固定效果</div> */}
        <div>
          {/* <GlobalButton
            label="產品頁"
            href="/products"
            className="bg-green-500 text-white"
          /> */}
        </div>
      </main>
      <Footer />
    </div>
  )
}
export default App
