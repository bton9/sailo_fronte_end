'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import SideMenu from '@/components/sidebar'
const EnhancedPlaceMap = dynamic(
  () => import('@/components/custom/MapWithMenu'),
  {
    ssr: false,
  }
)
export default function App() {
  const [placesFromDB, setPlacesFromDB] = useState([])

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/places') //指向 Express 的正確 port
        const result = await res.json()
        if (result.success) {
          setPlacesFromDB(result.data) // ← 儲存資料到 state
        } else {
          console.error('取得景點失敗:', result.message)
        }
      } catch (err) {
        console.error('載入景點失敗:', err)
      }
    }
    fetchPlaces()
  }, [])

  return (
    <>
      <SideMenu />
      <EnhancedPlaceMap initialPlaces={placesFromDB} />
    </>
  )
}
