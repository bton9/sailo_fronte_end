import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// 輔助函數：處理圖片 URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl)
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'

  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('/uploads/')) return `${API_URL}${imageUrl}`
  return `${API_URL}/uploads/${imageUrl}`
}

export function usePlaceImages(
  placeId,
  place,
  isOpen,
  user,
  confirmModal,
  setConfirmModal
) {
  const [coverImage, setCoverImage] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 載入封面圖片
  useEffect(() => {
    if (place) {
      setCoverImage(getImageUrl(place.cover_image))
    }
  }, [place])

  // 載入相簿圖片
  useEffect(() => {
    if (!isOpen || !placeId) return

    const fetchGalleryImages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/places/${placeId}/gallery`)

        if (!res.ok) {
          console.error('相簿 API 錯誤:', res.status)
          return
        }

        const data = await res.json()

        if (data.success && data.images) {
          const imagesWithData = data.images.map((img) => ({
            id: img.media_id || img.id || img.image_id,
            url: getImageUrl(img.image_url),
            originalUrl: img.image_url,
          }))
          setGalleryImages(imagesWithData)
        }
      } catch (err) {
        console.error('❌ 載入相簿失敗:', err)
        setGalleryImages([])
      }
    }

    fetchGalleryImages()
  }, [placeId, isOpen])

  // 上傳圖片
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!user?.id) {
      showError('請先登入才能上傳照片')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('圖片檔案過大,請選擇小於 5MB 的圖片')
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('place_id', placeId)
    formData.append('user_id', user.id)

    try {
      const res = await fetch(`${API_URL}/api/places/gallery/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success && data.url) {
        setGalleryImages((prev) => [
          ...prev,
          {
            id: data.media_id || data.image_id || data.id,
            url: data.url,
            originalUrl: data.url,
          },
        ])

        setCurrentImageIndex(galleryImages.length + 1)
        showSuccess('圖片上傳成功！')
      } else {
        showError('上傳失敗：' + (data.message || '未知錯誤'))
      }
    } catch (err) {
      console.error('❌ 上傳圖片失敗:', err)
      showError('上傳失敗,請稍後再試')
    }
  }

  // 刪除圖片
  const handleDeleteImage = async (imageIndex) => {
    if (!user?.id) {
      showError('請先登入才能刪除照片')
      return
    }

    showConfirm(
      '刪除圖片',
      '確定要刪除這張圖片嗎？',
      async () => {
        closeModal()
        try {
          const imageData = galleryImages[imageIndex]
          const imageId = imageData.id

          const res = await fetch(`${API_URL}/api/places/gallery/${imageId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              place_id: parseInt(placeId),
            }),
          })

          const data = await res.json()

          if (data.success) {
            setGalleryImages((prev) =>
              prev.filter((_, idx) => idx !== imageIndex)
            )

            if (currentImageIndex > imageIndex + 1) {
              setCurrentImageIndex((prev) => prev - 1)
            } else if (currentImageIndex === imageIndex + 1) {
              setCurrentImageIndex(Math.max(0, imageIndex))
            }

            showSuccess('圖片已刪除')
          } else {
            if (res.status === 403) {
              showError('無權限刪除此圖片\n只有上傳者本人或管理員可以刪除')
            } else if (res.status === 404) {
              showError('圖片不存在')
            } else {
              showError('刪除失敗：' + (data.message || '未知錯誤'))
            }
          }
        } catch (err) {
          console.error('刪除圖片失敗:', err)
          showError('刪除失敗: ' + err.message)
        }
      },
      '刪除'
    )
  }

  // Modal 輔助函數
  const showConfirm = (title, message, onConfirm, confirmText = '確定') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText: '取消',
    })
  }

  const showSuccess = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '成功',
      message,
      onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      confirmText: '確定',
      cancelText: '取消',
    })
  }

  const showError = (message) => {
    setConfirmModal({
      isOpen: true,
      title: '錯誤',
      message,
      onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      confirmText: '確定',
      cancelText: '取消',
    })
  }

  const closeModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
  }

  return {
    coverImage,
    galleryImages,
    currentImageIndex,
    setCurrentImageIndex,
    handleImageUpload,
    handleDeleteImage,
  }
}
