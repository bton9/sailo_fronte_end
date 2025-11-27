/**
 * Packing List Storage Helper
 * Manages multiple packing lists in localStorage
 */

const STORAGE_KEY = 'packingLists'

/**
 * Get all packing lists
 * @returns {Object} Object with list IDs as keys
 */
export const getAllLists = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error loading packing lists:', error)
    return {}
  }
}

/**
 * Get a specific packing list by ID
 * @param {string} id - List ID
 * @returns {Object|null} List data or null if not found
 */
export const getListById = (id) => {
  const lists = getAllLists()
  return lists[id] || null
}

/**
 * Save or update a packing list
 * @param {string} id - List ID
 * @param {Object} listData - List data to save
 */
export const saveList = (id, listData) => {
  try {
    const lists = getAllLists()
    lists[id] = {
      ...listData,
      id,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
    return true
  } catch (error) {
    console.error('Error saving packing list:', error)
    return false
  }
}

/**
 * Create a new packing list
 * @param {string} name - List name/title
 * @param {string} city - Destination city
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Created list with ID
 */
export const createNewList = (name, city, startDate, endDate) => {
  const id = `list-${Date.now()}`

  const defaultCategories = [
    {
      id: 1,
      name: '證件與金錢',
      collapsed: false,
      items: [
        { id: 1, name: '護照', checked: false },
        { id: 2, name: '簽證', checked: false },
        { id: 3, name: '身分證', checked: false },
        { id: 4, name: '駕照', checked: false },
        { id: 5, name: '信用卡', checked: false },
        { id: 6, name: '現金', checked: false },
        { id: 7, name: '旅遊保險單', checked: false },
      ],
    },
    {
      id: 2,
      name: '衣物',
      collapsed: false,
      items: [
        { id: 8, name: '上衣', checked: false },
        { id: 9, name: '褲子', checked: false },
        { id: 10, name: '外套', checked: false },
        { id: 11, name: '內衣褲', checked: false },
        { id: 12, name: '襪子', checked: false },
        { id: 13, name: '鞋子', checked: false },
        { id: 14, name: '泳衣', checked: false },
      ],
    },
    {
      id: 3,
      name: '盥洗用品',
      collapsed: false,
      items: [
        { id: 15, name: '牙刷牙膏', checked: false },
        { id: 16, name: '洗髮精沐浴乳', checked: false },
        { id: 17, name: '毛巾', checked: false },
        { id: 18, name: '化妝品', checked: false },
        { id: 19, name: '保養品', checked: false },
        { id: 20, name: '防曬乳', checked: false },
      ],
    },
    {
      id: 4,
      name: '電子產品',
      collapsed: false,
      items: [
        { id: 21, name: '手機', checked: false },
        { id: 22, name: '充電器', checked: false },
        { id: 23, name: '行動電源', checked: false },
        { id: 24, name: '相機', checked: false },
        { id: 25, name: '耳機', checked: false },
        { id: 26, name: '轉接頭', checked: false },
      ],
    },
    {
      id: 5,
      name: '藥品',
      collapsed: false,
      items: [
        { id: 27, name: '常備藥', checked: false },
        { id: 28, name: 'OK繃', checked: false },
        { id: 29, name: '暈車藥', checked: false },
        { id: 30, name: '腸胃藥', checked: false },
      ],
    },
    {
      id: 6,
      name: '其他',
      collapsed: false,
      items: [
        { id: 31, name: '行李箱', checked: false },
        { id: 32, name: '後背包', checked: false },
        { id: 33, name: '雨具', checked: false },
        { id: 34, name: '水壺', checked: false },
        { id: 35, name: '零食', checked: false },
      ],
    },
  ]

  const newList = {
    id,
    name: name || '新的清單',
    city: city || '',
    startDate: startDate || '',
    endDate: endDate || '',
    categories: defaultCategories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  saveList(id, newList)
  return newList
}

/**
 * Delete a packing list
 * @param {string} id - List ID to delete
 * @returns {boolean} Success status
 */
export const deleteList = (id) => {
  try {
    const lists = getAllLists()
    delete lists[id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
    return true
  } catch (error) {
    console.error('Error deleting packing list:', error)
    return false
  }
}

/**
 * Update list metadata (name, city, dates)
 * @param {string} id - List ID
 * @param {Object} metadata - Metadata to update
 */
export const updateListMetadata = (id, metadata) => {
  const list = getListById(id)
  if (!list) return false

  return saveList(id, {
    ...list,
    ...metadata,
  })
}

/**
 * Format date range for display
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

export default {
  getAllLists,
  getListById,
  saveList,
  createNewList,
  deleteList,
  updateListMetadata,
  formatDateRange,
}
