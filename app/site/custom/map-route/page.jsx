'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Navigation } from 'lucide-react'

const MapWithRoute = dynamic(
  () => import('@/app/site/custom/components/map/MapWithRoute'),
  { ssr: false }
)

export default function MapRoutePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [destination, setDestination] = useState(null)

  useEffect(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const name = searchParams.get('name')

    if (lat && lng) {
      setDestination({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: name || '目的地',
      })
    }
  }, [searchParams])

  if (!destination) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600 text-xl">找不到目的地資訊</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>

          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-semibold">
              前往 {destination.name}
            </h1>
          </div>

          <div className="w-20"></div>
        </div>
      </div>

      <MapWithRoute destination={destination} />
    </div>
  )
}
