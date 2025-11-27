/**
 * AddCategoryModal Component
 * Modal form for adding a new category
 */

'use client'

import { useState, useEffect } from 'react'

export default function AddCategoryModal({ isOpen, onClose, onSubmit }) {
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState('')

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategoryName('')
      setError('')
    }
  }, [isOpen])

  const handleChange = (e) => {
    setCategoryName(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const validate = () => {
    if (!categoryName.trim()) {
      return '請輸入分類名稱'
    }
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    onSubmit(categoryName.trim())

    // Reset form
    setCategoryName('')
    setError('')
  }

  const handleClose = () => {
    setCategoryName('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-[#333]">新增分類</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              分類名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={handleChange}
              placeholder="例如：衣物、盥洗用品、電子產品"
              autoFocus
              className={`w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-primary-500/90"
            >
              新增
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
