'use client'

import { useState, useRef } from 'react'
import * as FaIcons from 'react-icons/fa6'

/**
 * ImageUpload - 圖片上傳元件（支援多張）
 */
export default function ImageUpload({
  onImageSelect = () => {},
  onPhotoDelete = () => {}, // ← 重要：加入這行
  maxSize = 5, // MB
  maxFiles = 5, // 最多上傳張數
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif'],
  initialImages = [], // 編輯模式的初始圖片
  initialPhotosWithIds = [], // ← 新增：完整的圖片資料（含 photo_id）
}) {
  const [previews, setPreviews] = useState(
    initialPhotosWithIds.length > 0
      ? initialPhotosWithIds.map((photo) => ({
          url: photo.url,
          name: photo.url.split('/').pop() || `image-${photo.photo_id}`,
          isExisting: true,
          photo_id: photo.photo_id, // ← 儲存 photo_id
        }))
      : initialImages.map((url, index) => ({
          url,
          name: `image-${index + 1}`,
          isExisting: true,
        }))
  )
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)

    if (files.length === 0) return

    // 檢查數量限制
    if (previews.length + files.length > maxFiles) {
      alert(`最多只能上傳 ${maxFiles} 張圖片`)
      return
    }

    // 驗證每個檔案
    const validFiles = []
    for (const file of files) {
      // 檢查檔案大小
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name} 檔案大小不能超過 ${maxSize}MB`)
        continue
      }

      // 檢查檔案格式
      if (!acceptedFormats.includes(file.type)) {
        alert(`${file.name} 格式不支援，只能上傳 JPG、PNG、GIF`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // 讀取圖片預覽
    const newPreviews = [...previews]
    let processed = 0

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push({
          file: file,
          url: e.target.result,
          name: file.name,
          isExisting: false, // 標記為新圖片
        })
        processed++

        if (processed === validFiles.length) {
          setPreviews(newPreviews)
          // 只回傳新上傳的檔案
          const newFiles = newPreviews.filter((p) => !p.isExisting).map((p) => p.file)
          const existingUrls = newPreviews.filter((p) => p.isExisting).map((p) => p.url)
          onImageSelect(newFiles, existingUrls)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemove = (indexToRemove) => {
    const removedPreview = previews[indexToRemove]
    const newPreviews = previews.filter((_, index) => index !== indexToRemove)
    setPreviews(newPreviews)

    // ✅ 如果刪除的是舊圖片，通知父元件
    if (removedPreview.isExisting && removedPreview.photo_id) {
      onPhotoDelete(removedPreview.photo_id)
    }

    const newFiles = newPreviews.filter((p) => !p.isExisting).map((p) => p.file)
    const existingUrls = newPreviews.filter((p) => p.isExisting).map((p) => p.url)
    onImageSelect(newFiles, existingUrls)

    // 清空 input
    if (newPreviews.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-primary mb-2">
        上傳圖片 {previews.length > 0 && `(${previews.length}/${maxFiles})`}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* 上傳區域 */}
      {previews.length < maxFiles && (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-primary rounded-xl p-8 text-center cursor-pointer hover:bg-primary/10 transition-all bg-primary/5 mb-4"
        >
          <FaIcons.FaCloudArrowUp className="text-5xl text-primary mb-4 mx-auto" />
          <div className="text-primary text-base font-semibold">
            點擊上傳圖片
          </div>
          <div className="text-gray-500 text-sm mt-2">
            支援 JPG、PNG、GIF 格式，單檔不超過 {maxSize}MB，最多 {maxFiles} 張
          </div>
        </div>
      )}

      {/* 預覽區域 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.url}
                alt={`預覽 ${index + 1}`}
                className="w-full h-48 object-cover rounded-xl border-2 border-border"
              />

              {/* 第一張標記 */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
                  封面
                </div>
              )}

              {/* 刪除按鈕 */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-black/70 text-white border-none rounded-full w-8 h-8 cursor-pointer hover:bg-secondary transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <FaIcons.FaXmark />
              </button>

              {/* 檔名 */}
              <div className="mt-2 text-xs text-gray-600 truncate flex items-center gap-1">
                <FaIcons.FaImage />
                {preview.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}