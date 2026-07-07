'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import RIC_ai from '@/lib/react_icon/ai'
import RIC_fi from '@/lib/react_icon/fi'
import TripDetail from '@/app/site/custom/components/addtotrip/tripdetail'
import PlaceSearchModal from '@/app/site/custom/components/addtotrip/placesearchmodal'
import {
  getUserTrips,
  deleteTrip,
  copyTrip,
  addFavorite,
  removeFavorite,
  getUserFavorites,
  addPlaceToDay,
} from '@/app/site/custom/lib/custom/tripApi'
import {
  Plus,
  X,
  ChevronDown,
  MoreVertical,
  Heart,
  Calendar,
  MapPin,
  Link2,
  Trash2,
  Copy,
  Users,
  Package,
  Edit2,
} from 'lucide-react'
import ItinerarySettings from '../app/site/custom/components/addtotrip/travelSetting'
import ConfirmModal from './confirmModal'
import { useAuth } from '@/contexts/AuthContext'

// 行程卡片元件
const ScheduleCard = ({
  schedule,
  onCopy,
  onDelete,
  onFavorite,
  onView,
  onEdit,
  isFavorited,
}) => {
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '日期未設定'

    const start = new Date(startDate)
    const end = new Date(endDate)

    const formatDate = (date) => {
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
    }

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const diffTime = end - start
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    return diffDays < 0 ? 0 : diffDays + 1
  }

  return (
    <div
      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer  border border-gray-100"
      onClick={() => onView(schedule)}
    >
      {/* 圖片區域 */}
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
        {schedule.cover_image_url ? (
          <Image
            src={schedule.cover_image_url}
            alt={schedule.trip_name}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <MapPin className="w-16 h-16 text-white" />
          </div>
        )}

        {/* 公開/私人標籤 - 左上角 */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
            schedule.is_public
              ? 'bg-primary-500 text-white'
              : 'bg-secondary-900 text-white'
          }`}
        >
          {schedule.is_public ? '公開' : '私人'}
        </div>

        {/* 收藏按鈕 - 右上角 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite(schedule)
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
        >
          <Heart
            className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* 底部資訊漸層遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-lg font-bold mb-1">
            {schedule.trip_name}
          </h3>
          <p className="text-white/90 text-sm">
            {formatDateRange(schedule.start_date, schedule.end_date)}
          </p>
          <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {calculateDays(schedule.start_date, schedule.end_date)} 天
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {schedule.total_items || 0} 個景點
            </span>
          </div>
        </div>

        {/* 刪除和更多按鈕 - 右下角 */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(schedule)
            }}
            className="w-9 h-9 flex rounded-full items-center justify-center hover:bg-white transition-all shadow-md"
            title="刪除行程"
          >
            <Trash2 className="w-4 h-4 text-white " />
          </button>
          <ActionDropdown
            schedule={schedule}
            onCopy={onCopy}
            onFavorite={onFavorite}
            onEdit={onEdit}
            isFavorited={isFavorited}
          />
        </div>
      </div>
    </div>
  )
}

// 操作選單元件
const ActionDropdown = ({
  schedule,
  onCopy,
  onFavorite,
  onEdit,
  isFavorited,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white  transition-all shadow-sm"
      >
        <MoreVertical className="w-4 h-4 text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-150 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl">
          <ul className="py-1">
            <li
              onClick={(e) => {
                e.stopPropagation()
                onEdit(schedule)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              <Edit2 className="mr-2 w-4 h-4" />
              <span>編輯行程</span>
            </li>
            <li
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(schedule)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              <Heart
                className={`mr-2 w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`}
              />
              <span>{isFavorited ? '取消收藏' : '加入收藏'}</span>
            </li>
            <li
              onClick={(e) => {
                e.stopPropagation()
                onCopy(schedule)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              <Copy className="mr-2 w-4 h-4" />
              <span>複製行程</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

// 主元件
const ToggleBar = ({
  userId = 3,
  isOpen: isOpenProp,
  onToggle,
  initialTripId = null,
}) => {
  const { isAuthenticated } = useAuth()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('my')
  const [schedules, setSchedules] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [viewingTripId, setViewingTripId] = useState(null)
  const [currentView, setCurrentView] = useState('list')
  const [showPlaceSearch, setShowPlaceSearch] = useState(false)
  const [selectedTripDayId, setSelectedTripDayId] = useState(null)
  const [tripDetailKey, setTripDetailKey] = useState(0)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '確定',
    cancelText: '取消',
  })
  //  新增：Toast 狀態
  const [toast, setToast] = useState({
    show: false,
    message: '',
  })

  const isOpen = isOpenProp !== undefined ? isOpenProp : internalIsOpen
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen))

  useEffect(() => {
    if (initialTripId && isOpen) {
      console.log('🎯 自動打開行程詳細頁，tripId:', initialTripId)
      setViewingTripId(initialTripId)
      setCurrentView('detail')
    }
  }, [initialTripId, isOpen])

  useEffect(() => {
    if (!isOpen) {
      console.log('🔄 ToggleBar 關閉，重置為列表頁')
      setCurrentView('list')
      setViewingTripId(null)
      setShowPlaceSearch(false)
    }
  }, [isOpen])

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

  const showSuccess = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '成功',
      message,
      onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
      confirmText: '確定',
      cancelText: '取消',
    })
  }

  const closeModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false })
  }

  const loadTrips = async () => {
    // 未登入時不發送請求，避免打到需要登入的 API 而收到 401
    if (!isAuthenticated) {
      setSchedules([])
      setFavorites(new Set())
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      console.log('🔍 開始載入行程...', { userId })

      const response = await getUserTrips(userId)
      console.log('📦 API 回應:', response)

      if (response.success && response.data) {
        console.log(' 載入成功:', response.data.length, '個行程')

        const favResponse = await getUserFavorites(userId)
        console.log('💝 收藏 API 回應:', favResponse)

        let favoriteIds = new Set()
        if (favResponse.success && favResponse.data) {
          favoriteIds = new Set(favResponse.data.map((fav) => fav.trip_id))
          console.log('💝 收藏的行程 ID:', Array.from(favoriteIds))
        }

        const tripsWithFavorites = response.data.map((trip) => ({
          ...trip,
          is_favorited: favoriteIds.has(trip.trip_id),
        }))

        setSchedules(tripsWithFavorites)
        setFavorites(favoriteIds)
      } else {
        console.error(' 載入失敗:', response)
      }
    } catch (error) {
      console.error(' 載入行程失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadTrips()
    }
  }, [isOpen, isAuthenticated])

  const handleCopy = async (schedule) => {
    showConfirm(
      '複製行程',
      `確定要複製「${schedule.trip_name}」嗎?`,
      async () => {
        closeModal()
        setLoading(true)
        try {
          const response = await copyTrip(schedule.trip_id, userId)
          if (response.success) {
            showSuccess('行程複製成功!')
            loadTrips()
          } else {
            showSuccess(`複製失敗: ${response.message || '未知錯誤'}`)
          }
        } catch (error) {
          console.error('複製行程失敗:', error)
          showSuccess(`複製失敗: ${error.message}`)
        } finally {
          setLoading(false)
        }
      }
    )
  }

  const handleDelete = async (schedule) => {
    showConfirm(
      '刪除行程',
      `確定要刪除「${schedule.trip_name}」嗎?\n此操作無法復原!`,
      async () => {
        closeModal()
        setLoading(true)
        try {
          const response = await deleteTrip(schedule.trip_id)
          if (response.success) {
            showSuccess('行程已刪除')
            loadTrips()
          } else {
            showSuccess(`刪除失敗: ${response.message || '未知錯誤'}`)
          }
        } catch (error) {
          console.error('刪除行程失敗:', error)
          showSuccess(`刪除失敗: ${error.message}`)
        } finally {
          setLoading(false)
        }
      },
      '刪除'
    )
  }

  const handleFavorite = async (schedule) => {
    const isFavorited = favorites.has(schedule.trip_id)

    console.log('💝 收藏操作:', {
      tripId: schedule.trip_id,
      tripName: schedule.trip_name,
      currentStatus: isFavorited,
      action: isFavorited ? '取消收藏' : '加入收藏',
    })

    try {
      if (isFavorited) {
        console.log('🔄 呼叫 removeFavorite:', {
          userId,
          tripId: schedule.trip_id,
        })
        const response = await removeFavorite(userId, schedule.trip_id)
        console.log('📦 removeFavorite 回應:', response)

        if (response.success) {
          setFavorites((prev) => {
            const newSet = new Set(prev)
            newSet.delete(schedule.trip_id)
            return newSet
          })

          setSchedules((prev) =>
            prev.map((t) =>
              t.trip_id === schedule.trip_id ? { ...t, is_favorited: false } : t
            )
          )

          //  顯示 Toast
          setToast({ show: true, message: '已取消收藏' })
          setTimeout(() => {
            setToast({ show: false, message: '' })
          }, 3000)
        } else {
          throw new Error(response.message || '取消收藏失敗')
        }
      } else {
        console.log('🔄 呼叫 addFavorite:', {
          userId,
          tripId: schedule.trip_id,
        })
        const response = await addFavorite(userId, schedule.trip_id)
        console.log('📦 addFavorite 回應:', response)

        if (
          response.success ||
          (response.message && response.message.includes('已收藏'))
        ) {
          setFavorites((prev) => new Set([...prev, schedule.trip_id]))

          setSchedules((prev) =>
            prev.map((t) =>
              t.trip_id === schedule.trip_id ? { ...t, is_favorited: true } : t
            )
          )

          if (response.message && response.message.includes('已收藏')) {
            showSuccess('此行程已在收藏列表中')
          } else {
            showSuccess('已加入收藏')
          }
        } else {
          throw new Error(response.message || '加入收藏失敗')
        }
      }
    } catch (error) {
      console.error(' 收藏操作失敗:', error)

      if (error.message && error.message.includes('已收藏')) {
        setFavorites((prev) => new Set([...prev, schedule.trip_id]))
        setSchedules((prev) =>
          prev.map((t) =>
            t.trip_id === schedule.trip_id ? { ...t, is_favorited: true } : t
          )
        )
        showSuccess('此行程已在收藏列表中')
      } else {
        showSuccess(`操作失敗: ${error.message}`)
      }
    }
  }

  const handleView = (schedule) => {
    console.log('點擊行程卡片:', schedule.trip_id)
    setViewingTripId(schedule.trip_id)
    setCurrentView('detail')
  }
  const handleEdit = (schedule) => {
    console.log('編輯行程:', schedule)
    setEditingTrip(schedule)
    setCurrentView('settings')
  }
  const handleBackToList = () => {
    console.log('返回行程列表')
    setViewingTripId(null)
    setShowPlaceSearch(false)
    setCurrentView('list')
    loadTrips()
  }

  const handleCreateNew = () => {
    setEditingTrip(null)
    setCurrentView('settings')
  }
  const handleTripCreated = () => {
    setEditingTrip(null)
    setCurrentView('list')
    loadTrips()
  }

  const handleAddPlace = (tripDayId) => {
    console.log('🎯 點擊新增景點按鈕，trip_day_id:', tripDayId)
    setSelectedTripDayId(tripDayId)
    setShowPlaceSearch(true)
  }

  const handlePlaceSelect = async (
    placeId,
    placeName,
    placeCategory,
    placeImage
  ) => {
    console.log('=== 開始處理景點選擇 ===')
    console.log('1️⃣ 接收到的參數:')
    console.log('  - placeId:', placeId, typeof placeId)
    console.log('  - placeName:', placeName, typeof placeName)
    console.log('  - placeCategory:', placeCategory, typeof placeCategory)
    console.log('  - placeImage:', placeImage, typeof placeImage)
    console.log(
      '  - selectedTripDayId:',
      selectedTripDayId,
      typeof selectedTripDayId
    )

    if (!selectedTripDayId) {
      showSuccess('請先選擇要加入的日期')
      return
    }

    if (!placeId) {
      showSuccess('景點 ID 不能為空')
      console.error(' placeId 為空:', placeId)
      return
    }

    setLoading(true)
    try {
      const placeData = {
        place_id: Number(placeId),
        type: placeCategory || 'attraction',
        note: null,
        start_time: null,
        end_time: null,
      }

      console.log('2️⃣ 準備發送的資料:')
      console.log('  - placeData:', JSON.stringify(placeData, null, 2))
      console.log('  - tripDayId:', selectedTripDayId)

      Object.entries(placeData).forEach(([key, value]) => {
        console.log(`  - ${key}:`, value, `(type: ${typeof value})`)
        if (value === undefined) {
          console.error(` 警告: ${key} 的值是 undefined!`)
        }
      })

      console.log('3️⃣ 準備呼叫 addPlaceToDay...')
      const response = await addPlaceToDay(selectedTripDayId, placeData)

      console.log(
        '4️⃣ addPlaceToDay 完整回應:',
        JSON.stringify(response, null, 2)
      )

      if (response.success) {
        showSuccess(`已將 ${placeName} 加入行程！`)
        setShowPlaceSearch(false)
        setSelectedTripDayId(null)
        await loadTrips()
        setTripDetailKey((prev) => prev + 1)
      } else {
        throw new Error(response.message || '新增景點失敗')
      }
    } catch (error) {
      console.error(' 新增景點失敗:')
      console.error('  - error:', error)
      console.error('  - error.message:', error.message)
      console.error('  - error.stack:', error.stack)
      showSuccess(`新增失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  const handleRemovePlace = async (tripItemId) => {
    console.log('🗑️ 移除景點:', tripItemId)
    await loadTrips()
  }

  const displaySchedules =
    activeTab === 'favorites'
      ? schedules.filter((s) => favorites.has(s.trip_id))
      : schedules

  return (
    <>
      {/* 背景遮罩 - 點擊關閉側邊欄 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-120 transition-opacity duration-300"
          onClick={handleToggle}
        />
      )}

      {/* 收合/展開按鈕 - 左下角,與 mapTransition 同樣式,始終顯示 */}
      <button
        onClick={handleToggle}
        className="fixed bottom-23 left-6 z-30 w-14 h-14 bg-primary-500 cursor-pointer rounded-lg flex items-center justify-center hover:bg-primary-300 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
        aria-label={isOpen ? '關閉行程列表' : '打開行程列表'}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Calendar className="w-8 h-8 text-white" />
        )}
      </button>

      {/* 側邊欄面板 */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[400px] lg:w-[450px] bg-white shadow-2xl z-150 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {currentView === 'settings' ? (
          <ItinerarySettings
            onBack={() => setCurrentView('list')}
            onTripCreated={handleTripCreated}
            onClose={() => setCurrentView('list')}
            onNavigateToList={() => setCurrentView('list')}
            editingTrip={editingTrip}
            isEditMode={!!editingTrip}
          />
        ) : currentView === 'detail' ? (
          <div className="flex flex-col  h-full">
            <div className="flex-1 overflow-y-auto">
              <TripDetail
                key={tripDetailKey}
                tripId={viewingTripId}
                userId={userId}
                onBack={handleBackToList}
                onAddPlace={handleAddPlace}
                onRemovePlace={handleRemovePlace}
                isFavorite={favorites.has(viewingTripId)}
                onToggleFavorite={async () => {
                  const schedule = schedules.find(
                    (s) => s.trip_id === viewingTripId
                  )
                  if (schedule) {
                    await handleFavorite(schedule)
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex justify-between items-center py-4 px-6 sticky top-0 bg-white z-10 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-secondary-900">行程</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.location.href = '/site/packing-lists'
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-900 hover:bg-secondary-800 transition-colors text-white text-sm font-medium rounded"
                  title="打包清單"
                >
                  <Package className="w-4 h-4" />
                  前往打包行李
                </button>
                <button
                  onClick={handleToggle}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-0 px-6 py-3 border-b-2 border-gray-200">
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 py-2 px-4 font-medium transition border-b-2 -mb-[2px] ${
                  activeTab === 'my'
                    ? 'border-secondary-900 text-secondary-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                我的行程({schedules.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-2 px-4 font-medium transition border-b-2 -mb-[2px] ${
                  activeTab === 'favorites'
                    ? 'border-secondary-900 text-secondary-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  行程收藏({favorites.size})
                </span>
              </button>
            </div>

            <div className="flex-1 px-6 py-4 pb-10 overflow-y-auto overflow-x-visible">
              {!isAuthenticated ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">請先登入</p>
                  <p className="text-gray-400 text-sm">
                    登入後即可查看與管理你的行程
                  </p>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                </div>
              ) : displaySchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">
                    {activeTab === 'favorites'
                      ? '還沒有收藏的行程'
                      : '還沒有建立行程'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {activeTab === 'favorites'
                      ? '開始探索並收藏喜歡的行程吧!'
                      : '點擊下方按鈕建立你的第一個行程'}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {displaySchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.trip_id}
                      schedule={schedule}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                      onFavorite={handleFavorite}
                      onEdit={handleEdit}
                      onView={handleView}
                      isFavorited={favorites.has(schedule.trip_id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 sticky bottom-0 bg-white p-6 shadow-lg border-t border-gray-100">
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="w-full px-8 py-3 bg-secondary-900 text-white font-medium hover:bg-secondary-800 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded"
              >
                建立新旅程
              </button>
            </div>
          </div>
        )}
      </div>

      {showPlaceSearch && (
        <PlaceSearchModal
          isOpen={showPlaceSearch}
          onClose={() => {
            setShowPlaceSearch(false)
            setSelectedTripDayId(null)
          }}
          onPlaceSelect={handlePlaceSelect}
          tripDayId={selectedTripDayId}
          userId={userId}
        />
      )}
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

      {/*  Toast 通知（右上角，參考 theme.css，無圓角） */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[10000] animate-fade-in">
          <div className="bg-primary-500 text-white px-8 py-4 shadow-2xl border-l-4 border-secondary-900 min-w-[300px]">
            <p className="text-lg font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default ToggleBar
