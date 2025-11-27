/**
 * Individual Packing List Page
 * Displays a specific packing list by ID
 * Path: app/site/packing-lists/[id]/page.jsx
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getListById,
  saveList,
  formatDateRange,
  updateListMetadata,
} from '../packingListStorage'
import NewListModal from '../newListModal'
import AddItemModal from '../_components/addItemModal'
import EditItemModal from '../_components/editItemModal'
import AddCategoryModal from '../_components/addCateModal'
import ConfirmModal from '@/components/confirmModal'
import TripWeatherCard from '../_components/tripWeatherCard.jsx'
import RainEffect from '../_components/rainEffect'

export default function PackingListDetailPage({ city }) {
  const [weatherData, setWeatherData] = useState(null)
  const params = useParams()
  const router = useRouter()
  const listId = params.id

  const [listData, setListData] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // ✅ NEW: State for AddItemModal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [currentCategoryName, setCurrentCategoryName] = useState('')

  // ✅ NEW: State for EditItemModal
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [currentItemId, setCurrentItemId] = useState(null)
  const [currentItemName, setCurrentItemName] = useState('')

  // ✅ NEW: State for AddCategoryModal
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)

  // ✅ NEW: State for Confirm Modals
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false)
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false)
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null) // { categoryId, itemId, itemName }
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null) // { categoryId, categoryName }

  // Load list data from localStorage
  useEffect(() => {
    if (!listId) return

    const data = getListById(listId)
    if (!data) {
      // List not found, redirect to main page
      router.push('/site/packing-lists')
      return
    }

    setListData(data)
    setCategories(data.categories || [])
    setLoading(false)
  }, [listId, router])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (!listId || !listData || loading) return

    const updatedData = {
      ...listData,
      categories,
    }
    saveList(listId, updatedData)
  }, [categories, listId, listData, loading])

  // Rain state
  useEffect(() => {
    // This will be triggered when TripWeatherCard updates weather
    const handleWeatherUpdate = (event) => {
      setWeatherData(event.detail)
    }

    window.addEventListener('weatherUpdated', handleWeatherUpdate)
    return () =>
      window.removeEventListener('weatherUpdated', handleWeatherUpdate)
  }, [])

  const isRaining =
    weatherData?.weather === 'Rain' ||
    weatherData?.weather === 'Drizzle' ||
    weatherData?.weather === 'Thunderstorm'

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalItems = 0
    let checkedItems = 0

    categories.forEach((category) => {
      totalItems += category.items.length
      checkedItems += category.items.filter((item) => item.checked).length
    })

    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
  }

  const overallProgress = calculateOverallProgress()

  // Toggle item checked state
  const toggleItem = (categoryId, itemId) => {
    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          }
        }
        return category
      })
    )
  }

  // Toggle category collapse
  const toggleCategory = (categoryId) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, collapsed: !category.collapsed }
          : category
      )
    )
  }

  // ✅ NEW: Open add item modal
  const openAddItemModal = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId)
    setCurrentCategoryId(categoryId)
    setCurrentCategoryName(category?.name || '')
    setIsAddItemModalOpen(true)
  }

  // ✅ NEW: Handle add item submission
  const handleAddItem = (itemName) => {
    setCategories(
      categories.map((category) => {
        if (category.id === currentCategoryId) {
          const newItem = {
            id: Date.now(),
            name: itemName,
            checked: false,
          }
          return {
            ...category,
            items: [...category.items, newItem],
          }
        }
        return category
      })
    )
    setIsAddItemModalOpen(false)
  }

  // ✅ NEW: Open edit item modal
  const openEditItemModal = (categoryId, itemId) => {
    const category = categories.find((c) => c.id === categoryId)
    const item = category?.items.find((i) => i.id === itemId)

    if (item) {
      setCurrentCategoryId(categoryId)
      setCurrentCategoryName(category?.name || '')
      setCurrentItemId(itemId)
      setCurrentItemName(item.name)
      setIsEditItemModalOpen(true)
    }
  }

  // ✅ NEW: Handle edit item submission
  const handleEditItem = (newName) => {
    setCategories(
      categories.map((category) => {
        if (category.id === currentCategoryId) {
          return {
            ...category,
            items: category.items.map((item) =>
              item.id === currentItemId ? { ...item, name: newName } : item
            ),
          }
        }
        return category
      })
    )
    setIsEditItemModalOpen(false)
  }

  // Delete item - opens confirm modal
  const deleteItem = (categoryId, itemId) => {
    const category = categories.find((c) => c.id === categoryId)
    const item = category?.items.find((i) => i.id === itemId)

    if (item) {
      setPendingDeleteItem({ categoryId, itemId, itemName: item.name })
      setIsDeleteItemModalOpen(true)
    }
  }

  // Confirm delete item
  const confirmDeleteItem = () => {
    if (pendingDeleteItem) {
      setCategories(
        categories.map((category) => {
          if (category.id === pendingDeleteItem.categoryId) {
            return {
              ...category,
              items: category.items.filter(
                (item) => item.id !== pendingDeleteItem.itemId
              ),
            }
          }
          return category
        })
      )
      setIsDeleteItemModalOpen(false)
      setPendingDeleteItem(null)
    }
  }

  // Remove category - opens confirm modal
  const removeCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId)

    if (category) {
      setPendingDeleteCategory({ categoryId, categoryName: category.name })
      setIsDeleteCategoryModalOpen(true)
    }
  }

  // Confirm delete category
  const confirmDeleteCategory = () => {
    if (pendingDeleteCategory) {
      setCategories(
        categories.filter((c) => c.id !== pendingDeleteCategory.categoryId)
      )
      setIsDeleteCategoryModalOpen(false)
      setPendingDeleteCategory(null)
    }
  }

  // ✅ NEW: Open add category modal
  const openAddCategoryModal = () => {
    setIsAddCategoryModalOpen(true)
  }

  // ✅ NEW: Handle add category submission
  const handleAddCategory = (categoryName) => {
    const newCategory = {
      id: Date.now(),
      name: categoryName,
      collapsed: false,
      items: [],
    }
    setCategories([...categories, newCategory])
    setIsAddCategoryModalOpen(false)
  }

  // Back to lists
  const backToLists = () => {
    router.push('/site/packing-lists')
  }

  // Handle edit list
  const handleEditList = (updatedData) => {
    updateListMetadata(listId, updatedData)
    setListData((prev) => ({
      ...prev,
      ...updatedData,
    }))
    setIsEditModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-[#999]">載入中...</div>
      </div>
    )
  }

  if (!listData) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-[#fafafa]">
        {isRaining && <RainEffect />}
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[#e0e0e0] bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={backToLists}
                className="flex items-center gap-2 text-secondary-600 transition-colors hover:text-primary-500"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="text-base sm:text-lg">返回清單</span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl text-[#333] truncate max-w-[200px] sm:max-w-none">
              {listData.name}
            </h1>
            <div className="w-20 sm:w-24"></div>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Sidebar */}
            <div className="lg:sticky lg:top-[120px] lg:self-start lg:max-h-[calc(100vh-140px)] w-full lg:w-80 bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] lg:flex-shrink-0">
              <div className="py-5 sm:py-[30px] px-5 sm:px-[30px] pb-4 sm:pb-5 flex justify-between items-center">
                <div className="text-xl sm:text-2xl text-[#333]">
                  {listData.city}
                </div>
                <svg
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-5 h-5 text-secondary-900 cursor-pointer hover:text-primary-500 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div className="px-5 sm:px-[30px] pb-5 sm:pb-[30px] text-sm sm:text-base text-[#999]">
                {formatDateRange(listData.startDate, listData.endDate)}
              </div>

              {/* Weather Card */}
              <TripWeatherCard city={listData.city} />

              {/* Progress Section */}
              <div className="p-5 sm:p-[30px]">
                <div className="mb-3 sm:mb-4 text-base sm:text-lg text-[#333]">
                  打包進度
                </div>
                <div className="relative w-full h-[8px] sm:h-[10px] bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-2xl sm:text-3xl text-secondary-600">
                  {overallProgress}%
                </div>
              </div>
            </div>

            {/* Checklist Section */}
            <div className="flex-1 w-full lg:w-auto">
              {categories.map((category) => {
                const checkedCount = category.items.filter(
                  (item) => item.checked
                ).length
                const totalCount = category.items.length

                return (
                  <div
                    key={category.id}
                    className="bg-white border-l-2 sm:border-l-[3px] border-l-secondary-600 rounded-xl py-4 sm:py-[25px] px-5 sm:px-[30px] mb-4 sm:mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  >
                    {/* Category Header */}
                    <div className="flex justify-between items-center cursor-pointer select-none">
                      <div className="flex items-center gap-3 sm:gap-[15px] flex-1">
                        <div
                          className="flex-1 flex justify-between items-center"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="text-lg md:text-lg lg:text-lg text-[#333] font-medium">
                            {category.name}{' '}
                            <span className="text-secondary-600 text-lg md:text-lg lg:text-lg">
                              ({checkedCount}/{totalCount})
                            </span>
                          </div>
                          <svg
                            className={`w-6 h-6 sm:h-6 sm:w-6 text-secondary-600 transition-transform duration-300 ${category.collapsed ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Category Content */}
                    {!category.collapsed && (
                      <div className="mt-4 sm:mt-5">
                        {/* Items */}
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2.5 sm:py-3 border-b border-secondary-200 last:border-b-0"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 flex-1">
                              {/* Checkbox */}
                              <div
                                className={`relative w-5 h-5 sm:w-5 sm:h-5 border-2 rounded cursor-pointer transition-all duration-300 hover:border-primary-500 flex-shrink-0 ${
                                  item.checked
                                    ? 'border-primary-500 bg-primary-500 after:content-["✓"] after:absolute after:text-white after:text-xs sm:after:text-sm after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2'
                                    : 'border-[#d0d0d0]'
                                }`}
                                onClick={() => toggleItem(category.id, item.id)}
                              ></div>
                              <div
                                className="w-full mr-1 text-lg md:text-lg lg:text-base text-[#333] cursor-pointer hover:text-primary-500 break-words "
                                onClick={() =>
                                  openEditItemModal(category.id, item.id)
                                }
                              >
                                {item.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <svg
                                className="w-6 h-6 sm:w-6 sm:h-6 text-[#e57373] cursor-pointer transition-colors duration-300 hover:text-[#d32f2f] flex-shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                onClick={() => deleteItem(category.id, item.id)}
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </div>
                          </div>
                        ))}

                        {/* Category Actions */}
                        <div className="flex items-center justify-between pt-2.5 sm:pt-3 -mx-5 sm:-mx-[30px] px-5 sm:px-[30px]">
                          <div
                            className="flex items-center gap-1.5 sm:gap-2 text-[#999] text-lg md:text-lg lg:text-base cursor-pointer transition-colors duration-300 hover:text-primary-500"
                            onClick={() => openAddItemModal(category.id)}
                          >
                            <svg
                              width="14"
                              height="14"
                              className="w-6 h-6 sm:w-5 sm:h-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 5v14m-7-7h14" />
                            </svg>
                            新增物品
                          </div>
                          <button
                            className="h-6 w-6 sm:h-6 sm:w-6 border-none bg-transparent rounded-md flex items-center justify-center cursor-pointer transition-all duration-300 text-[#e57373] hover:bg-[#fee] p-0"
                            onClick={() => removeCategory(category.id)}
                            title="刪除分類"
                          >
                            <svg
                              width="20"
                              height="20"
                              className="sm:w-5 sm:h-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add Category Button */}
              <div
                className="w-full bg-white border-2 border-dashed border-[#d0d0d0] rounded-xl py-4 sm:py-5 flex items-center justify-center gap-2 text-[#999] text-base sm:text-lg cursor-pointer transition-all duration-300 hover:border-primary-500 hover:text-primary-500"
                onClick={openAddCategoryModal}
              >
                <svg
                  width="18"
                  height="18"
                  className="sm:w-5 sm:h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                新增分類
              </div>
            </div>
          </div>
        </div>

        {/* Edit List Modal */}
        <NewListModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditList}
          editData={listData}
        />

        {/* ✅ NEW: Add Item Modal */}
        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onSubmit={handleAddItem}
          categoryName={currentCategoryName}
        />

        {/* ✅ NEW: Edit Item Modal */}
        <EditItemModal
          isOpen={isEditItemModalOpen}
          onClose={() => setIsEditItemModalOpen(false)}
          onSubmit={handleEditItem}
          currentName={currentItemName}
          categoryName={currentCategoryName}
        />

        {/* ✅ NEW: Add Category Modal */}
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSubmit={handleAddCategory}
        />

        {/* ✅ NEW: Delete Item Confirm Modal */}
        <ConfirmModal
          isOpen={isDeleteItemModalOpen}
          onClose={() => {
            setIsDeleteItemModalOpen(false)
            setPendingDeleteItem(null)
          }}
          onConfirm={confirmDeleteItem}
          title="刪除物品"
          message={`確定要刪除「${pendingDeleteItem?.itemName || ''}」嗎？`}
          confirmText="刪除"
          cancelText="取消"
          confirmButtonStyle="bg-red-500 hover:bg-red-600"
        />

        {/* ✅ NEW: Delete Category Confirm Modal */}
        <ConfirmModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => {
            setIsDeleteCategoryModalOpen(false)
            setPendingDeleteCategory(null)
          }}
          onConfirm={confirmDeleteCategory}
          title="刪除分類"
          message={`確定要刪除「${pendingDeleteCategory?.categoryName || ''}」分類嗎？\n此操作將刪除該分類下的所有物品，且無法復原。`}
          confirmText="刪除"
          cancelText="取消"
          confirmButtonStyle="bg-red-500 hover:bg-red-600"
        />
      </div>
    </>
  )
}
