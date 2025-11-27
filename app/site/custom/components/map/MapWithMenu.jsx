'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext' // ✅ 新增
import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail'
import MapSidebar from './Mapsidebarmenu'
import SoloTravelWishlist from '../addtotrip/SoloTravelWishlist'
import ToggleBar from '@/components/toggleBar'
import TravelApp, {
  NavigationProvider,
  useNavigation,
} from '../addtotrip/travelApp'

// ✅ 把主要邏輯抽成內部組件
function MapContent() {
  const { user } = useAuth() // ✅ 新增：取得使用者資訊
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const leafletRef = useRef(null)
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [favModalOpen, setFavModalOpen] = useState(false)
  const [selectedPlaceForFav, setSelectedPlaceForFav] = useState(null)
  const [highlightedPlaceId, setHighlightedPlaceId] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cities, setCities] = useState([])
  // ✅ 現在可以安全使用 useNavigation
  const { navigateToSettings } = useNavigation()

  const closeFavModal = () => {
    setFavModalOpen(false)
    setSelectedPlaceForFav(null)
    // ✅ 重新載入收藏列表
    if (user?.id) {
      fetchUserFavorites()
    }
  }

  const BACKEND_URL = 'http://localhost:5000'

  // ✅ 新增：載入使用者的收藏列表
  const fetchUserFavorites = async () => {
    if (!user?.id) {
      setFavorites([])
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/favorites/${user.id}`)
      const data = await res.json()

      if (!data.success || !data.favorites) {
        setFavorites([])
        return
      }

      // 取得所有收藏清單中的景點 ID
      const allFavoritePlaceIds = []
      for (const list of data.favorites) {
        const placesRes = await fetch(
          `${BACKEND_URL}/api/favorites/list/${list.list_id}`
        )
        const placesData = await placesRes.json()
        if (placesData.success && placesData.places) {
          placesData.places.forEach((place) => {
            if (!allFavoritePlaceIds.includes(place.place_id)) {
              allFavoritePlaceIds.push(place.place_id)
            }
          })
        }
      }

      setFavorites(allFavoritePlaceIds)
      console.log('✅ 載入收藏列表:', allFavoritePlaceIds)
    } catch (err) {
      console.error('❌ 載入收藏列表失敗:', err)
      setFavorites([])
    }
  }

  // ✅ 新增：當使用者登入/登出時載入收藏列表
  useEffect(() => {
    if (user?.id) {
      fetchUserFavorites()
    } else {
      setFavorites([])
    }
  }, [user?.id])
  // 新增: 生成標記圖標的函數
  const createMarkerIcon = (place, isHighlighted, isDark) => {
    const L = leafletRef.current
    if (!L) return null

    // 根據是否被選中決定顏色
    let markerColor, glowColor

    if (isHighlighted) {
      // 選中的標記 - 使用橘色 (跟卡片邊框一樣)
      markerColor = '#f97316' // Tailwind 的 orange-500
      glowColor = 'rgba(249, 115, 22, 0.6)'
    } else {
      // 普通標記
      markerColor = isDark ? '#e1f0f0' : '#cfc3b1'
      glowColor = 'rgba(0, 0, 0, 0.3)'
    }

    return L.divIcon({
      html: `<div style="position: relative; width: 36px; height: 46px; filter: drop-shadow(0 4px 8px ${glowColor}); ${isHighlighted ? 'transform: scale(1.2); z-index: 1000;' : ''}">
      <svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="markerGrad-${place.place_id}-${isHighlighted ? 'highlight' : 'normal'}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${markerColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${markerColor};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <path d="M18 2C10.268 2 4 8.268 4 16c0 10.5 14 28 14 28s14-17.5 14-28c0-7.732-6.268-14-14-14z" 
              fill="url(#markerGrad-${place.place_id}-${isHighlighted ? 'highlight' : 'normal'})" 
              stroke="${isHighlighted ? '#f97316' : '#ffffff'}" 
              stroke-width="${isHighlighted ? '3' : '2.5'}"
              stroke-linejoin="round"/>
        <circle cx="18" cy="16" r="6" fill="#ffffff" opacity="0.95"/>
        <circle cx="18" cy="16" r="3.5" fill="${markerColor}"/>
        ${isHighlighted ? '<circle cx="18" cy="16" r="8" fill="none" stroke="' + markerColor + '" stroke-width="2" opacity="0.5"/>' : ''}
      </svg>
    </div>`,
      iconSize: [36, 46],
      iconAnchor: [18, 44],
      className: isHighlighted ? 'highlighted-marker' : '',
    })
  }
  // 載入 Leaflet
  useEffect(() => {
    if (typeof window === 'undefined' || leafletLoaded) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      leafletRef.current = window.L
      setLeafletLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.body.removeChild(script)
    }
  }, [])

  // 取得所有景點
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/places`)
        const data = await res.json()
        if (data.success) {
          setPlaces(data.data)
          setFilteredPlaces(data.data)

          // 提取唯一的城市列表
          const uniqueCities = [
            ...new Set(data.data.map((p) => p.location_name)),
          ].filter(Boolean)
          setCities(uniqueCities)
        }
      } catch (err) {
        console.error('無法載入景點:', err)
      }
    }
    fetchPlaces()
  }, [])
  // 初始化地圖
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !places.length) return
    if (mapRef.current) return // 如果地圖已存在,不重新建立

    const L = leafletRef.current

    const map = L.map(mapContainerRef.current, {
      center: [22.6273, 120.3014],
      zoom: 13,
      zoomControl: false,
    })
    mapRef.current = map

    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)

    mapRef.current.tileLayer = tileLayer
    mapRef.current.markers = [] // 初始化標記陣列
    // 標記
    places.forEach((place) => {
      const icon = createMarkerIcon(place, false, darkMode)
      const marker = L.marker([place.latitude, place.longitude], {
        icon,
      }).addTo(map)

      marker.on('click', () => {
        setSelectedPlaceId(place.place_id)
        setDetailModalOpen(true)
        setHighlightedPlaceId(place.place_id) // 設定高亮
      })
      mapRef.current.markers.push({ marker, place })
    })
  }, [places, leafletLoaded])
  // 新增: 單獨處理深色模式切換
  useEffect(() => {
    if (!mapRef.current || !leafletLoaded) return

    const L = leafletRef.current
    const map = mapRef.current

    // 更新地圖底圖
    if (map.tileLayer) {
      map.removeLayer(map.tileLayer)
    }

    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    map.tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)
  }, [darkMode, leafletLoaded])

  // 新增：更新標記高亮狀態的函數
  const updateMarkerHighlight = (placeId) => {
    if (!mapRef.current || !leafletLoaded) return

    const L = leafletRef.current
    const map = mapRef.current

    if (map.markers) {
      map.markers.forEach(({ marker, place }) => {
        const isHighlighted = place.place_id === placeId
        const icon = createMarkerIcon(place, isHighlighted, darkMode)
        marker.setIcon(icon)
      })
    }
  }

  // 新增：當 highlightedPlaceId 改變時更新標記
  useEffect(() => {
    updateMarkerHighlight(highlightedPlaceId)
  }, [highlightedPlaceId, darkMode, leafletLoaded])
  // 搜尋 + 篩選功能
  useEffect(() => {
    let result = places

    // 搜尋關鍵字篩選
    if (searchTerm.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 城市篩選
    if (selectedCity) {
      result = result.filter((p) => p.location_name === selectedCity)
    }

    // 分類篩選
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }

    setFilteredPlaces(result)
  }, [searchTerm, selectedCity, selectedCategory, places])

  // 取得使用者位置
  const getUserLocation = () => {
    if (!navigator.geolocation) return alert('瀏覽器不支援定位')
    const L = leafletRef.current
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        mapRef.current.setView([loc.lat, loc.lng], 15)
        L.marker([loc.lat, loc.lng])
          .addTo(mapRef.current)
          .bindPopup('您的位置')
          .openPopup()
      },
      (err) => alert('無法取得位置: ' + err.message)
    )
  }
  // 清除所有篩選
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCity('')
    setSelectedCategory('')
  }

  // 打開收藏 modal 前先抓列表
  const openFavModal = async (place) => {
    setSelectedPlaceForFav(place)
    setFavModalOpen(true)
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* 地圖 */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      {/* 左側 Sidebar */}
      {/* // 然後把原本的 sidebar div 替換成： */}
      <MapSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        places={filteredPlaces}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onGetUserLocation={getUserLocation}
        onPlaceClick={(place) => {
          setSelectedPlaceId(place.place_id)
          setHighlightedPlaceId(place.place_id)
          setDetailModalOpen(true)
          if (mapRef.current) {
            mapRef.current.setView([place.latitude, place.longitude], 15)
          }
        }}
        favorites={favorites}
        onOpenFavModal={openFavModal}
        backendUrl={BACKEND_URL}
        highlightedPlaceId={highlightedPlaceId}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        cities={cities}
        onClearFilters={handleClearFilters}
      />
      {/* PlaceDetail Modal */}
      <PlaceDetail
        placeId={selectedPlaceId}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedPlaceId(null)
        }}
      />

      <SoloTravelWishlist
        isOpen={favModalOpen}
        onClose={closeFavModal}
        placeId={selectedPlaceForFav?.place_id}
        userId={user?.id} // ✅ 傳遞使用者 ID
      />

      {/* 傳遞導航函數給 ToggleBar */}
      <ToggleBar onNavigateToSettings={navigateToSettings} />

      {/* TravelApp 會根據導航狀態顯示對應的頁面 */}
      <TravelApp />
    </div>
  )
}

// ✅ 主組件：用 NavigationProvider 包裹
export default function FullscreenMap() {
  return (
    <NavigationProvider>
      <MapContent />
    </NavigationProvider>
  )
}
