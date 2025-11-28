'use client'

import React, { useState,useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, Edit2, Upload, X } from 'lucide-react'
import { createTrip, updateTrip  } from '@/app/site/custom/lib/custom/tripApi'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmModal from '@/components/confirmModal'
export default function ItinerarySettings({
  onNavigateToList,
  onClose,
  onTripCreated,
  editingTrip = null,
  isEditMode = false,
}) {
  const [itineraryName, setItineraryName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
  )
  const [description, setDescription] = useState('')
  const [summaryText, setSummaryText] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  // 新增 ConfirmModal 狀態
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '確定',
    cancelText: '取消',
  })
  // ✅ 使用 AuthContext 取得使用者 ID
  const { user } = useAuth()
  const userId = user?.id
  useEffect(() => {
    if (isEditMode && editingTrip) {
      console.log('進入編輯模式，載入資料:', editingTrip)
      setItineraryName(editingTrip.trip_name || '')
      setStartDate(editingTrip.start_date?.split('T')[0] || '')
      setEndDate(editingTrip.end_date?.split('T')[0] || '')
      setDescription(editingTrip.description || '')
      setSummaryText(editingTrip.summary_text || '')
      setIsPublic(editingTrip.is_public === 1 || editingTrip.is_public === true)
      setCoverImageUrl(
        editingTrip.cover_image_url ||
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
      )
    }
  }, [isEditMode, editingTrip])
  // 新增輔助函數
  const showSuccess = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '成功',
      message,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, isOpen: false })
        // 觸發回調並導航
        if (onTripCreated) onTripCreated()
        setTimeout(() => {
          if (onNavigateToList) onNavigateToList()
        }, 200)
      },
      confirmText: '確定',
      cancelText: '取消',
    })
  }

  const showError = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '錯誤',
      message,
      onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
      confirmText: '確定',
      cancelText: '取消',
    })
  }

  const showConfirm = (title, message, onConfirm, confirmText = '確定') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText: '取消',
    })
  }

  const closeModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false })
  }
  // 計算天數
  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  // 處理表單提交
  const handleSubmit = async () => {
    // 驗證使用者登入狀態
    if (!userId) {
      showError('請先登入')
      return
    }

    // 驗證必填欄位
    if (!itineraryName.trim()) {
      showError('請輸入行程名稱')
      return
    }
    if (!startDate || !endDate) {
      showError('請選擇行程日期')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      showError('結束日期不能早於開始日期')
      return
    }

    setLoading(true)

    try {
      const tripData = {
        trip_name: itineraryName.trim(),
        description: description.trim() || null,
        start_date: startDate,
        end_date: endDate,
        cover_image_url: imagePreview || coverImageUrl,
        summary_text: summaryText.trim() || null,
        is_public: isPublic ? 1 : 0,
      }

      if (!isEditMode) {
        tripData.user_id = userId
        tripData.location_id = null
      }

      console.log(isEditMode ? '更新行程資料:' : '建立行程資料:', tripData)

      let response
      if (isEditMode) {
        response = await updateTrip(editingTrip.trip_id, tripData)
        if (response.success) {
          console.log('行程更新成功:', response.data)
          // 清空表單
          resetForm()
          showSuccess('行程已更新！')
        }
      } else {
        response = await createTrip(tripData)
        if (response.success) {
          console.log('行程建立成功:', response.data)
          // 清空表單
          resetForm()
          showSuccess(
            `行程建立成功！已自動生成 ${response.data.days_created} 天的行程`
          )
        }
      }
    } catch (error) {
      console.error(isEditMode ? '更新行程失敗:' : '建立行程失敗:', error)
      showError(
        `${isEditMode ? '更新' : '建立'}行程失敗: ${error.message || '請稍後再試'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // 重置表單
  const resetForm = () => {
    setItineraryName('')
    setStartDate('')
    setEndDate('')
    setDescription('')
    setSummaryText('')
    setIsPublic(false)
    setImagePreview(null)
    setCoverImageUrl(
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
    )
  }
  // 移除預覽圖片
  const handleRemovePreview = () => {
    setImagePreview(null)
  }

  // 處理取消
  const handleCancel = () => {
    if (itineraryName || startDate || endDate || description) {
      showConfirm(
        '確認取消',
        '確定要放棄目前的編輯內容嗎?',
        () => {
          closeModal()
          resetForm()
          onClose()
        },
        '確定'
      )
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed px-1 right-0 top-0 h-full w-full md:w-[400px] lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
      {/* Header */}
      <div className="flex justify-start items-center px-6 py-4 border-b border-gray-200 relative bg-white top-0 z-10">
        {/* 左側返回按鈕 */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition z-10"
          disabled={loading}
        >
          <ChevronLeft size={24} />
          <span className="text-base font-medium">返回</span>
        </button>

        {/* 標題 (絕對定位置中) */}
        <span className="absolute left-1/2 transform -translate-x-1/2 text-base font-bold text-gray-800">
          {isEditMode ? '編輯行程' : '行程設定'}
        </span>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-32 ">
        {/* Cover Photo Section */}
        <div className="mb-6">
          <div className="relative overflow-hidden shadow-md">
            <img
              src={imagePreview || coverImageUrl}
              alt="Travel cover"
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.src = '/photo_error.svg'
              }}
            />
          </div>
        </div>

        {/* Itinerary Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            行程名稱
          </label>
          <input
            type="text"
            value={itineraryName}
            onChange={(e) => setItineraryName(e.target.value)}
            placeholder="例如: 日本東京五日遊"
            className="w-full px-4 py-3 border border-gray-300 rounded-sm  text-base transition"
            disabled={loading}
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {itineraryName.length} / 100
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            行程日期
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">出發日</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-base transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">結束日</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-base transition"
                disabled={loading}
                min={startDate} // 結束日期不能早於開始日期
              />
            </div>
          </div>

          {/* 顯示天數 */}
          {startDate && endDate && calculateDays() > 0 && (
            <div className="mt-2 text-sm text-secondary-600 font-medium">
              共 {calculateDays()} 天
            </div>
          )}
        </div>

        {/* Summary Text (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            簡短摘要
          </label>
          <input
            type="text"
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="例如: 三天兩夜台北自由行"
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none text-base transition"
            disabled={loading}
            maxLength={200}
          />
          <div className="text-xs text-gray-500 mt-1">
            簡短描述這次旅行 ({summaryText.length} / 200)
          </div>
        </div>

        {/* Description (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            詳細描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="詳細描述這次旅行的計畫、目的地、預算等..."
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-transparent text-base transition resize-none"
            rows="4"
            disabled={loading}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {description.length} / 500
          </div>
        </div>

        {/* Public/Private Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between p-4 border border-gray-300 rounded-sm hover:bg-gray-50 transition cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700">
                公開行程
              </span>
              <p className="text-xs text-gray-500 mt-1">
                其他使用者可以瀏覽和收藏你的行程
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600"></div>
            </div>
          </label>
        </div>

        {/* Preview Info */}
        {itineraryName && startDate && endDate && (
          <div className="mb-6 p-4 bg-secondary-50 border border-secondary-200 rounded-sm">
            <h4 className="text-sm font-semibold text-secondary-900 mb-2">
              行程預覽
            </h4>
            <div className="space-y-1 text-sm text-secondary-800">
              <p>
                <strong>名稱:</strong> {itineraryName}
              </p>
              <p>
                <strong>日期:</strong> {startDate} ~ {endDate}
              </p>
              <p>
                <strong>天數:</strong> {calculateDays()} 天
              </p>
              <p>
                <strong>狀態:</strong> {isPublic ? '公開' : '私人'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 right-0 w-full md:w-[400px] lg:w-[450px] bg-white border-t border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCancel}
            className="py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-full font-medium text-base hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 px-6 bg-primary-500 text-white rounded-full font-medium text-base hover:bg-secondary-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading || !itineraryName || !startDate || !endDate}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                建立中...
              </>
            ) : isEditMode ? (
              '儲存'
            ) : (
              '完成'
            )}
          </button>
        </div>
      </div>
      {/* 確認對話框 - 使用 Portal 渲染到 body */}
      {confirmModal.isOpen &&
        createPortal(
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
          />,
          document.body
        )}
    </div>
  )
}
