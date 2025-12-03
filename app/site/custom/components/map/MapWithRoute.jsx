'use client'

import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

// 修正 Leaflet 預設圖標
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// ============ 主元件 ============
export default function MapWithRoute({ destination }) {
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 使用 custom hook 取得使用者位置
  useGeolocation(setUserLocation, setLoading, setError)

  return (
    <div className="w-full h-screen relative" style={{ paddingTop: '72px' }}>
      {loading && <LoadingOverlay />}
      
      <MapView 
        userLocation={userLocation} 
        destination={destination}
        setError={setError}
      />
      
      {error && <ErrorMessage message={error} />}
      {userLocation && <LocationInfo location={userLocation} />}
    </div>
  )
}

// ============ Custom Hook: 地理位置 ============
function useGeolocation(setUserLocation, setLoading, setError) {
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('瀏覽器不支援定位功能')
      setLoading(false)
      return
    }

    const handleSuccess = (pos) => {
      const { latitude, longitude } = pos.coords
      setUserLocation({ lat: latitude, lng: longitude })
      setLoading(false)
      setError(null)
    }

    const handleError = (err) => {
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
    }

    const options = { 
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }

    // 首次取得位置
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)

    // 註解掉持續監聽，避免重複更新導致路線被清除
    // const watchId = navigator.geolocation.watchPosition(
    //   handleSuccess,
    //   (err) => {
    //     if (err.code === 1 || err.code === 2) {
    //       console.warn('位置監聽錯誤:', err.message || '無法取得位置更新')
    //     }
    //   },
    //   options
    // )

    // return () => {
    //   if (watchId) {
    //     navigator.geolocation.clearWatch(watchId)
    //   }
    // }
  }, [setUserLocation, setLoading, setError])
}

// ============ 元件：地圖視圖 ============
function MapView({ userLocation, destination, setError }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const routingControlRef = useRef(null)
  const userMarkerRef = useRef(null)
  const animatedMarkerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const routeCoordinatesRef = useRef([])
  const isRouteInitialized = useRef(false)

  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [routeReady, setRouteReady] = useState(false)

  // 初始化地圖（使用新營作為預設中心）
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // 使用新營座標作為預設中心點
    const defaultCenter = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [23.3105, 120.3170] // 台南新營

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => cleanupMap(
      mapInstanceRef,
      routingControlRef,
      animatedMarkerRef,
      userMarkerRef,
      animationFrameRef
    )
  }, [])

  // 設定路線
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !destination) return
    if (isRouteInitialized.current) return // 如果已經初始化過就不再執行

    const timer = setTimeout(() => {
      setupRoute(
        mapInstanceRef.current,
        userLocation,
        destination,
        routingControlRef,
        userMarkerRef,
        routeCoordinatesRef,
        setError,
        setRouteReady
      )
      isRouteInitialized.current = true
    }, 300)

    return () => clearTimeout(timer)
  }, [userLocation, destination])

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />
      
      <ControlPanel
        isAnimating={isAnimating}
        animationProgress={animationProgress}
        onStartAnimation={() => startAnimation(
          mapInstanceRef.current,
          routeCoordinatesRef.current,
          animatedMarkerRef,
          setIsAnimating,
          setAnimationProgress,
          animationFrameRef
        )}
        onStopAnimation={() => stopAnimation(animationFrameRef, setIsAnimating)}
        routeReady={routeReady}
      />
    </>
  )
}

// ============ 元件：控制面板 ============
function ControlPanel({ 
  isAnimating, 
  animationProgress, 
  onStartAnimation, 
  onStopAnimation, 
  routeReady 
}) {
  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-xl shadow-2xl z-[500] space-y-3">
      <div className="font-bold text-gray-800 mb-2">🎮 控制面板</div>
      
      <button
        onClick={onStartAnimation}
        disabled={isAnimating || !routeReady}
        className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
          isAnimating || !routeReady
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isAnimating ? '動畫進行中...' : '▶️ 開始動畫'}
      </button>

      {isAnimating && (
        <>
          <button
            onClick={onStopAnimation}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            ⏸️ 停止動畫
          </button>

          <div className="text-sm text-gray-600">
            進度: {animationProgress}%
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${animationProgress}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============ 元件：載入中覆蓋層 ============
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 z-[500]">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold text-lg">正在取得您的位置</p>
        <p className="text-gray-500 text-sm mt-2">請確保已允許位置存取權限</p>
      </div>
    </div>
  )
}

// ============ 元件：錯誤訊息 ============
function ErrorMessage({ message }) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl z-[500] max-w-md">
      <p className="font-semibold">{message}</p>
    </div>
  )
}

// ============ 元件：位置資訊 ============
function LocationInfo({ location }) {
  const isInTainan = 
    location.lat >= 22.5 && location.lat <= 23.2 && 
    location.lng >= 120.0 && location.lng <= 120.5

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow-2xl z-[500] max-w-sm">
      <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        <span className="text-pink-500">📍</span>
        目前位置
      </p>
      <p className="text-gray-600 text-sm mb-1">
        緯度：{location.lat.toFixed(6)}
      </p>
      <p className="text-gray-600 text-sm">
        經度：{location.lng.toFixed(6)}
      </p>
      
      {isInTainan && (
        <p className="text-green-600 font-semibold text-sm mt-2 pt-2 border-t border-gray-200">
          ✓ 位於台南市
        </p>
      )}
    </div>
  )
}

// ============ 工具函數：設定路線 ============
function setupRoute(map, userLocation, destination, routingControlRef, userMarkerRef, routeCoordinatesRef, setError, setRouteReady) {
  // 清理舊的路線控制
  if (routingControlRef.current) {
    try {
      map.removeControl(routingControlRef.current)
    } catch (e) {
      console.error('移除舊路線失敗:', e)
    }
    routingControlRef.current = null
  }

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
            `<b>起點</b><br/>緯度: ${userLocation.lat.toFixed(6)}<br/>經度: ${userLocation.lng.toFixed(6)}`
          )
          userMarkerRef.current = marker
        } else if (i === n - 1) {
          marker.bindPopup(`<b>${destination.name}</b>`)
        }
        
        return marker
      },
    }).addTo(map)

    routingControlRef.current = routingControl

    routingControl.on('routesfound', (e) => {
      const routes = e.routes
      const route = routes[0]
      routeCoordinatesRef.current = route.coordinates.map(coord => [coord.lat, coord.lng])
      setRouteReady(true) // 路線準備好了
      console.log('路線已找到，座標數量:', routeCoordinatesRef.current.length)
    })

    routingControl.on('routingerror', (e) => {
      console.error('路線計算失敗:', e.error)
      setError('無法計算路線，請稍後再試')
      setRouteReady(false)
    })

  } catch (e) {
    console.error('建立路線錯誤:', e)
    setError('建立路線時發生錯誤')
    setRouteReady(false)
  }
}

// ============ 工具函數：開始動畫 ============
function startAnimation(map, routeCoordinates, animatedMarkerRef, setIsAnimating, setAnimationProgress, animationFrameRef) {
  if (routeCoordinates.length === 0) {
    alert('請等待路線計算完成')
    return
  }

  setIsAnimating(true)
  setAnimationProgress(0)

  if (animatedMarkerRef.current && map) {
    map.removeLayer(animatedMarkerRef.current)
  }

  const carIcon = L.divIcon({
    html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  const marker = L.marker(routeCoordinates[0], { icon: carIcon }).addTo(map)
  animatedMarkerRef.current = marker
  marker.bindPopup('<b>移動中...</b>').openPopup()

  const totalPoints = routeCoordinates.length
  let currentIndex = 0
  const animationSpeed = 50

  const animate = () => {
    if (currentIndex >= totalPoints - 1) {
      setIsAnimating(false)
      setAnimationProgress(100)
      marker.bindPopup('<b>已到達目的地！</b>').openPopup()
      return
    }

    currentIndex++
    const progress = Math.round((currentIndex / (totalPoints - 1)) * 100)
    setAnimationProgress(progress)

    const newLatLng = routeCoordinates[currentIndex]
    marker.setLatLng(newLatLng)
    map.panTo(newLatLng, { animate: true, duration: 0.5 })

    animationFrameRef.current = setTimeout(animate, animationSpeed)
  }

  animate()
}

// ============ 工具函數：停止動畫 ============
function stopAnimation(animationFrameRef, setIsAnimating) {
  if (animationFrameRef.current) {
    clearTimeout(animationFrameRef.current)
    animationFrameRef.current = null
  }
  setIsAnimating(false)
}

// ============ 工具函數：清理地圖 ============
function cleanupMap(mapInstanceRef, routingControlRef, animatedMarkerRef, userMarkerRef, animationFrameRef) {
  if (animationFrameRef.current) {
    clearTimeout(animationFrameRef.current)
  }

  const map = mapInstanceRef.current

  if (routingControlRef.current && map) {
    try {
      routingControlRef.current.getPlan().setWaypoints([])
      map.removeControl(routingControlRef.current)
    } catch (e) {}
    routingControlRef.current = null
  }

  if (animatedMarkerRef.current && map) {
    try {
      map.removeLayer(animatedMarkerRef.current)
    } catch (e) {}
    animatedMarkerRef.current = null
  }

  if (userMarkerRef.current && map) {
    try {
      map.removeLayer(userMarkerRef.current)
    } catch (e) {}
    userMarkerRef.current = null
  }

  if (map) {
    try {
      map.remove()
    } catch (e) {}
    mapInstanceRef.current = null
  }
}