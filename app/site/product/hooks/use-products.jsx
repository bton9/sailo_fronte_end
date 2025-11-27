// hooks/use-products.js
import { useState, useEffect, useMemo, useCallback } from 'react'
import useSWRInfinite from 'swr/infinite'

// Fetcher 函式
const fetcher = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('無法取得資料')
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || '取得資料失敗')
  }

  return result
}

export const useProducts = ({
  perPage = 6,
  search = '',
  categoryId = '',
  inStock = false,
  minPrice = '',
  maxPrice = '',
  sortBy = 'created_at',
  sortOrder = 'DESC',
  specialFilter = '',
} = {}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // 分離需要 debounce 的參數（搜尋）和不需要的參數（篩選器）
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // 只對搜尋關鍵字做 debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // 使用 debouncedSearch 而不是 search
  const params = useMemo(
    () => ({
      perPage,
      search: debouncedSearch, // 使用 debounced 版本
      categoryId,
      inStock,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      specialFilter,
    }),
    [
      perPage,
      debouncedSearch,
      categoryId,
      inStock,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      specialFilter,
    ]
  )

  // getKey 函數
  const getKey = useCallback(
    (pageIndex, previousPageData) => {
      // 如果上一頁沒有資料，代表已經到底了
      if (previousPageData && previousPageData.data?.length === 0) return null

      // 構建查詢參數
      const urlParams = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        perPage: params.perPage.toString(),
      })

      // 添加所有篩選參數
      if (params.search) urlParams.append('search', params.search)
      if (params.categoryId) urlParams.append('categoryId', params.categoryId)
      if (params.inStock) urlParams.append('inStock', 'true')
      if (params.minPrice) urlParams.append('minPrice', params.minPrice)
      if (params.maxPrice) urlParams.append('maxPrice', params.maxPrice)
      if (params.sortBy) urlParams.append('sortBy', params.sortBy)
      if (params.sortOrder) urlParams.append('sortOrder', params.sortOrder)
      if (params.specialFilter)
        urlParams.append('specialFilter', params.specialFilter)

      return `${API_URL}/api/products?${urlParams.toString()}`
    },
    [API_URL, params]
  )
  // useSWRInfinite
  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000,
      // 關鍵：參數變更時保持 UI 穩定
      keepPreviousData: true,
    })

  // 整合所有頁面的產品資料
  const products = useMemo(() => {
    return data ? data.flatMap((page) => page.data || []) : []
  }, [data])

  // 判斷是否還有更多資料
  const isReachingEnd = useMemo(() => {
    return data && data[data.length - 1]?.data?.length < params.perPage
  }, [data, params.perPage])

  // 判斷是否正在載入更多
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  // 載入下一頁
  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1)
    }
  }, [isReachingEnd, isLoadingMore, size, setSize])

  return {
    products,
    error,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    isValidating,
    loadMore,
    size,
    mutate,
  }
}
