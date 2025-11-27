'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import SoloTravelWishlist from '../addtotrip/SoloTravelWishlist'
import AddToTripDrawer from '../addtotrip/addtotripdrawer'
import ConfirmModal from '@/components/confirmModal'
import PlaceDetailModal from './PlaceDetailModal'
import { usePlaceDetail } from '../../hook/usePlaceDetail'
import { usePlaceImages } from '../../hook/usePlaceImages'
import { useFavoriteStatus } from '../../hook/useFavoriteStatus'

export default function PlaceDetail({ placeId, isOpen, onClose }) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [showAddToTrip, setShowAddToTrip] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '確定',
    cancelText: '取消',
  })

  // 使用自定義 hooks
  const { place, loading } = usePlaceDetail(placeId, isOpen)
  const {
    coverImage,
    galleryImages,
    currentImageIndex,
    setCurrentImageIndex,
    handleImageUpload,
    handleDeleteImage,
  } = usePlaceImages(
    placeId,
    place,
    isOpen,
    user,
    confirmModal,
    setConfirmModal
  )

  const { isFavorited, fetchFavoriteStatus } = useFavoriteStatus(
    placeId,
    isOpen,
    user?.id
  )

  // Modal 輔助函數
  const modalHelpers = {
    showConfirm: (title, message, onConfirm, confirmText = '確定') => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        onConfirm,
        confirmText,
        cancelText: '取消',
      })
    },
    showSuccess: (message) => {
      setConfirmModal({
        isOpen: true,
        title: '成功',
        message,
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        confirmText: '確定',
        cancelText: '取消',
      })
    },
    showError: (message) => {
      setConfirmModal({
        isOpen: true,
        title: '錯誤',
        message,
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        confirmText: '確定',
        cancelText: '取消',
      })
    },
    closeModal: () => {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }))
    },
  }

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 防止背景滾動
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // ESC 鍵關閉
  useEffect(() => {
    if (!isOpen) return
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  // 操作函數
  const handleFavoriteClick = () => setWishlistOpen(true)

  const handleNavigation = () => {
    if (!place) return
    const address = `台灣${place.location_name}${place.name}`
    const mapsUrl =
      place.latitude && place.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    window.open(mapsUrl, '_blank')
  }

  const handleAddToTrip = () => {
    if (!user?.id) {
      modalHelpers.showError('請先登入才能加入行程')
      return
    }
    setShowAddToTrip(true)
  }

  const handleGoogleReview = () => {
    if (!place) return
    const url = place.google_place_id
      ? `https://www.google.com/maps/place/?q=place_id:${place.google_place_id}`
      : `https://www.google.com/maps/search/?q=${encodeURIComponent(place.name)}`
    window.open(url, '_blank')
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      <PlaceDetailModal
        place={place}
        loading={loading}
        coverImage={coverImage}
        galleryImages={galleryImages}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        isFavorited={isFavorited}
        onClose={onClose}
        onFavoriteClick={handleFavoriteClick}
        onNavigation={handleNavigation}
        onAddToTrip={handleAddToTrip}
        onGoogleReview={handleGoogleReview}
        onImageUpload={handleImageUpload}
        onDeleteImage={handleDeleteImage}
      />

      {wishlistOpen && (
        <SoloTravelWishlist
          isOpen={wishlistOpen}
          onClose={() => {
            setWishlistOpen(false)
            fetchFavoriteStatus()
          }}
          placeId={placeId}
          userId={user?.id}
        />
      )}

      <AddToTripDrawer
        isOpen={showAddToTrip}
        onClose={() => setShowAddToTrip(false)}
        placeId={placeId}
        placeName={place?.name || ''}
        placeCategory={place?.category || '景點'}
        placeImage={coverImage || null}
        userId={user?.id}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={modalHelpers.closeModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
    </>
  )

  return createPortal(modalContent, document.body)
}
