'use client'

import { useState, useEffect } from 'react'  // ✅ 新增
import { useSearchParams } from 'next/navigation'  // ✅ 確認有這個
import AuthGuard from '@/components/auth/AuthGuard'
import SearchFilterNavbar from './components/map/SearchFilterNavbar'
import LoadingSpinner from './components/location/loadingSpinner'
import EmptyState from './components/addtotrip/emptystate'
import PlaceGrid from './components/location/placegrid'
import Pagination from './components/map/pagination'
import { useAuth } from '@/contexts/AuthContext'
import { usePlaces, InfiniteScrollTrigger } from './hook/use-Places'
import { useFilters } from './hook/use-filter'
import { usePagination } from './hook/use-pagination'
import '@/app/globals.css'
import ToggleBar from '@/components/toggleBar'
import TravelApp, {
  NavigationProvider,
  useNavigation,
} from './components/addtotrip/travelApp'
import MapTransition from '@/components/mapTransition' // 引入地圖轉場組件

/**
 * WrappedApp - 景點列表主頁面
 * @returns {JSX.Element}
 */
function App() {
  const { navigateToSettings } = useNavigation()

  // ============ 使用 AuthContext Hook ============
  const { user, logout } = useAuth()
  
  // ✅ 新增：ToggleBar 開關狀態和當前查看的行程 ID
  const [isToggleBarOpen, setIsToggleBarOpen] = useState(false)
  const [targetTripId, setTargetTripId] = useState(null)

  // ✅ 新增：監聽 sessionStorage，自動打開 ToggleBar
  useEffect(() => {
    const openTripId = sessionStorage.getItem('openTripId')
    
    if (openTripId) {
      console.log('🔍 偵測到 sessionStorage 中的 tripId:', openTripId)
      setTargetTripId(Number(openTripId))
      setIsToggleBarOpen(true)
      
      // ✅ 用完立即清除
      sessionStorage.removeItem('openTripId')
    }
  }, [])  // 只在元件載入時執行一次

  /**
   * 處理登出按鈕點擊事件
   */
  const handleLogout = async () => {
    try {
      const confirmed = window.confirm('確定要登出嗎？')
      if (!confirmed) return

      await logout()
    } catch (error) {
      console.error('登出失敗:', error)
      alert('登出失敗，請稍後再試')
    }
  }

  // ============ 景點數據管理（使用 SWR 版本）============
   // ✅ 修改：處理 ToggleBar 開關，關閉時清除 targetTripId
  const handleToggleBar = () => {
    if (isToggleBarOpen) {
      // 關閉時清除狀態
      setTargetTripId(null)
    }
    setIsToggleBarOpen(!isToggleBarOpen)
  }
  // 景點數據管理
  const {
    allPlaces,
    filteredPlaces,
    setFilteredPlaces,
    places, // Pagination 模式使用
    setPlaces,
    currentPage,
    setCurrentPage,
    isLoading,
    cities,
    totalPages,
    itemsPerPage,
    // 無限滾動相關
    displayPlaces, // 無限滾動模式使用
    isLoadingMore,
    hasMore,
    lastItemRef,
    resetPage,
  } = usePlaces({ itemsPerPage: 30 })

  // ============ 篩選狀態管理 ============
  const {
    searchTerm,
    setSearchTerm,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
  } = useFilters(allPlaces, setFilteredPlaces, setCurrentPage)

  // ============ 分頁邏輯管理（保留以支援 Pagination 組件）============
  const { handlePageChange } = usePagination({
    currentPage,
    setCurrentPage,
    filteredPlaces,
    setPlaces,
    itemsPerPage,
    totalPages,
  })

  // ============ 當篩選條件改變時，重置到第一頁 ============
  useEffect(() => {
    resetPage()
  }, [searchTerm, selectedCity, selectedCategory, resetPage])

  // ============ 選擇使用哪種模式的資料 ============
  // 無限滾動模式：使用 displayPlaces
  // 分頁模式：使用 places
  const USE_INFINITE_SCROLL = true // 設為 true 啟用無限滾動，false 使用分頁
  const displayData = USE_INFINITE_SCROLL ? displayPlaces : places

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-gray-50">
        {/* 主要內容區塊 */}
        <main className="md:ml-16 lg:p-4">
          {/* 搜尋篩選 Navbar */}
          <SearchFilterNavbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            cities={cities}
            resultCount={filteredPlaces.length}
            onClearFilters={clearFilters}
            placeholder="搜尋景點名稱、描述或城市..."
          />

          <div className="ml-0 md:mx-10">
            {/* 卡片瀑布流 */}
            {!isLoading && displayData.length > 0 && (
              <PlaceGrid places={displayData} currentPage={currentPage} />
            )}

            {/* 載入中提示 */}
            {isLoading && <LoadingSpinner />}

            {/* 無資料提示 */}
            {!isLoading && displayData.length === 0 && (
              <EmptyState onClearFilters={clearFilters} />
            )}

            {/* ============ 根據模式顯示不同的控制器 ============ */}
            {USE_INFINITE_SCROLL
              ? // 無限滾動觸發器
                !isLoading &&
                displayData.length > 0 && (
                  <InfiniteScrollTrigger
                    lastItemRef={lastItemRef}
                    isLoading={isLoadingMore}
                    hasMore={hasMore}
                  />
                )
              : // 分頁控制器
                !isLoading &&
                displayData.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
          </div>

          {/* 地圖按鈕 - 固定在左下角 */}
          <div className="fixed bottom-6 left-6 z-50">
            <MapTransition
              targetUrl="/site/custom/mapPage"
              className="shadow-xl hover:shadow-2xl"
            />
          </div>
        </main>

        {/* ✅ 傳遞完整參數給 ToggleBar */}
        <ToggleBar
          userId={user?.id || 1}
          isOpen={isToggleBarOpen}  // ✅ 新增：控制開關
          onToggle={handleToggleBar}  // ✅ 新增：切換函式
          initialTripId={targetTripId}  // ✅ 新增：初始要顯示的行程 ID
          onNavigateToSettings={navigateToSettings}
        />

        {/* TravelApp 會根據導航狀態顯示對應的頁面 */}
        <TravelApp />
      </div>
    </AuthGuard>
  )
}

/**
 * AppWrapper - 主要導出元件
 */
function AppWrapper() {
  return (
    <NavigationProvider>
      <App />
    </NavigationProvider>
  )
}

export default AppWrapper
