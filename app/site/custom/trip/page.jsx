'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ToggleBar from '@/components/toggleBar'
import MyTripsList from '../components/addtotrip/mytripslist'
import FavoritesList from '../components/addtotrip/favoriteslist'
import CreateTripForm from '../components/addtotrip/addtotripdrawer copy'
import TripDetail from '../components/addtotrip/tripdetail'
import PlaceSearchModal from '../components/addtotrip/placesearchmodal'
import AddToTripDrawer from '../components/addtotrip/addtotripdrawer'
import * as tripApi from '../lib/custom/tripApi'

/**
 * 行程管理主頁面 (Auth V2)
 */
export default function TripsPage() {
  const { user } = useAuth() // ✅ Auth V2

  // 當前顯示的標籤頁
  const [activeTab, setActiveTab] = useState('myTrips')

  // 我的行程資料
  const [myTrips, setMyTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(false)

  // 收藏的行程資料
  const [favorites, setFavorites] = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  // 當前查看的行程 ID (進入詳細頁面時使用)
  const [currentTripId, setCurrentTripId] = useState(null)

  // ✅ 新增: 景點搜尋和加入相關 state
  const [showPlaceSearch, setShowPlaceSearch] = useState(false)
  const [showAddToTrip, setShowAddToTrip] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [currentTripDayId, setCurrentTripDayId] = useState(null)

  // 載入我的行程
  const loadMyTrips = async () => {
    if (!user?.id) return

    try {
      setLoadingTrips(true)
      const data = await tripApi.getUserTrips(user.id, 'created_at')
      setMyTrips(data.data || [])
    } catch (error) {
      console.error('載入行程失敗:', error)
      alert('載入行程失敗')
    } finally {
      setLoadingTrips(false)
    }
  }

  // 載入收藏的行程
  const loadFavorites = async () => {
    if (!user?.id) return

    try {
      setLoadingFavorites(true)
      const data = await tripApi.getUserFavorites(user.id)
      setFavorites(data.data || [])
    } catch (error) {
      console.error('載入收藏失敗:', error)
      alert('載入收藏失敗')
    } finally {
      setLoadingFavorites(false)
    }
  }

  // 初始載入
  useEffect(() => {
    if (user?.id) {
      loadMyTrips()
      loadFavorites()
    }
  }, [user?.id])

  // 建立新行程
  const handleCreateTrip = async (formData) => {
    if (!user?.id) {
      alert('請先登入')
      return
    }

    try {
      const tripData = {
        trip_name: formData.trip_name,
        user_id: user.id,
        description: formData.description || '',
        start_date: formData.start_date,
        end_date: formData.end_date,
        cover_image_url: formData.cover_image_url?.trim() || null,
        summary_text: formData.summary_text || null,
        is_public: Boolean(formData.is_public),
        location_id: formData.location_id
          ? parseInt(formData.location_id)
          : null,
      }

      console.log('📤 送出資料:', tripData)

      const result = await tripApi.createTrip(tripData)
      console.log('✅ 建立成功:', result)

      alert('行程建立成功!')
      setActiveTab('myTrips')
      loadMyTrips()
    } catch (error) {
      console.error('❌ 建立失敗:', error)
      alert('建立行程失敗: ' + error.message)
    }
  }

  // 刪除行程
  const handleDeleteTrip = async (tripId) => {
    try {
      await tripApi.deleteTrip(tripId)
      alert('行程已刪除')
      loadMyTrips()
    } catch (error) {
      console.error('刪除行程失敗:', error)
      alert('刪除行程失敗')
    }
  }

  // 複製行程
  const handleCopyTrip = async (tripId) => {
    if (!user?.id) return

    try {
      await tripApi.copyTrip(tripId, user.id)
      alert('行程複製成功!')
      loadMyTrips()
    } catch (error) {
      console.error('複製行程失敗:', error)
      alert('複製行程失敗')
    }
  }

  // 點擊行程卡片 - 進入詳細頁面
  const handleTripClick = (tripId) => {
    setCurrentTripId(tripId)
  }

  // 返回列表
  const handleBackToList = () => {
    setCurrentTripId(null)
    loadMyTrips()
    loadFavorites()
  }

  // 收藏/取消收藏
  const handleToggleFavorite = async (tripId) => {
    if (!user?.id) return

    try {
      const isFavorite = favorites.some((fav) => fav.trip_id === tripId)

      if (isFavorite) {
        await tripApi.removeFavorite(user.id, tripId)
        alert('已取消收藏')
      } else {
        await tripApi.addFavorite(user.id, tripId)
        alert('收藏成功!')
      }

      loadFavorites()
    } catch (error) {
      console.error('操作失敗:', error)
      alert(error.message)
    }
  }

  // 移除收藏
  const handleRemoveFavorite = async (tripId) => {
    if (!user?.id) return

    try {
      await tripApi.removeFavorite(user.id, tripId)
      alert('已取消收藏')
      loadFavorites()
    } catch (error) {
      console.error('取消收藏失敗:', error)
      alert('取消收藏失敗')
    }
  }

  // ✅ 新增景點到某一天
  const handleAddPlace = async (tripDayId) => {
    setCurrentTripDayId(tripDayId)
    setShowPlaceSearch(true)
  }

  // 移除景點
  const handleRemovePlace = async (tripItemId) => {
    try {
      await tripApi.removePlaceFromTrip(tripItemId)
      return true
    } catch (error) {
      console.error('移除景點失敗:', error)
      throw error
    }
  }

  // 更新景點順序
  const handleUpdateOrder = async (tripItemId, sortOrder) => {
    try {
      await tripApi.updatePlaceOrder(tripItemId, sortOrder)
    } catch (error) {
      console.error('更新順序失敗:', error)
      throw error
    }
  }

  // ✅ 處理從搜尋彈窗選擇景點
  const handlePlaceSelect = (placeId, placeName, placeCategory, placeImage) => {
    setSelectedPlace({
      placeId,
      placeName,
      placeCategory,
      placeImage,
    })
    setShowPlaceSearch(false)
    setShowAddToTrip(true)
  }

  // ✅ 處理加入成功後 (目前暫時不需要這個函數,因為側邊欄會自己關閉並刷新)

  // 如果正在查看行程詳細頁面
  if (currentTripId) {
    return (
      <>
        <TripDetail
          tripId={currentTripId}
          userId={user?.id}
          onBack={handleBackToList}
          onAddPlace={handleAddPlace}
          onRemovePlace={handleRemovePlace}
          onUpdateOrder={handleUpdateOrder}
          isFavorite={favorites.some((fav) => fav.trip_id === currentTripId)}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* ✅ 景點搜尋彈窗 */}
        <PlaceSearchModal
          isOpen={showPlaceSearch}
          onClose={() => setShowPlaceSearch(false)}
          tripDayId={currentTripDayId}
          userId={user?.id}
          onPlaceSelect={handlePlaceSelect}
        />

        {/* ✅ 加入行程側邊欄 */}
        {selectedPlace && (
          <AddToTripDrawer
            isOpen={showAddToTrip}
            onClose={() => {
              setShowAddToTrip(false)
              setSelectedPlace(null)
            }}
            placeId={selectedPlace.placeId}
            placeName={selectedPlace.placeName}
            placeCategory={selectedPlace.placeCategory}
            placeImage={selectedPlace.placeImage}
            userId={user?.id}
          />
        )}
      </>
    )
  }

  // 主列表頁面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 切換欄 */}
      <ToggleBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myTripsCount={myTrips.length}
        favoritesCount={favorites.length}
      />

      {/* 內容區域 */}
      <div className="container mx-auto">
        {activeTab === 'myTrips' && (
          <div>
            {loadingTrips ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">載入中...</p>
                </div>
              </div>
            ) : (
              <MyTripsList
                trips={myTrips}
                onTripClick={handleTripClick}
                onDeleteTrip={handleDeleteTrip}
                onCopyTrip={handleCopyTrip}
              />
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {loadingFavorites ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">載入中...</p>
                </div>
              </div>
            ) : (
              <FavoritesList
                favorites={favorites}
                onTripClick={handleTripClick}
                onRemoveFavorite={handleRemoveFavorite}
              />
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <CreateTripForm
            userId={userId}
            onSubmit={handleCreateTrip}
            onCancel={() => setActiveTab('myTrips')}
          />
        )}
      </div>
    </div>
  )
}