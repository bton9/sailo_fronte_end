/**
 * ImageUploader - 聊天室圖片上傳元件
 * 路徑: sailo/components/chatroom/customer_chat/ImageUploader.jsx
 * 版本: v2.0.0
 *
 * 功能說明:
 * - 圖片選擇與預覽
 * - 上傳到 ImageKit (透過後端 API)
 * - 上傳進度顯示
 * - 支援拖曳上傳
 * - 檔案大小限制 (5MB)
 * - 檔案類型檢查 (jpg, png, gif, webp)
 *
 * v2.0.0 更新:
 * - 移除所有圓角設計
 * - 統一使用 primary-500 配色 (#a48c62)
 *
 * 使用方式:
 * <ImageUploader
 *   roomId={123}
 *   onClose={() => setShowUploader(false)}
 *   onImageUploaded={(data) => console.log(data)}
 * />
 */

'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react'

export default function ImageUploader({ roomId, onClose, onImageUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // ============================================
  // 常數定義
  // ============================================
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  // ============================================
  // 工具函式: 驗證檔案
  // ============================================
  const validateFile = (file) => {
    // 檢查檔案類型
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('僅支援 JPG, PNG, GIF, WEBP 格式')
      return false
    }

    // 檢查檔案大小
    if (file.size > MAX_FILE_SIZE) {
      setError('檔案大小不可超過 5MB')
      return false
    }

    setError(null)
    return true
  }

  // ============================================
  // 事件: 選擇檔案
  // ============================================
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateFile(file)) return

    setSelectedFile(file)

    // 建立預覽 URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // ============================================
  // 事件: 拖曳上傳
  // ============================================
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!validateFile(file)) return

    setSelectedFile(file)

    // 建立預覽 URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // ============================================
  // API: 上傳圖片到後端 (轉發到 ImageKit)
  // ============================================
  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // 將檔案轉為 Base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target.result

        setUploadProgress(30)

        // 呼叫後端 API 上傳到 ImageKit
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customer-service/upload`,
          {
            method: 'POST',
            credentials: 'include', // 傳送 httpOnly Cookie
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64Data,
              fileName: selectedFile.name,
              roomId,
            }),
          }
        )

        setUploadProgress(80)

        const data = await response.json()

        setUploadProgress(100)

        if (data.success) {
          console.log('✅ 圖片上傳成功:', data)

          // 回傳上傳結果給父元件
          onImageUploaded({
            imageUrl: data.imageUrl,
            thumbnailUrl: data.thumbnailUrl,
            fileName: selectedFile.name,
            messageId: data.messageId,
          })

          // 關閉上傳器
          onClose()
        } else {
          setError(data.message || '上傳失敗')
        }
      }

      reader.onerror = () => {
        setError('讀取檔案失敗')
        setIsUploading(false)
      }

      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error(' 上傳圖片失敗:', error)
      setError('上傳失敗,請稍後再試')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // ============================================
  // 渲染: 上傳介面
  // ============================================
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white shadow-2xl w-full max-w-md mx-4">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-4 bg-primary-500 text-white">
          <h3 className="font-semibold text-lg">上傳圖片</h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 transition-colors"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {/* 內容區 */}
        <div className="p-6">
          {/* 圖片預覽 */}
          {previewUrl ? (
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="預覽"
                className="w-full h-64 object-contain bg-gray-100"
              />
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                重新選擇
              </button>
            </div>
          ) : (
            // 拖曳上傳區域
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
            >
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">點擊或拖曳圖片到此處</p>
              <p className="text-sm text-gray-400">
                支援 JPG, PNG, GIF, WEBP (最大 5MB)
              </p>
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

          {/* 錯誤訊息 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 上傳進度 */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">上傳中...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="bg-primary-500 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 按鈕區 */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-gray-700 text-white hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                上傳中
              </>
            ) : (
              <>
                <Upload size={16} />
                上傳
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
