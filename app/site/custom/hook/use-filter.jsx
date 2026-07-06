import { useEffect, useState } from 'react'
import { filterPlaces } from '../lib/filterutils'

/**
 * 自定義 Hook - 管理景點篩選狀態
 *
 * 注意：頁碼重置由呼叫端另外監聽同一組篩選條件呼叫 usePlaces() 的
 * resetPage()（同時重置頁碼、無限滾動可見數量並捲動置頂），
 * 此處不重複處理頁碼。
 *
 * @param {Array} allPlaces - 所有景點數據
 * @param {Function} setFilteredPlaces - 設置篩選後景點的函數
 * @returns {Object} 篩選狀態和相關方法
 */
export function useFilters(allPlaces, setFilteredPlaces) {
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
  }, [searchTerm, selectedCity, selectedCategory, allPlaces, setFilteredPlaces])

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