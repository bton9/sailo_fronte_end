'use client'

import { useEffect, useState } from 'react'
import FullscreenMap from '@/app/site/custom/components/map/MapWithMenu'
import MapTransition from '@/components/mapTransition'
import { PageTransitionWrapper } from '@/contexts/transitionContext'
import { AiOutlineProduct } from 'react-icons/ai'

export default function MapPage() {
  const [placesFromDB, setPlacesFromDB] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API_URL}/api/places`)
        const result = await res.json()

        if (result.success) {
          setPlacesFromDB(result.data)
          console.log(' 載入景點成功:', result.data.length, '個景點')
        } else {
          console.error(' 取得景點失敗:', result.message)
        }
      } catch (err) {
        console.error(' 載入景點失敗:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlaces()
  }, [])

  return (
    <PageTransitionWrapper dependencies={[placesFromDB, isLoading]}>
      {/* {isLoading ? (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-50 md:left-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">載入地圖中...</p>
          </div>
        </div>
      ) : ( */}
      <>
        <FullscreenMap initialPlaces={placesFromDB} />
        {/* 返回首頁按鈕 */}
        <div className="fixed bottom-10 left-10 z-50">
          <MapTransition
            targetUrl="/site/custom"
            className="shadow-lg"
            icon={AiOutlineProduct}
          />
        </div>
      </>
      {/* )} */}
    </PageTransitionWrapper>
  )
}
