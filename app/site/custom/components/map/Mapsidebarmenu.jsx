import React from 'react' // 新增這一行
import { Search, MapPin, Heart, Star, Sun, Moon, X } from 'lucide-react'
import { useRouter } from 'next/navigation' // 新增：用於頁面導航
import { useAuth } from '@/contexts/AuthContext' // 新增：取得使用者資訊
import { Landmark, Utensils, Hotel } from 'lucide-react'

export default function MapSidebar({
  isOpen,
  onToggle,
  places,
  searchTerm,
  onSearchChange,
  darkMode,
  onDarkModeToggle,
  onGetUserLocation,
  onPlaceClick,
  favorites,
  onOpenFavModal,
  backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  highlightedPlaceId,
  selectedCity = '',
  onCityChange,
  selectedCategory = '',
  onCategoryChange,
  cities = [],
  categories = [
    { value: '景點', label: '景點', icon: 'Landmark' }, // 景點對應 Landmark
    { value: '餐廳', label: '美食', icon: 'Utensils' }, // 餐廳對應 Utensils
    { value: '住宿', label: '住宿', icon: 'Hotel' }, // 住宿對應 Hotel
  ],
  onClearFilters,
}) {
  // 新增：用於滾動到指定景點的 ref
  const placeRefs = React.useRef({})
  const router = useRouter() // 新增：路由器實例
  const { user } = useAuth() // 新增：取得使用者資訊

  // 新增：當 highlightedPlaceId 改變時，滾動到該景點
  React.useEffect(() => {
    if (highlightedPlaceId && placeRefs.current[highlightedPlaceId]) {
      placeRefs.current[highlightedPlaceId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [highlightedPlaceId])

  //圖片處理邏輯（參考 Card 組件）
  const getImageUrl = (place) => {
    if (!place.cover_image) return `${backendUrl}/uploads/default.jpg`
    if (place.cover_image.startsWith('http')) return place.cover_image
    if (place.cover_image.startsWith('/uploads/'))
      return `${backendUrl}${place.cover_image}`
    return `${backendUrl}/uploads/${place.cover_image}`
  }

  //新增：處理取得位置按鈕點擊
  const handleGetLocationClick = () => {
    // 先執行原有的取得位置邏輯
    if (onGetUserLocation) {
      onGetUserLocation()
    }

    //手機版：收合側邊欄
    if (window.innerWidth < 768) {
      onToggle()
    } else {
      //桌面版：導航回 mapPage
      router.push('/site/custom/mapPage')
    }
  }
  const IconMap = {
    Landmark: Landmark,
    Utensils: Utensils,
    Hotel: Hotel,
    // 如果傳入的 categories 陣列有額外的項目，可以根據需要在這裡擴展映射
  }

  return (
    <>
      {/* 深色模式按鈕 - 移到標題下方 */}
      <div className="fixed right-4 top-20 md:top-1 text-white rounded-full bg-secondary-900/80 mt-3 flex items-center justify-center z-50">
        <button
          onClick={onDarkModeToggle}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          title={darkMode ? '切換淺色模式' : '切換深色模式'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* 漂浮按鈕 - 只在關閉時顯示 */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-20 left-4 md:top-6 md:left-20 z-[110] bg-secondary-900 hover:bg-secondary-600 text-white rounded-full p-3 shadow-xl transition-all hover:scale-110"
          title="打開側邊欄"
        >
          <MapPin size={24} />
        </button>
      )}

      <div
        className={`fixed top-15 md:top-6 left-0 h-[calc(100%-3.5rem)] md:h-[calc(100%-3rem)] z-[120] transition-all duration-500  ${
          isOpen
            ? 'w-full md:w-1/4 translate-x-0 md:left-30'
            : 'w-full md:w-80 -translate-x-full'
        } bg-white shadow-sm backdrop-blur`}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white text-secondary-900 px-4 md:px-5 pt-4 md:pt-6 relative">
              {/* 關閉按鈕 - 右上角 */}
              <button
                onClick={onToggle}
                className="absolute right-3 top-3 p-2 hover:bg-white/20 rounded-full transition-colors"
                title="關閉側邊欄"
              >
                <X size={20} />
              </button>
              <div className="flex items-center justify-between pr-10">
                <h1 className="text-xl md:text-md py-2 font-bold flex items-center gap-2">
                  景點地圖
                </h1>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="搜尋景點..."
                  className="w-full pl-9 py-1.5 rounded-md text-gray-900  border-1 border-gray-500 focus:ring-1 focus:ring-primary-300 focus:outline-none text-sm md:text-base"
                />
              </div>
            </div>
            {/* 新增：城市篩選 */}
            <select
              value={selectedCity}
              onChange={(e) => onCityChange?.(e.target.value)}
              className={`mt-3 mx-5 px-3 py-1 rounded-md text-sm cursor-pointer transition ${
                selectedCity
                  ? ' text-secondary-900 font-normal'
                  : 'text-secondary-600 hover:bg-white/30 border-1 border-gray-500'
              }`}
            >
              <option value="" className="text-gray-900">
                所有城市
              </option>
              {cities.map((city) => (
                <option key={city} value={city} className="text-gray-900">
                  {city}
                </option>
              ))}
            </select>

            {/* 新增：分類篩選 */}
            <div className="mt-3 flex justify-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              {categories.map((cat) => {
                const IconComponent = IconMap[cat.icon]
                return (
                  <button
                    key={cat.value}
                    onClick={() =>
                      onCategoryChange?.(
                        selectedCategory === cat.value ? '' : cat.value
                      )
                    }
                    className={`px-5 py-1.5 rounded-full text-xs whitespace-nowrap transition flex items-center gap-1 ${
                      selectedCategory === cat.value
                        ? 'bg-primary-500 text-white font-medium'
                        : 'bg-secondary-600 text-white hover:bg-primary-500'
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    )}
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* 新增：清除篩選按鈕 */}
            {(searchTerm || selectedCity || selectedCategory) && (
              <button
                onClick={onClearFilters}
                className="my-2 w-full hover:text-gray-400 py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <X size={16} /> 清除篩選
              </button>
            )}

            {/* 取得位置按鈕 */}
            {/* 新增：結果統計 */}
            <div className="px-6 py-2">
              <span className="text-xs text-gray-600">
                找到{' '}
                <span className=" font-normal text-secondary-600">
                  {places.length}
                </span>{' '}
                個景點
              </span>
            </div>

            {/* 景點列表 */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-20 md:pb-24 space-y-4 md:space-y-6 scrollbar-hide">
              {places.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">找不到符合條件的景點</p>
                  {(searchTerm || selectedCity || selectedCategory) && (
                    <button
                      onClick={onClearFilters}
                      className="mt-3 text-blue-500 hover:text-blue-600 text-sm underline"
                    >
                      清除篩選條件
                    </button>
                  )}
                </div>
              ) : (
                places.map((place) => (
                  <div
                    key={place.place_id}
                    ref={(el) => (placeRefs.current[place.place_id] = el)}
                    onClick={() => onPlaceClick(place)}
                    className={`cursor-pointer rounded-lg overflow-hidden relative transition-all ${
                      highlightedPlaceId === place.place_id
                        ? 'border-2 border-secondary-600 shadow-xs'
                        : 'border border-gray-200 hover:bg-orange-50'
                    }`}
                  >
                    <img
                      src={getImageUrl(place)}
                      alt={place.name}
                      className="w-full h-28 object-cover"
                      onError={(e) => {
                        e.target.src = `${backendUrl}/uploads/default.jpg`
                      }}
                    />
                    <div className="p-2 flex justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{place.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                          <Star size={12} fill="currentColor" />
                          <span>{place.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // 檢查是否登入
                          if (!user) {
                            alert('請先登入才能收藏景點')
                            return
                          }
                          onOpenFavModal(place)
                        }}
                        className="p-1"
                        title={user ? '加入收藏' : '請先登入'}
                      >
                        <Heart
                          size={16}
                          fill={
                            favorites.includes(place.place_id) ? 'red' : 'none'
                          }
                          color={
                            favorites.includes(place.place_id) ? 'red' : 'gray'
                          }
                        />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="absolute bottom-0 left-0 w-full bg-white py-3 md:py-4 px-4 md:px-6 shadow-lg">
              <button
                onClick={handleGetLocationClick}
                className="w-full bg-secondary-900 cursor-pointer whitespace-nowrap text-white hover:bg-primary-500 py-2.5 md:py-2 rounded-lg md:rounded-none flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <MapPin size={16} /> 取得我的位置
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
