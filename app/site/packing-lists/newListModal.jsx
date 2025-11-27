/**
 * NewListModal Component
 * Modal form for creating a new packing list or editing existing one
 */

'use client'

import { useState, useEffect } from 'react'

export default function NewListModal({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    startDate: '',
    endDate: '',
  })

  const [errors, setErrors] = useState({})

  // Load edit data when modal opens in edit mode
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        name: editData.name || '',
        city: editData.city || '',
        startDate: editData.startDate || '',
        endDate: editData.endDate || '',
      })
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        city: '',
        startDate: '',
        endDate: '',
      })
      setErrors({})
    }
  }, [isOpen, editData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '請輸入清單標題'
    }

    if (!formData.city.trim()) {
      newErrors.city = '請輸入目的地城市'
    }

    if (!formData.startDate) {
      newErrors.startDate = '請選擇開始日期'
    }

    if (!formData.endDate) {
      newErrors.endDate = '請選擇結束日期'
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = '結束日期不能早於開始日期'
      }
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)

    // Reset form
    setFormData({
      name: '',
      city: '',
      startDate: '',
      endDate: '',
    })
    setErrors({})
  }

  const handleClose = () => {
    setFormData({
      name: '',
      city: '',
      startDate: '',
      endDate: '',
    })
    setErrors({})
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
          <h2 className="text-2xl font-medium text-[#333]">
            {editData ? '編輯清單' : '建立新清單'}
          </h2>
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
          {/* List Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              清單標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="例如：日本旅遊、畢業旅行"
              className={`w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              目的地城市 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="例如：東京、首爾、高雄市"
              className={`w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 ${
                errors.city
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                開始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 ${
                  errors.startDate
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                結束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 ${
                  errors.endDate
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
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
              {editData ? '儲存變更' : '建立清單'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
