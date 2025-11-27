'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import * as tripApi from '../../lib/custom/tripApi'
import PlaceDetail from '../location/PlaceDetail'
import ConfirmModal from '@/components/confirmModal'
import {
  ArrowLeft,
  Heart,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Clock,
  Star,
} from 'lucide-react'

/**
 * 行程詳細頁面元件
 */
export default function TripDetail({
  tripId,
  userId,
  onBack,
  onAddPlace,
  isFavorite,
  onToggleFavorite,
}) {
  const [trip, setTrip] = useState(null)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [showPlaceDetail, setShowPlaceDetail] = useState(false)
  // ✅ 新增：ConfirmModal 狀態
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    tripItemId: null,
  })
  // ✅ 新增：Toast 狀態
  const [toast, setToast] = useState({
    show: false,
    message: '',
  })

  // 載入行程詳細資料
  useEffect(() => {
    const loadTripDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 載入行程詳細:', tripId)
        const result = await tripApi.getTripDetail(tripId)
        console.log('✅ 取得資料:', result)

        // ✅ 正確解析後端回應的資料結構
        if (result.success && result.data) {
          setTrip(result.data.trip)
          setDays(result.data.days || [])
        } else {
          setError('找不到行程資料')
        }
      } catch (err) {
        console.error('❌ 載入失敗:', err)
        setError(err.message || '載入行程失敗')
      } finally {
        setLoading(false)
      }
    }

    if (tripId) {
      loadTripDetail()
    }
  }, [tripId])

  // 移除景點 - 顯示確認對話框
  const handleRemovePlaceClick = (tripItemId) => {
    setConfirmModal({
      isOpen: true,
      tripItemId: tripItemId,
    })
  }

  // 確認移除景點
  const confirmRemovePlace = async () => {
    const tripItemId = confirmModal.tripItemId

    // 關閉 Modal
    setConfirmModal({ isOpen: false, tripItemId: null })

    try {
      console.log('🗑️ 開始刪除景點 ID:', tripItemId)

      // ✅ 直接呼叫 API，不需要透過 props
      const deleteResult = await tripApi.removePlaceFromTrip(tripItemId)

      console.log('📦 刪除結果:', deleteResult)

      // 檢查後端回應
      if (deleteResult.success === false) {
        throw new Error(deleteResult.message || '刪除失敗')
      }

      console.log('✅ 刪除成功，重新載入資料')

      // 重新載入整個行程資料
      const result = await tripApi.getTripDetail(tripId)

      if (result.success && result.data) {
        setTrip(result.data.trip)
        setDays(result.data.days || [])
        console.log('✅ 資料已更新')
      }

      // ✅ 顯示 Toast
      setToast({ show: true, message: '景點已移除' })
      setTimeout(() => {
        setToast({ show: false, message: '' })
      }, 3000)
    } catch (err) {
      console.error('❌ 刪除失敗:', err)
      alert('移除失敗: ' + err.message)
    }
  }
  // 開啟景點詳細頁
  const handlePlaceClick = (placeId) => {
    setSelectedPlaceId(placeId)
    setShowPlaceDetail(true)
  }
  // Loading 狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  // Error 狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            <X className="w-12 h-12 mx-auto mb-2" /> {error}
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-secondary-900 text-white hover:bg-secondary-800"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  // 沒有資料
  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">找不到行程資料</div>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-secondary-900 text-white hover:bg-secondary-800"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導覽 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-secondary-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回列表
            </button>

            <button
              onClick={() => onToggleFavorite(tripId)}
              className="flex items-center text-gray-600 hover:text-red-600"
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 行程封面 */}
      {trip.cover_image_url && (
        <div className="w-full h-64 bg-gray-200">
          <img
            src={trip.cover_image_url}
            alt={trip.trip_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 行程基本資訊 */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            {trip.trip_name}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </div>

            {trip.location_name && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {trip.location_name}
              </div>
            )}
          </div>

          {trip.description && (
            <p className="text-gray-700 mb-4">{trip.description}</p>
          )}

          {trip.summary_text && (
            <div className="bg-primary-50 p-4">
              <p className="text-secondary-900">{trip.summary_text}</p>
            </div>
          )}
        </div>

        {/* 每日行程 */}
        <div className="space-y-6">
          {days.length === 0 ? (
            <div className="bg-white shadow-sm p-8 text-center text-gray-500">
              尚無行程安排
            </div>
          ) : (
            days.map((day) => (
              <div key={day.trip_day_id} className="bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    Day {day.day_number} - {formatDate(day.date)}
                  </h2>
                  <button
                    onClick={() => onAddPlace(day.trip_day_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white hover:bg-primary-600"
                  >
                    <Plus className="w-4 h-4" />
                    新增景點
                  </button>
                </div>

                {/* 景點列表 */}
                {day.items && day.items.length > 0 ? (
                  <div className="space-y-4">
                    {day.items.map((item, index) => (
                      <div
                        key={item.trip_item_id}
                        className="border border-gray-200 p-4 hover:shadow-md hover:border-secondary-900 transition-all cursor-pointer"
                        onClick={() => handlePlaceClick(item.place_id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="flex items-center justify-center w-8 h-8 bg-secondary-900 text-white rounded-full font-semibold">
                                {index + 1}
                              </span>
                              <h3 className="text-lg font-semibold text-secondary-900">
                                {item.place_name || '未命名景點'}
                              </h3>
                              <span className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm">
                                {item.type}
                              </span>
                            </div>

                            {item.start_time && item.end_time && (
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Clock className="w-4 h-4 mr-1" />
                                {item.start_time} - {item.end_time}
                              </div>
                            )}

                            {item.note && (
                              <p className="text-gray-700 mb-2">{item.note}</p>
                            )}

                            {item.rating && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 mr-1 fill-primary-500 text-primary-500" />
                                {item.rating.toFixed(1)}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePlaceClick(item.trip_item_id)
                            }}
                            className="ml-4 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    此日期尚無景點安排
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* 景點詳細頁 Modal */}
      {showPlaceDetail && (
        <PlaceDetail
          placeId={selectedPlaceId}
          isOpen={showPlaceDetail}
          onClose={() => {
            setShowPlaceDetail(false)
            setSelectedPlaceId(null)
          }}
        />
      )}

      {/* ✅ 確認刪除 Modal（使用 Portal 渲染到 body，顯示在整個網站頁面中間） */}
      {confirmModal.isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, tripItemId: null })}
            onConfirm={confirmRemovePlace}
            title="確認刪除"
            message="確定要移除此景點嗎？"
            confirmText="確定"
            cancelText="取消"
            confirmButtonStyle="bg-point-500 hover:bg-point-400"
          />,
          document.body
        )}

      {/* ✅ Toast 通知（右上角，參考 theme.css，無圓角） */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[10000] animate-fade-in">
          <div className="bg-primary-500 text-white px-8 py-4 shadow-2xl border-l-4 border-secondary-900 min-w-[300px]">
            <p className="text-lg font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
