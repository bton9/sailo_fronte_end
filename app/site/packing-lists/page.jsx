/**
 * Packing Lists Main Page
 * Shows all packing lists and allows creating new ones
 * Path: app/site/packing-lists/page.jsx
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAllLists,
  createNewList,
  deleteList,
  formatDateRange,
} from './packingListStorage'
import NewListModal from './newListModal'
import ConfirmModal from '@/components/confirmModal'

export default function PackingListsPage() {
  const router = useRouter()
  const [lists, setLists] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    listId: null,
    listName: '',
  })

  // Load lists from localStorage on mount
  useEffect(() => {
    const allLists = getAllLists()
    setLists(allLists)
  }, [])

  // Handle creating new list
  const handleCreateList = (formData) => {
    const newList = createNewList(
      formData.name,
      formData.city,
      formData.startDate,
      formData.endDate
    )

    // Update state
    setLists((prev) => ({
      ...prev,
      [newList.id]: newList,
    }))

    // Close modal
    setIsModalOpen(false)

    // Navigate to the new list
    router.push(`/site/packing-lists/${newList.id}`)
  }

  // Handle deleting a list - opens confirmation modal
  const handleDeleteList = (listId, listName) => {
    setDeleteConfirm({
      isOpen: true,
      listId,
      listName,
    })
  }

  // Confirm delete action
  const confirmDelete = () => {
    if (deleteConfirm.listId) {
      deleteList(deleteConfirm.listId)
      setLists((prev) => {
        const updated = { ...prev }
        delete updated[deleteConfirm.listId]
        return updated
      })
    }
    // Close modal
    setDeleteConfirm({
      isOpen: false,
      listId: null,
      listName: '',
    })
  }

  // Cancel delete action
  const cancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      listId: null,
      listName: '',
    })
  }

  // Convert lists object to array and sort by creation date
  const listsArray = Object.values(lists).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  // Calculate progress for a list
  const calculateProgress = (categories) => {
    let totalItems = 0
    let checkedItems = 0

    categories.forEach((category) => {
      totalItems += category.items.length
      checkedItems += category.items.filter((item) => item.checked).length
    })

    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
  }

  return (
    <div className="min-h-[calc(100vh-170px)] bg-background-100">
      {/* Main Content */}
      <div className="md:ml-14">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 md:px-12 lg:px-[60px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-medium text-[#333] sm:text-4xl">
              行李清單
            </h1>
            <p className="text-base text-gray-600 sm:text-lg">
              管理您的所有旅行打包清單
            </p>
          </div>

          {/* Create New List Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mb-8 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#d0d0d0] bg-white px-6 py-6 text-lg font-medium text-primary-500 transition-all hover:border-primary-500 hover:bg-[#f8f8f8] sm:w-auto sm:px-8"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            建立新清單
          </button>

          {/* Lists Grid */}
          {listsArray.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm sm:p-20">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-800">
                還沒有任何清單
              </h3>
              <p className="text-gray-500">點擊上方按鈕建立您的第一個清單</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listsArray.map((list) => {
                const progress = calculateProgress(list.categories)
                const totalItems = list.categories.reduce(
                  (sum, cat) => sum + cat.items.length,
                  0
                )
                const checkedItems = list.categories.reduce(
                  (sum, cat) =>
                    sum + cat.items.filter((item) => item.checked).length,
                  0
                )

                return (
                  <div
                    key={list.id}
                    className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Card Content - Clickable */}
                    <div
                      onClick={() =>
                        router.push(`/site/packing-lists/${list.id}`)
                      }
                      className="cursor-pointer p-6"
                    >
                      {/* List Name (Title) */}
                      <h3 className="mb-3 text-xl font-medium text-[#333]">
                        {list.name}
                      </h3>

                      {/* Date Range */}
                      <p className="mb-1 text-sm text-gray-500">
                        {formatDateRange(list.startDate, list.endDate)}
                      </p>

                      {/* City */}
                      <p className="mb-4 text-base text-gray-600">
                        {list.city}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">完成度</span>
                          <span className="font-medium text-secondary-900">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-3 text-sm text-gray-500">
                        {checkedItems} / {totalItems} 項目已完成
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteList(list.id, list.name)
                      }}
                      className="absolute right-4 top-4 rounded-lg bg-white p-2 text-gray-400 sm:opacity-0 shadow-md transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 "
                      title="刪除清單"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New List Modal */}
      <NewListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateList}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="確認刪除"
        message={`確定要刪除「${deleteConfirm.listName}」清單嗎？\n此操作無法復原。`}
        confirmText="刪除"
        cancelText="取消"
        confirmButtonStyle="bg-red-500 hover:bg-red-600"
      />
    </div>
  )
}
