import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { processPlaceImage } from '../lib/imageutils'
import { filterPlaces } from '../lib/filterutils'

/**
 * SWR fetcher 函數
 */
const fetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('載入資料失敗')
  }
  const data = await response.json()
  return data
}

/**
 * 自定義 Hook - 管理景點數據的獲取、篩選和分頁（使用 SWR + 前端無限滾動）
 * @param {Object} options - 配置選項
 * @param {number} options.itemsPerPage - 每頁顯示的項目數量
 * @returns {Object} 景點數據和相關方法
 */
export function usePlaces({ itemsPerPage = 30 } = {}) {
  const [cities, setCities] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [places, setPlaces] = useState([]) // 當前顯示的景點（用於 Pagination）
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(itemsPerPage) // 無限滾動已顯示數量
  const observerRef = useRef(null)
  const isInitializedRef = useRef(false)

  // 使用 SWR 獲取所有資料
  const { data, error, isLoading, mutate } = useSWR(
    'http://localhost:5000/api/places',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // 使用 useMemo 確保 allPlaces 只在 data 改變時重新創建
  const allPlaces = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((place) => ({
      ...place,
      cover_image: processPlaceImage(place.cover_image),
    }))
  }, [data])

  // 提取城市列表 - 只在 data 改變時執行一次
  useEffect(() => {
    if (allPlaces.length > 0 && !isInitializedRef.current) {
      const uniqueCities = [
        ...new Set(allPlaces.map((p) => p.location_name).filter(Boolean)),
      ].sort()
      setCities(uniqueCities)
      setFilteredPlaces(allPlaces)
      isInitializedRef.current = true
      console.log('載入景點數量:', allPlaces.length)
      console.log('城市列表:', uniqueCities)
    }
  }, [allPlaces])

  // 計算總頁數
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage)

  // 使用 useMemo 計算 displayPlaces，避免不必要的重新渲染
  const displayPlaces = useMemo(() => {
    return filteredPlaces.slice(0, visibleCount)
  }, [filteredPlaces, visibleCount])

  // 更新當前頁顯示的景點（用於 Pagination 模式）
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentPageData = filteredPlaces.slice(startIndex, endIndex)
    setPlaces(currentPageData)
  }, [currentPage, filteredPlaces, itemsPerPage])

  // 判斷是否還有更多數據
  const hasMore = visibleCount < filteredPlaces.length

  // 判斷是否正在載入更多
  const isLoadingMore = false // 前端分頁不需要載入

  // 載入下一頁（無限滾動）
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setVisibleCount((prev) => prev + itemsPerPage)
      console.log('載入更多，當前顯示:', visibleCount + itemsPerPage)
    }
  }, [hasMore, isLoadingMore, itemsPerPage, visibleCount])

  // Intersection Observer 回調
  const lastItemRef = useCallback(
    (node) => {
      if (isLoadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            console.log('觸發器進入視窗，載入更多...')
            loadMore()
          }
        },
        {
          rootMargin: '100px', // 提前 100px 觸發
        }
      )

      if (node) {
        console.log('綁定觸發器到元素')
        observerRef.current.observe(node)
      }
    },
    [isLoadingMore, hasMore, loadMore]
  )

  // 重置到第一頁（當篩選條件改變時）
  const resetPage = useCallback(() => {
    setCurrentPage(1)
    setVisibleCount(itemsPerPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    console.log('重置到第一頁')
  }, [itemsPerPage])

  // 清理 Observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    // === 保持與原版本相容的返回值 ===
    allPlaces, // 所有景點（已處理圖片）
    filteredPlaces, // 篩選後的景點
    setFilteredPlaces, // 設置篩選後的景點
    places, // 當前頁面顯示的景點（Pagination 模式）
    setPlaces, // 設置當前頁面景點
    currentPage, // 當前頁碼（Pagination 模式）
    setCurrentPage, // 設置當前頁碼
    isLoading, // 載入狀態
    cities, // 城市列表
    totalPages, // 總頁數（Pagination 模式）
    itemsPerPage, // 每頁項目數

    // === 新增的無限滾動相關返回值 ===
    displayPlaces, // 無限滾動模式下顯示的景點
    isLoadingMore, // 是否正在載入更多
    error, // 錯誤對象
    hasMore, // 是否還有更多數據
    loadMore, // 手動載入下一頁
    lastItemRef, // 用於無限滾動的 ref
    resetPage, // 重置到第一頁
    mutate, // 手動重新驗證數據
    totalLoaded: displayPlaces.length, // 已載入的總數量
    visibleCount, // 當前可見數量
  }
}

/**
 * 無限滾動觸發元素組件
 * 使用方式:
 * <InfiniteScrollTrigger
 *   lastItemRef={lastItemRef}
 *   isLoading={isLoadingMore}
 *   hasMore={hasMore}
 * />
 */
export function InfiniteScrollTrigger({ lastItemRef, isLoading, hasMore }) {
  return (
    <div
      ref={lastItemRef}
      className="infinite-scroll-trigger w-full py-8 text-center"
      style={{
        minHeight: '100px',
      }}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">載入中...</p>
        </div>
      ) : hasMore ? (
        <div className="text-gray-500 text-sm">
          <p>向下滾動載入更多</p>
          <p className="text-xs mt-1 text-gray-400">或稍等片刻自動載入</p>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">已載入所有景點</p>
      )}
    </div>
  )
}
