'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import SideMenu from '../components/sidebar'
import { FiMapPin } from 'react-icons/fi'
import MapTransition from '@/components/mapTransition'
import ScrollingPlacesColumn from '@/components/scrollingPlacesColumn'
import { PageTransitionWrapper } from '@/contexts/transitionContext'
import PlaceDetail from './site/custom/components/location/PlaceDetail'
import '@/app/globals.css'

function App() {
  const { user, logout } = useAuth()
  const [shuffledPlaces1, setShuffledPlaces1] = useState([])
  const [shuffledPlaces2, setShuffledPlaces2] = useState([])
  const [shuffledPlaces3, setShuffledPlaces3] = useState([])
  const [shuffledPlaces4, setShuffledPlaces4] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // 打亂陣列的輔助函數 (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // 載入景點資料
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${BACKEND_URL}/api/places`)
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          const placesData = data.data.slice(0, 20)
          
          // 為四列分別創建不同的隨機順序
          setShuffledPlaces1(shuffleArray(placesData))
          setShuffledPlaces2(shuffleArray(placesData))
          setShuffledPlaces3(shuffleArray(placesData))
          setShuffledPlaces4(shuffleArray(placesData))
          
          // 設定推薦景點(取前3個)
          setRecommendations(placesData.slice(0, 3))
        }
      } catch (error) {
        console.error('載入景點失敗:', error)
      }
    }

    fetchPlaces()
  }, [])

  // 圖片邏輯
  const getImageUrl = (cover_image) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    if (!cover_image) return `${BACKEND_URL}/uploads/default.jpg`
    if (cover_image.startsWith('http')) return cover_image
    if (cover_image.startsWith('/uploads/'))
      return `${BACKEND_URL}${cover_image}`
    return `${BACKEND_URL}/uploads/${cover_image}`
  }

  // 點擊推薦景點開啟詳細資訊
  const handleRecommendationClick = (e, placeId) => {
    e.preventDefault()
    setSelectedPlaceId(placeId)
    setShowDetail(true)
  }

  return (
    <AuthGuard>
      <PageTransitionWrapper dependencies={[shuffledPlaces1, shuffledPlaces2, shuffledPlaces3, shuffledPlaces4]}>
        <div className="relative min-h-screen">
          <SideMenu />
          <div className="relative min-h-screen bg-[#f5f1ed] flex overflow-hidden">
            {/* 左側區域 - LOGO 和導航 */}
            <div className="fixed z-50 left-0 top-0 h-full w-full lg:w-1/2 flex flex-col shadow-2xl items-center justify-center p-8 lg:p-16 bg-secondary-200 z-10">
              <div className="flex flex-col items-center space-y-8 max-w-md">
                <div className="w-[250px] px-4">
                  <Image
                    src="/LOGO2.svg"
                    alt="SAILO - Travel in your flow"
                    width={400}
                    height={160}
                    priority
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-gray-600 text-base sm:text-lg md:text-xl tracking-wide font-light">
                  享遊 獨自旅遊的最好幫手
                </p>
                <div className="mt-4">
                  <svg
                    width="140"
                    height="30"
                    viewBox="0 0 140 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-800"
                  >
                    <path
                      d="M0 15 Q 12 5, 24 15 T 48 15 T 72 15 T 96 15 T 120 15 T 140 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="hidden lg:flex absolute bottom-6 left-25 right-5 gap-3 xl:gap-4">
                {recommendations.map((item) => (
                  <div
                    key={item.place_id}
                    onClick={(e) => handleRecommendationClick(e, item.place_id)}
                    className="flex items-center gap-3 bg-white rounded-md p-2 hover:shadow-md transition-all hover:-translate-y-1 flex-1 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                      <img 
                        src={getImageUrl(item.cover_image)} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/default.jpg`
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <FiMapPin className="w-3.5 h-3.5" />
                        10 Km
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 地圖按鈕 - 桌面版 */}
            <div className="hidden lg:block fixed bottom-10 left-10 z-50">
              <MapTransition 
                targetUrl="/site/custom/mapPage" 
                className="shadow-xl hover:shadow-2xl"
              />
            </div>

            {/* 右側卡片無限循環滾動區域 */}
            <ScrollingPlacesColumn 
              places={{
                column1: shuffledPlaces1,
                column2: shuffledPlaces2,
                column3: shuffledPlaces3,
                column4: shuffledPlaces4
              }}
            />

            {/* 手機版底部導航 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20 shadow-lg">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recommendations.map((item) => (
                  <div
                    key={item.place_id}
                    onClick={(e) => handleRecommendationClick(e, item.place_id)}
                    className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 min-w-[160px] hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                      <img 
                        src={getImageUrl(item.cover_image)} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/default.jpg`
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        50 Km
                      </p>
                    </div>
                  </div>
                ))}

                <MapTransition targetUrl="/site/custom/mapPage" isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      </PageTransitionWrapper>

      {/* 景點詳細資訊 Modal */}
      <PlaceDetail
        placeId={selectedPlaceId}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </AuthGuard>
  )
}

export default App