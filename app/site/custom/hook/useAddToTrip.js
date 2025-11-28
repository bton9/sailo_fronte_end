import { useState, useEffect } from 'react'
import * as tripApi from '../../custom/lib/custom/tripApi'

/**
 * 加入行程的自定義 Hook
 * 處理所有業務邏輯和狀態管理
 */
export function useAddToTrip({
  isOpen,
  userId,
  placeId,
  placeCategory,
  onSuccess,
}) {
  const [userTrips, setUserTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState('')
  const [selectedTripDayId, setSelectedTripDayId] = useState('')
  const [tripDays, setTripDays] = useState([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '確定',
    cancelText: '取消',
  })

  // 顯示成功訊息
  const showSuccess = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '成功',
      message,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        onSuccess?.()
      },
      confirmText: '確定',
      cancelText: '取消',
    })
  }

  // 顯示錯誤訊息
  const showError = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '錯誤',
      message,
      onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      confirmText: '確定',
      cancelText: null,
    })
  }

  // 關閉對話框
  const closeModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
  }

  // 載入使用者的行程列表
  useEffect(() => {
    if (isOpen && userId) {
      loadUserTrips()
    }
  }, [isOpen, userId])

  // 當選擇行程時,載入該行程的日期列表
  useEffect(() => {
    if (selectedTripId) {
      loadTripDays()
    } else {
      setTripDays([])
      setSelectedTripDayId('')
    }
  }, [selectedTripId])

  // 載入使用者的行程列表
  const loadUserTrips = async () => {
    try {
      setLoading(true)
      const result = await tripApi.getUserTrips(userId, 'created_at')

      if (result.success && result.data) {
        setUserTrips(result.data)
      } else {
        setUserTrips([])
      }
    } catch (error) {
      console.error('載入行程列表失敗:', error)
      showError('載入行程列表失敗,請稍後再試')
      setUserTrips([])
    } finally {
      setLoading(false)
    }
  }

  // 載入選中行程的日期列表
  const loadTripDays = async () => {
    try {
      const result = await tripApi.getTripDetail(selectedTripId)

      if (result.success && result.data && result.data.days) {
        setTripDays(result.data.days)
        // 預設選擇第一天
        if (result.data.days.length > 0) {
          setSelectedTripDayId(result.data.days[0].trip_day_id)
        }
      } else {
        setTripDays([])
        setSelectedTripDayId('')
      }
    } catch (error) {
      console.error('載入日期列表失敗:', error)
      setTripDays([])
      setSelectedTripDayId('')
    }
  }

  // 驗證表單
  const validateForm = () => {
    if (!selectedTripId) {
      showError('請選擇行程')
      return false
    }

    if (!selectedTripDayId) {
      showError('請選擇日期')
      return false
    }

    return true
  }

  // 送出表單
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)

      // 取得當天已有的景點數量,用於設定 sort_order
      const selectedDay = tripDays.find(
        (day) => day.trip_day_id === parseInt(selectedTripDayId)
      )
      const currentItemsCount = selectedDay?.items?.length || 0

      // 準備資料
      const placeData = {
        place_id: placeId,
        type: placeCategory,
        note: note.trim() || null,
        start_time: null,
        end_time: null,
        sort_order: currentItemsCount + 1,
      }

      console.log('送出資料:', placeData)

      // 呼叫 API
      const result = await tripApi.addPlaceToDay(selectedTripDayId, placeData)

      if (result.success) {
        // 取得行程名稱和日期資訊
        const selectedTrip = userTrips.find(
          (trip) => trip.trip_id === parseInt(selectedTripId)
        )
        const dayNumber = selectedDay?.day_number || ''

        showSuccess(
          `已成功加入到【${selectedTrip?.trip_name || '行程'} - Day ${dayNumber}】`
        )
      } else {
        throw new Error(result.message || '加入失敗')
      }
    } catch (error) {
      console.error('加入行程失敗:', error)
      showError('加入行程失敗: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
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
    handleSubmit,
  }
}
