/**
 * 篩選景點數據
 * @param {Array} places - 所有景點數據
 * @param {Object} filters - 篩選條件
 * @param {string} filters.searchTerm - 搜尋關鍵字
 * @param {string} filters.selectedCity - 選擇的城市
 * @param {string} filters.selectedCategory - 選擇的分類
 * @returns {Array} 篩選後的景點數據
 */
export function filterPlaces(
  places,
  { searchTerm, selectedCity, selectedCategory }
) {
  let filtered = [...places]

  // 搜尋過濾
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase().trim()
    filtered = filtered.filter(
      (place) =>
        place.name?.toLowerCase().includes(searchLower) ||
        place.description?.toLowerCase().includes(searchLower) ||
        place.location_name?.toLowerCase().includes(searchLower)
    )
  }

  // 城市過濾
  if (selectedCity) {
    filtered = filtered.filter((place) => place.location_name === selectedCity)
  }

  // 分類過濾
  if (selectedCategory) {
    filtered = filtered.filter((place) => place.category === selectedCategory)
  }

  return filtered
}
