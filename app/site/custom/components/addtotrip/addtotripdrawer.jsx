'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import * as tripApi from '../../lib/custom/tripApi'
import ConfirmModal from '@/components/confirmModal'
import PlaceInfoCard from './PlaceInfoCard'
import TripSelectionForm from '../ui/TripSelectionForm'
import { useAddToTrip } from '../../hook/useAddToTrip'

/**
 * 加入行程側邊欄元件
 */
export default function AddToTripDrawer({
  isOpen,
  onClose,
  placeId,
  placeName,
  placeCategory,
  placeImage,
  userId,
}) {
  const [mounted, setMounted] = useState(false)

  const {
    userTrips,
    selectedTripId,
    setSelectedTripId,
    selectedTripDayId,
    setSelectedTripDayId,
    tripDays,
    note,
    setNote,
    loading,
    submitting,
    confirmModal,
    closeModal,
    handleSubmit: submitToTrip,
  } = useAddToTrip({
    isOpen,
    userId,
    placeId,
    placeCategory,
    onSuccess: onClose,
  })

  // 確保只在客戶端渲染 Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 控制背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // 關閉側邊欄並重置表單
  const handleClose = () => {
    setSelectedTripId('')
    setSelectedTripDayId('')
    setNote('')
    onClose()
  }

  // 點擊背景遮罩關閉
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 transition-all"
        onClick={handleBackdropClick}
      />

      {/* 側邊欄 */}
      <div
        className={`relative bg-white w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題列 */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">加入行程</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto">
          {/* 景點資訊卡片 */}
          <PlaceInfoCard
            placeName={placeName}
            placeCategory={placeCategory}
            placeImage={placeImage}
          />

          {/* 表單 */}
          <TripSelectionForm
            userTrips={userTrips}
            selectedTripId={selectedTripId}
            setSelectedTripId={setSelectedTripId}
            selectedTripDayId={selectedTripDayId}
            setSelectedTripDayId={setSelectedTripDayId}
            tripDays={tripDays}
            note={note}
            setNote={setNote}
            loading={loading}
          />
        </div>

        {/* 底部按鈕 */}
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200 space-y-3">
          <button
            onClick={submitToTrip}
            disabled={submitting || !selectedTripId || !selectedTripDayId}
            className={`w-full py-3 font-semibold text-white transition-colors ${
              submitting || !selectedTripId || !selectedTripDayId
                ? 'bg-secondary-900 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-secondary-900'
            }`}
          >
            {submitting ? '加入中...' : '確認加入'}
          </button>

          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-full py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>

      {/* 確認對話框 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={() => {
          confirmModal.onConfirm?.()
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
    </div>,
    document.body
  )
}
