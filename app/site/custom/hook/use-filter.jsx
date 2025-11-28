import { useEffect, useState } from 'react'
import { filterPlaces } from '../lib/filterutils'

/**
 * 自定義 Hook - 管理景點篩選狀態
 * @param {Array} allPlaces - 所有景點數據
 * @param {Function} setFilteredPlaces - 設置篩選後景點的函數
 * @param {Function} setCurrentPage - 設置當前頁碼的函數
 * @returns {Object} 篩選狀態和相關方法
 */
export function useFilters(allPlaces, setFilteredPlaces, setCurrentPage) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // 篩選邏輯
  useEffect(() => {
    const filtered = filterPlaces(allPlaces, {
      searchTerm,
      selectedCity,
      selectedCategory,
    })

    setFilteredPlaces(filtered)
    setCurrentPage(1)

    console.log('篩選結果:', filtered.length, '個景點')
  }, [
    searchTerm,
    selectedCity,
    selectedCategory,
    allPlaces,
    setFilteredPlaces,
    setCurrentPage,
  ])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCity('')
    setSelectedCategory('')
  }

  return {
    searchTerm,
    setSearchTerm,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
  }
}