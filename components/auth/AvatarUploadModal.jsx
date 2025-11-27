/**
 * AvatarUploadModal - 頭像上傳彈窗元件
 * 路徑: sailo/components/auth/AvatarUploadModal.jsx
 *
 * 功能：
 * 1. 顯示目前頭像
 * 2. 選擇並預覽新頭像
 * 3. 上傳頭像到後端
 * 4. 刪除現有頭像
 * 5. 檔案驗證（格式、大小）
 *
 * 使用方式：
 * <AvatarUploadModal
 *   isOpen={showModal}
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 *   currentAvatar={user?.avatar}
 * />
 */

'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload, Trash2, Check } from 'lucide-react'
import { userAPI } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { getFullAvatarUrl } from '@/utils/avatar' // 頭像 URL 工具函數

export default function AvatarUploadModal({
  isOpen,
  onClose,
  onSuccess,
  currentAvatar,
}) {
  // ============ 狀態管理 ============
  const [selectedFile, setSelectedFile] = useState(null) // 選中的檔案
  const [previewUrl, setPreviewUrl] = useState(null) // 預覽圖片 URL
  const [isLoading, setIsLoading] = useState(false) // 載入狀態
  const [error, setError] = useState('') // 錯誤訊息
  const [success, setSuccess] = useState('') // 成功訊息
  const fileInputRef = useRef(null) // 檔案輸入參照
  const { updateUser } = useAuth() // 更新使用者資料方法

  // ============ 檔案驗證配置 ============
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  // ============ 檔案選擇處理 ============
  /**
   * 處理檔案選擇事件
   * 1. 驗證檔案類型和大小
   * 2. 產生預覽圖
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 重置訊息
    setError('')
    setSuccess('')

    // 驗證檔案類型
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('只支援 JPG、PNG、GIF、WEBP 格式')
      return
    }

    // 驗證檔案大小
    if (file.size > MAX_FILE_SIZE) {
      setError('檔案大小不能超過 5MB')
      return
    }

    // 產生預覽圖
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
      setSelectedFile(file)
    }
    reader.readAsDataURL(file)
  }

  // ============ 上傳頭像 ============
  /**
   * 將選中的檔案上傳到後端
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('請先選擇圖片')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // 呼叫 API 上傳
      const data = await userAPI.uploadAvatar(selectedFile)

      if (data.success) {
        setSuccess('頭像上傳成功！')

        // 更新 AuthContext 中的使用者資料
        updateUser({ avatar: data.avatarUrl })

        // 2 秒後關閉彈窗並執行成功回調
        setTimeout(() => {
          onSuccess && onSuccess(data.avatarUrl)
          handleClose()
        }, 2000)
      } else {
        setError(data.message || '上傳失敗')
      }
    } catch (err) {
      console.error('上傳頭像錯誤:', err)
      setError(err.message || '上傳失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ 刪除頭像 ============
  /**
   * 刪除目前的頭像
   */
  const handleDelete = async () => {
    if (!currentAvatar) {
      setError('目前沒有頭像')
      return
    }

    if (!confirm('確定要刪除頭像嗎？')) {
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await userAPI.deleteAvatar()

      if (data.success) {
        setSuccess('頭像已刪除！')

        // 更新 AuthContext 中的使用者資料
        updateUser({ avatar: null })

        // 2 秒後關閉彈窗
        setTimeout(() => {
          onSuccess && onSuccess(null)
          handleClose()
        }, 2000)
      } else {
        setError(data.message || '刪除失敗')
      }
    } catch (err) {
      console.error('刪除頭像錯誤:', err)
      setError(err.message || '刪除失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ 關閉彈窗 ============
  /**
   * 重置所有狀態並關閉彈窗
   */
  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError('')
    setSuccess('')
    onClose()
  }

  // ============ 點擊選擇按鈕 ============
  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  // 若彈窗未開啟，不渲染
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 彈窗卡片 */}
      <div className="relative bg-white w-full max-w-md mx-4 p-6 animate-[slideDown_0.3s_ease-out]">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-bold text-gray-800">頭像設定</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast 成功訊息 */}
        {success && (
          <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div className="flex justify-center pt-4 animate-[slideDown_0.3s_ease-out]">
              <div className="bg-primary-300 text-secondary-600 px-6 py-4 flex items-center gap-3 hover:scale-105 transition-transform pointer-events-auto">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-[checkmark_0.3s_ease-in-out]">
                  <Check className="w-4 h-4 text-primary-500" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 目前頭像顯示 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            預覽頭像
          </label>
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-white">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="預覽"
                  className="w-full h-full object-cover"
                />
              ) : currentAvatar ? (
                <img
                  src={getFullAvatarUrl(currentAvatar)}
                  alt="目前頭像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-5xl"></span>
              )}
            </div>
          </div>
        </div>

        {/* 檔案選擇提示 */}
        {selectedFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            已選擇：{selectedFile.name}
          </div>
        )}

        {/* 隱藏的檔案輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 操作按鈕 */}
        <div className="space-y-3">
          {/* 選擇圖片按鈕 */}
          <button
            onClick={handleSelectClick}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            選擇圖片
          </button>

          {/* 上傳按鈕 */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full py-3 px-4 bg-secondary-900 hover:bg-primary-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                上傳中...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                確認上傳
              </>
            )}
          </button>

          {/* 刪除頭像按鈕 */}
          {currentAvatar && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-point-500/10 hover:bg-red-100 text-point-500 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              刪除頭像
            </button>
          )}
        </div>

        {/* 檔案限制說明 */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          支援 JPG、PNG、GIF、WEBP 格式，最大 5MB
        </div>
      </div>
    </div>
  )
}
