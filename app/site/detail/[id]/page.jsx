'use client'

import { useState, useTransition } from 'react'
import RIC_fi from '../../../lib/react_icon/fi'
import SideMenu from '@/components/sidebar'

export default function ChecklistPage() {
  const [isPending, startTransition] = useTransition()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [categories, setCategories] = useState([
    {
      id: 1,
      name: '重要物品',
      isOpen: true,
      items: [
        { id: 1, name: '手機', checked: false, needPurchase: false },
        { id: 2, name: '現金', checked: false, needPurchase: false },
        { id: 3, name: '信用卡', checked: false, needPurchase: false },
        { id: 4, name: '個人證件', checked: false, needPurchase: false },
      ],
    },
    {
      id: 2,
      name: '衣服與服飾',
      isOpen: true,
      items: [
        { id: 5, name: '內衣褲', checked: false, needPurchase: true },
        { id: 6, name: '襪子', checked: false, needPurchase: true },
        { id: 7, name: '遮陽帽', checked: false, needPurchase: true },
      ],
    },
    {
      id: 3,
      name: '盥洗用品',
      isOpen: true,
      items: [
        { id: 8, name: '牙刷', checked: false, needPurchase: true },
        { id: 9, name: '牙膏', checked: false, needPurchase: true },
        { id: 10, name: '肥皂', checked: false, needPurchase: true },
        { id: 11, name: '防曬油', checked: false, needPurchase: true },
      ],
    },
  ])

  const toggleCategory = (categoryId) => {
    startTransition(() => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, isOpen: !cat.isOpen } : cat
        )
      )
    })
  }

  const toggleItem = (categoryId, itemId) => {
    startTransition(() => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === itemId
                    ? { ...item, checked: !item.checked }
                    : item
                ),
              }
            : cat
        )
      )
    })
  }

  const removeItem = (categoryId, itemId) => {
    startTransition(() => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.filter((item) => item.id !== itemId),
              }
            : cat
        )
      )
    })
  }

  const addItem = (categoryId) => {
    const itemName = prompt('請輸入物品名稱:')
    if (itemName?.trim()) {
      startTransition(() => {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  items: [
                    ...cat.items,
                    {
                      id: Date.now(),
                      name: itemName.trim(),
                      checked: false,
                      needPurchase: false,
                    },
                  ],
                }
              : cat
          )
        )
      })
    }
  }

  const addCategory = () => {
    const categoryName = prompt('請輸入分類名稱:')
    if (categoryName?.trim()) {
      startTransition(() => {
        setCategories((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: categoryName.trim(),
            isOpen: true,
            items: [],
          },
        ])
      })
    }
  }

  const getCheckedCount = (items) => {
    return items.filter((item) => item.checked).length
  }

  const getTotalProgress = () => {
    const totalItems = categories.reduce(
      (sum, cat) => sum + cat.items.length,
      0
    )
    const checkedItems = categories.reduce(
      (sum, cat) => sum + getCheckedCount(cat.items),
      0
    )
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-[#F4EEE2]">
      {/* Mobile Header
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-neutral-800 text-xl font-bold font-['Noto_Sans_TC']">
          行前清單
        </h1>
      </div> */}
      <SideMenu />
      {/* Main Content */}
      <div className="pt-16 lg:pt-0 px-3 sm:px-4 md:px-6 lg:px-8 py-6 lg:py-12 ">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className="bg-white/60 rounded-lg sm:rounded-[10px] shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Trip Info */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center">
                <div className="space-y-3 sm:space-y-4 w-full">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h1 className="text-neutral-800 text-xl sm:text-2xl lg:text-3xl font-normal font-['Noto_Sans_TC']">
                      高雄市自由行
                    </h1>
                    <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                      <RIC_fi.FiEdit className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800" />
                    </button>
                  </div>
                  <p className="text-neutral-800 text-sm sm:text-base font-light font-['Noto_Sans_TC']">
                    2025/11/18 - 2025/11/25
                  </p>
                </div>
              </div>

              {/* Right Side - Weather */}
              <div className="relative w-full lg:w-[470px] h-40 sm:h-48 lg:h-52">
                <img
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop"
                  alt="Kaohsiung scenery"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-1.5">
                  <RIC_fi.FiSun
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white"
                    strokeWidth={2}
                  />
                  <div className="text-white text-xl sm:text-2xl font-['Noto_Sans_TC']">
                    30°C
                  </div>
                </div>

                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4">
                  <span className="text-white text-xs sm:text-sm font-light font-['Noto_Sans_TC']">
                    目前當地天氣
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-stone-200 rounded-lg sm:rounded-[10px] shadow-inner overflow-hidden my-6">
            <div className="h-5 sm:h-6 bg-white/60 relative">
              <div
                className="h-full bg-stone-300 rounded-l-lg sm:rounded-l-[10px] flex items-center justify-end pr-3 sm:pr-5 transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              >
                <span className="text-white text-sm sm:text-base font-normal font-['Noto_Sans_TC']">
                  {getTotalProgress()}%
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4 sm:space-y-6 my-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg sm:rounded-[10px] shadow-lg overflow-hidden my-6"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border-b border-neutral-800 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
                  disabled={isPending}
                >
                  <span className="text-neutral-800 text-base sm:text-lg lg:text-xl font-normal font-['Noto_Sans_TC']">
                    {category.name} ({getCheckedCount(category.items)}/
                    {category.items.length})
                  </span>
                  <RIC_fi.FiChevronDown
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-neutral-800 transition-transform flex-shrink-0 ${
                      category.isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Category Items */}
                {category.isOpen && (
                  <div className="py-1 sm:py-2">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 hover:bg-gray-50 transition-colors"
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItem(category.id, item.id)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            item.checked
                              ? 'bg-neutral-800 border-neutral-800'
                              : 'border-neutral-800 hover:bg-gray-100 active:bg-gray-200'
                          }`}
                          disabled={isPending}
                        >
                          {item.checked && (
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Item Name */}
                        <span className="flex-1 text-neutral-800 text-sm sm:text-base font-light font-['Noto_Sans_TC'] min-w-0 break-words">
                          {item.name}
                        </span>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          {/* Purchase Button */}
                          {item.needPurchase && (
                            <button className="h-6 sm:h-7 px-2 sm:px-3 bg-white rounded-[5px] border-2 border-gray-400 flex items-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors active:bg-gray-100">
                              <RIC_fi.FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span className="text-gray-400 text-xs sm:text-sm font-bold font-['Noto_Sans_TC'] hidden xs:inline">
                                添購物品
                              </span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => removeItem(category.id, item.id)}
                            className="p-1 sm:p-1.5 hover:bg-red-50 rounded transition-colors active:bg-red-100"
                            disabled={isPending}
                          >
                            <RIC_fi.FiX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Item */}
                    <button
                      onClick={() => addItem(category.id)}
                      className="w-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
                      disabled={isPending}
                    >
                      <RIC_fi.FiPlus className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-500" />
                      <span className="text-neutral-400 text-base sm:text-lg lg:text-xl font-normal font-['Noto_Sans']">
                        新增物品
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Category Button */}
            <button
              onClick={addCategory}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white rounded-lg sm:rounded-[10px] shadow-lg flex items-center gap-2 sm:gap-2.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
              disabled={isPending}
            >
              <RIC_fi.FiPlus className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-800" />
              <span className="text-neutral-800 text-base sm:text-lg lg:text-xl font-normal font-['Noto_Sans_TC']">
                新增分類
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
