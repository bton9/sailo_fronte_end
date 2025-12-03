'use client'

import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapWithRoute({ destination }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const routingControlRef = useRef(null)
  const userMarkerRef = useRef(null)
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('瀏覽器不支援定位功能')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLoading(false)
        setError(null)
      },
      (err) => {
        let errorMsg = '定位失敗'
        if (err.code === 1) {
          errorMsg = '請在瀏覽器設定中允許位置存取權限'
        } else if (err.code === 2) {
          errorMsg = '無法取得位置資訊，請檢查裝置定位服務是否開啟'
        } else if (err.code === 3) {
          errorMsg = '定位請求逾時，請重新整理頁面'
        }
        setError(errorMsg)
        setLoading(false)
      },
      { 
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    )

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('定位錯誤:', err)
      },
      { 
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    )

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !userLocation) return
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: true,
      zoomAnimation: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      const currentMap = mapInstanceRef.current
      
      if (routingControlRef.current && currentMap) {
        try {
          const routing = routingControlRef.current
          routing.getPlan().setWaypoints([])
          currentMap.removeControl(routing)
        } catch (e) {
          console.error('清理路線控制器失敗:', e)
        }
        routingControlRef.current = null
      }

      if (userMarkerRef.current && currentMap) {
        try {
          currentMap.removeLayer(userMarkerRef.current)
        } catch (e) {
          console.error('清理標記失敗:', e)
        }
        userMarkerRef.current = null
      }

      if (currentMap) {
        try {
          currentMap.eachLayer((layer) => {
            try {
              currentMap.removeLayer(layer)
            } catch (e) {}
          })
          currentMap.remove()
        } catch (e) {
          console.error('清理地圖失敗:', e)
        }
        mapInstanceRef.current = null
      }
    }
  }, [userLocation])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !userLocation || !destination) return

    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current)
      } catch (e) {
        console.error('移除舊路線失敗:', e)
      }
      routingControlRef.current = null
    }

    const timer = setTimeout(() => {
      if (!mapInstanceRef.current) return

      try {
        map.setView([userLocation.lat, userLocation.lng], 14)

        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(destination.lat, destination.lng),
          ],
          routeWhileDragging: true,
          addWaypoints: true,
          draggableWaypoints: true,
          fitSelectedRoutes: true,
          showAlternatives: false,
          lineOptions: { 
            styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }] 
          },
          createMarker: (i, wp, n) => {
            const marker = L.marker(wp.latLng, { draggable: true })
            
            if (i === 0) {
              marker.bindPopup(
                `<b>您的位置</b><br/>緯度: ${userLocation.lat.toFixed(6)}<br/>經度: ${userLocation.lng.toFixed(6)}`
              )
              userMarkerRef.current = marker
            } else if (i === n - 1) {
              marker.bindPopup(`<b>${destination.name}</b>`)
            }
            
            return marker
          },
        }).addTo(map)

        routingControlRef.current = routingControl

        routingControl.on('routingerror', (e) => {
          console.error('路線計算失敗:', e.error)
          setError('無法計算路線，請稍後再試')
        })

      } catch (e) {
        console.error('建立路線錯誤:', e)
        setError('建立路線時發生錯誤')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [userLocation, destination])

  return (
    <div className="w-full h-screen relative" style={{ paddingTop: '72px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 z-[500]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold text-lg">正在取得您的位置</p>
            <p className="text-gray-500 text-sm mt-2">請確保已允許位置存取權限</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl z-[500] max-w-md">
          <p className="font-semibold">{error}</p>
        </div>
      )}
      
      {userLocation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow-2xl z-[500] max-w-sm">
          <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-pink-500">📍</span>
            目前位置
          </p>
          <p className="text-gray-600 text-sm mb-1">
            緯度：{userLocation.lat.toFixed(6)}
          </p>
          <p className="text-gray-600 text-sm mb-2">
            經度：{userLocation.lng.toFixed(6)}
          </p>
          
          {(userLocation.lat < 22.5 || userLocation.lat > 23.2 || 
            userLocation.lng < 120.0 || userLocation.lng > 120.5) && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-orange-500 font-semibold text-sm flex items-center gap-1">
              </p>
              <p className="text-gray-500 text-xs mt-1">
              </p>
            </div>
          )}
          
          {(userLocation.lat >= 22.5 && userLocation.lat <= 23.2 && 
            userLocation.lng >= 120.0 && userLocation.lng <= 120.5) && (
            <p className="text-green-600 font-semibold text-sm mt-2 pt-2 border-t border-gray-200">
              ✓ 位於台南市
            </p>
          )}
        </div>
      )}
    </div>
  )
}