'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail'
import MapSidebar from './Mapsidebarmenu'
import SoloTravelWishlist from '../addtotrip/SoloTravelWishlist'
import ToggleBar from '@/components/toggleBar'
import TravelApp, {
  NavigationProvider,
  useNavigation,
} from '../addtotrip/travelApp'

// ============================================
// 主要地圖邏輯組件
// ============================================
function MapContent() {
  // -----------------------------------
  // 1. 狀態管理 (State Management)
  // -----------------------------------
  const { user } = useAuth() // 取得當前登入使用者資訊

  // 地圖相關 refs
  const mapRef = useRef(null) // Leaflet 地圖實例
  const mapContainerRef = useRef(null) // 地圖容器 DOM 元素
  const leafletRef = useRef(null) // Leaflet 函式庫引用

  // 景點資料狀態
  const [places, setPlaces] = useState([]) // 所有景點資料
  const [filteredPlaces, setFilteredPlaces] = useState([]) // 篩選後的景點
  const [selectedPlaceId, setSelectedPlaceId] = useState(null) // 當前選中的景點 ID
  const [highlightedPlaceId, setHighlightedPlaceId] = useState(null) // 高亮顯示的景點 ID

  // 搜尋與篩選狀態
  const [searchTerm, setSearchTerm] = useState('') // 搜尋關鍵字
  const [selectedCity, setSelectedCity] = useState('') // 選中的城市
  const [selectedCategory, setSelectedCategory] = useState('') // 選中的分類
  const [cities, setCities] = useState([]) // 可用的城市列表

  // UI 控制狀態
  const [sidebarOpen, setSidebarOpen] = useState(true) // 側邊欄開關
  const [darkMode, setDarkMode] = useState(false) // 深色模式開關
  const [detailModalOpen, setDetailModalOpen] = useState(false) // 景點詳情 Modal 開關
  const [favModalOpen, setFavModalOpen] = useState(false) // 收藏 Modal 開關

  // 其他狀態
  const [userLocation, setUserLocation] = useState(null) // 使用者當前位置
  const [favorites, setFavorites] = useState([]) // 使用者收藏的景點 ID 列表
  const [selectedPlaceForFav, setSelectedPlaceForFav] = useState(null) // 要加入收藏的景點
  const [leafletLoaded, setLeafletLoaded] = useState(false) // Leaflet 是否已載入

  const { navigateToSettings } = useNavigation() // 導航功能
  const BACKEND_URL = 'http://localhost:5000' // 後端 API 位址

  // -----------------------------------
  // 2. 收藏功能相關
  // -----------------------------------

  /**
   * 關閉收藏 Modal 並重新載入收藏列表
   */
  const closeFavModal = () => {
    setFavModalOpen(false)
    setSelectedPlaceForFav(null)
    // 如果使用者已登入,重新載入收藏列表
    if (user?.id) {
      fetchUserFavorites()
    }
  }

  /**
   * 從後端載入使用者的所有收藏景點
   */
  const fetchUserFavorites = async () => {
    // 未登入時清空收藏列表
    if (!user?.id) {
      setFavorites([])
      return
    }

    try {
      // 1. 取得使用者的所有收藏清單
      const res = await fetch(`${BACKEND_URL}/api/favorites/${user.id}`)
      const data = await res.json()

      if (!data.success || !data.favorites) {
        setFavorites([])
        return
      }

      // 2. 遍歷每個收藏清單,取得其中的景點 ID
      const allFavoritePlaceIds = []
      for (const list of data.favorites) {
        const placesRes = await fetch(
          `${BACKEND_URL}/api/favorites/list/${list.list_id}`
        )
        const placesData = await placesRes.json()

        // 將景點 ID 加入陣列 (避免重複)
        if (placesData.success && placesData.places) {
          placesData.places.forEach((place) => {
            if (!allFavoritePlaceIds.includes(place.place_id)) {
              allFavoritePlaceIds.push(place.place_id)
            }
          })
        }
      }

      setFavorites(allFavoritePlaceIds)
      console.log('載入收藏列表:', allFavoritePlaceIds)
    } catch (err) {
      console.error('載入收藏列表失敗:', err)
      setFavorites([])
    }
  }

  /**
   * 監聽使用者登入狀態變化,自動載入收藏列表
   */
  useEffect(() => {
    if (user?.id) {
      fetchUserFavorites() // 登入時載入收藏
    } else {
      setFavorites([]) // 登出時清空收藏
    }
  }, [user?.id])

  // -----------------------------------
  // 3. 地圖標記圖標生成
  // -----------------------------------

  /**
   * 創建自訂的地圖標記圖標
   * @param {Object} place - 景點資料
   * @param {boolean} isHighlighted - 是否為高亮狀態
   * @param {boolean} isDark - 是否為深色模式
   * @returns {Object} Leaflet divIcon 物件
   */
  const createMarkerIcon = (place, isHighlighted, isDark) => {
    const L = leafletRef.current
    if (!L) return null

    // 根據是否被選中決定顏色
    let markerColor, glowColor

    if (isHighlighted) {
      // 選中的標記 - 使用橘色 (與卡片邊框一致)
      markerColor = '#f97316' // Tailwind orange-500
      glowColor = 'rgba(249, 115, 22, 0.6)'
    } else {
      // 普通標記 - 根據深色模式切換顏色
      markerColor = isDark ? '#e1f0f0' : '#cfc3b1'
      glowColor = 'rgba(0, 0, 0, 0.3)'
    }

    // 使用 SVG 創建自訂標記圖標
    return L.divIcon({
      html: `<div style="position: relative; width: 36px; height: 46px; filter: drop-shadow(0 4px 8px ${glowColor}); ${isHighlighted ? 'transform: scale(1.2); z-index: 1000;' : ''}">
      <svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- 漸層色定義 -->
          <linearGradient id="markerGrad-${place.place_id}-${isHighlighted ? 'highlight' : 'normal'}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${markerColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${markerColor};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <!-- 標記主體 (水滴形狀) -->
        <path d="M18 2C10.268 2 4 8.268 4 16c0 10.5 14 28 14 28s14-17.5 14-28c0-7.732-6.268-14-14-14z" 
              fill="url(#markerGrad-${place.place_id}-${isHighlighted ? 'highlight' : 'normal'})" 
              stroke="${isHighlighted ? '#f97316' : '#ffffff'}" 
              stroke-width="${isHighlighted ? '3' : '2.5'}"
              stroke-linejoin="round"/>
        <!-- 中心圓形背景 -->
        <circle cx="18" cy="16" r="6" fill="#ffffff" opacity="0.95"/>
        <!-- 中心圓點 -->
        <circle cx="18" cy="16" r="3.5" fill="${markerColor}"/>
        <!-- 高亮時的外圈光環 -->
        ${isHighlighted ? '<circle cx="18" cy="16" r="8" fill="none" stroke="' + markerColor + '" stroke-width="2" opacity="0.5"/>' : ''}
      </svg>
    </div>`,
      iconSize: [36, 46], // 圖標尺寸
      iconAnchor: [18, 44], // 錨點位置 (對齊到標記底部)
      className: isHighlighted ? 'highlighted-marker' : '',
    })
  }

  // -----------------------------------
  // 4. Leaflet 函式庫動態載入
  // -----------------------------------

  /**
   * 動態載入 Leaflet CSS 和 JS
   * (避免 SSR 問題,僅在客戶端載入)
   */
  useEffect(() => {
    // 避免重複載入或在伺服器端執行
    if (typeof window === 'undefined' || leafletLoaded) return

    // 載入 Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // 載入 Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      leafletRef.current = window.L // 儲存 Leaflet 物件引用
      setLeafletLoaded(true) // 標記為已載入
    }
    document.body.appendChild(script)

    // 清理函數:組件卸載時移除載入的資源
    return () => {
      document.head.removeChild(link)
      document.body.removeChild(script)
    }
  }, [])

  // -----------------------------------
  // 5. 景點資料載入
  // -----------------------------------

  /**
   * 從後端 API 載入所有景點資料
   */
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/places`)
        const data = await res.json()

        if (data.success) {
          setPlaces(data.data) // 儲存所有景點
          setFilteredPlaces(data.data) // 初始化篩選結果

          // 提取唯一的城市列表 (用於篩選器)
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

  // -----------------------------------
  // 6. 地圖初始化
  // -----------------------------------

  /**
   * 初始化 Leaflet 地圖並新增景點標記
   */
  useEffect(() => {
    // 確保 Leaflet 已載入、容器存在、且有景點資料
    if (!leafletLoaded || !mapContainerRef.current || !places.length) return
    if (mapRef.current) return // 避免重複初始化

    const L = leafletRef.current

    // 創建地圖實例 (中心點設在高雄)
    const map = L.map(mapContainerRef.current, {
      center: [22.6273, 120.3014], // 高雄市中心座標
      zoom: 13,
      zoomControl: false, // 隱藏預設縮放控制
    })
    mapRef.current = map

    // 根據深色模式選擇地圖底圖樣式
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // 深色底圖
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' // 淺色底圖 (OSM)

    // 新增底圖圖層
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)

    mapRef.current.tileLayer = tileLayer
    mapRef.current.markers = [] // 初始化標記陣列

    // 為每個景點新增地圖標記
    places.forEach((place) => {
      const icon = createMarkerIcon(place, false, darkMode)
      const marker = L.marker([place.latitude, place.longitude], {
        icon,
      }).addTo(map)

      // 點擊標記時開啟景點詳情 Modal
      marker.on('click', () => {
        setSelectedPlaceId(place.place_id)
        setDetailModalOpen(true)
        setHighlightedPlaceId(place.place_id) // 高亮選中的標記
      })

      // 儲存標記與景點的對應關係
      mapRef.current.markers.push({ marker, place })
    })
  }, [places, leafletLoaded])

  // -----------------------------------
  // 7. 深色模式切換
  // -----------------------------------

  /**
   * 切換深色/淺色地圖底圖
   */
  useEffect(() => {
    if (!mapRef.current || !leafletLoaded) return

    const L = leafletRef.current
    const map = mapRef.current

    // 移除舊的底圖圖層
    if (map.tileLayer) {
      map.removeLayer(map.tileLayer)
    }

    // 根據深色模式選擇新的底圖
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    // 新增新的底圖圖層
    map.tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)
  }, [darkMode, leafletLoaded])

  // -----------------------------------
  // 8. 標記高亮功能
  // -----------------------------------

  /**
   * 更新地圖標記的高亮狀態
   * @param {number} placeId - 要高亮的景點 ID
   */
  const updateMarkerHighlight = (placeId) => {
    if (!mapRef.current || !leafletLoaded) return

    const L = leafletRef.current
    const map = mapRef.current

    // 遍歷所有標記,更新圖標樣式
    if (map.markers) {
      map.markers.forEach(({ marker, place }) => {
        const isHighlighted = place.place_id === placeId
        const icon = createMarkerIcon(place, isHighlighted, darkMode)
        marker.setIcon(icon) // 更新標記圖標
      })
    }
  }

  /**
   * 監聽高亮景點 ID 變化,自動更新標記樣式
   */
  useEffect(() => {
    updateMarkerHighlight(highlightedPlaceId)
  }, [highlightedPlaceId, darkMode, leafletLoaded])

  // -----------------------------------
  // 9. 搜尋與篩選功能
  // -----------------------------------

  /**
   * 根據搜尋關鍵字、城市、分類篩選景點
   */
  useEffect(() => {
    let result = places

    // 1. 關鍵字搜尋 (景點名稱)
    if (searchTerm.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 2. 城市篩選
    if (selectedCity) {
      result = result.filter((p) => p.location_name === selectedCity)
    }

    // 3. 分類篩選
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }

    setFilteredPlaces(result) // 更新篩選結果
  }, [searchTerm, selectedCity, selectedCategory, places])

  // -----------------------------------
  // 10. 使用者定位功能
  // -----------------------------------

  /**
   * 取得使用者當前位置並在地圖上標記
   */
  const getUserLocation = () => {
    // 檢查瀏覽器是否支援定位
    if (!navigator.geolocation) return alert('瀏覽器不支援定位')

    const L = leafletRef.current

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // 定位成功
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)

        // 移動地圖視角到使用者位置
        mapRef.current.setView([loc.lat, loc.lng], 15)

        // 新增使用者位置標記並顯示提示
        L.marker([loc.lat, loc.lng])
          .addTo(mapRef.current)
          .bindPopup('您的位置')
          .openPopup()
      },
      (err) => {
        // 定位失敗
        alert('無法取得位置: ' + err.message)
      }
    )
  }

  // -----------------------------------
  // 11. 清除篩選功能
  // -----------------------------------

  /**
   * 清除所有搜尋與篩選條件
   */
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCity('')
    setSelectedCategory('')
  }

  // -----------------------------------
  // 12. 開啟收藏 Modal
  // -----------------------------------

  /**
   * 開啟收藏 Modal (加入收藏清單)
   * @param {Object} place - 要收藏的景點
   */
  const openFavModal = async (place) => {
    setSelectedPlaceForFav(place)
    setFavModalOpen(true)
  }

  // -----------------------------------
  // 13. 渲染 UI
  // -----------------------------------
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* 地圖容器 */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* 左側側邊欄 (景點列表、搜尋、篩選) */}
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
          // 點擊景點卡片時的處理
          setSelectedPlaceId(place.place_id)
          setHighlightedPlaceId(place.place_id)
          setDetailModalOpen(true)
          // 移動地圖視角到該景點
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

      {/* 景點詳情 Modal */}
      <PlaceDetail
        placeId={selectedPlaceId}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedPlaceId(null)
        }}
      />

      {/* 收藏清單 Modal */}
      <SoloTravelWishlist
        isOpen={favModalOpen}
        onClose={closeFavModal}
        placeId={selectedPlaceForFav?.place_id}
        userId={user?.id}
      />

      {/* 上方切換列 (導航到設定頁面等) */}
      <ToggleBar onNavigateToSettings={navigateToSettings} />

      {/* 旅遊應用其他頁面 (根據導航狀態顯示) */}
      <TravelApp />
    </div>
  )
}

// ============================================
// 主要匯出組件 (用 NavigationProvider 包裹)
// ============================================
export default function FullscreenMap() {
  return (
    <NavigationProvider>
      <MapContent />
    </NavigationProvider>
  )
}
