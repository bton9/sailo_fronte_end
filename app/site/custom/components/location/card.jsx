'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Heart, Plus, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import SoloTravelWishlist from '../addtotrip/SoloTravelWishlist'
import PlaceDetail from './PlaceDetail'
import AddToTripDrawer from '../addtotrip/addtotripdrawer'
import RIC_fi from '@/lib/react_icon/fi'

export default function Card({
  place_id,
  name,
  cover_image,
  location_name,
  rating,
  category,
}) {
  const cardRef = useRef(null)
  const { user } = useAuth() // ✅ Auth V2
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [showAddToTrip, setShowAddToTrip] = useState(false)
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // ✅ 檢查此景點是否在任何收藏清單中
  const fetchFavoriteStatus = async () => {
    if (!user?.id) return

    try {
      const res = await fetch(`${BACKEND_URL}/api/favorites/${user.id}`)
      const data = await res.json()

      if (!data.success || !data.favorites) {
        setFavorited(false)
        return
      }

      // 檢查所有清單的景點
      let isInAnyList = false
      for (const list of data.favorites) {
        const placesRes = await fetch(
          `${BACKEND_URL}/api/favorites/list/${list.list_id}`
        )
        const placesData = await placesRes.json()

        if (
          placesData.success &&
          placesData.places.some((p) => p.place_id === place_id)
        ) {
          isInAnyList = true
          break
        }
      }

      setFavorited(isInAnyList)
    } catch (err) {
      console.error('❌ 檢查收藏狀態失敗:', err)
      setFavorited(false)
    }
  }

  useEffect(() => {
    fetchFavoriteStatus()
    // 行程狀態（使用內存存儲代替 localStorage）
  }, [place_id, user?.id])

  // 收藏按鈕 → 開啟清單 Modal
  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setShowWishlist(true)
  }

  // 加入行程
  const handleAddToTripClick = (e) => {
    e.stopPropagation()
    setShowAddToTrip(true)
  }

  // 點擊卡片開啟詳細資訊
  const handleCardClick = () => {
    setShowDetail(true)
  }

  // 圖片邏輯
  const getImageUrl = () => {
    if (!cover_image) return `${BACKEND_URL}/uploads/default.jpg`
    if (cover_image.startsWith('http')) return cover_image
    if (cover_image.startsWith('/uploads/'))
      return `${BACKEND_URL}${cover_image}`
    return `${BACKEND_URL}/uploads/${cover_image}`
  }

  const imageUrl = imageError
    ? `${BACKEND_URL}/uploads/default.jpg`
    : getImageUrl()

  const handleImageError = () => setImageError(true)

  // 滑鼠 3D 效果 - 優化版本
  const handleMouseMove = (e) => {
    if (!cardRef.current || !isHovered) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotateX = ((y - rect.height / 2) / rect.height) * -10 // 減少旋轉角度
    const rotateY = ((x - rect.width / 2) / rect.width) * 10
    
    // 使用 requestAnimationFrame 優化效能
    requestAnimationFrame(() => {
      if (card) {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
      }
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (cardRef.current) {
      requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.transform =
            'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
        }
      })
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        className="break-inside-avoid mb-4 hover:shadow-xl overflow-hidden cursor-pointer"
        style={{
          transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
          transformStyle: 'preserve-3d',
          willChange: isHovered ? 'transform' : 'auto',
        }}
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* 圖片區域 */}
        <div className="relative w-full">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-auto object-cover transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
            style={{ contentVisibility: 'auto' }}
          />

          {/* 收藏按鈕 - 左上角，玻璃效果背景 */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 bg-white/20 backdrop-blur-lg p-2 rounded-full transition hover:bg-white/30"
          >
            <Heart
              size={15}
              className={`transition ${
                favorited ? 'text-point-500 fill-point-500' : 'text-white'
              }`}
            />
          </button>

          {/* 評分 - 右上角，深藍色背景 */}
          <div className="absolute top-1 right-0 px-2.5 py-1.5 rounded-full flex items-center gap-1">
            <span className="text-sm text-white font-medium">
              {rating ? rating.toFixed(1) : 'N/A'}
            </span>
            <Star size={14} className="text-white/70 fill-white/70" />
          </div>

          {/* 景點名稱和地點 - 覆蓋在圖片底部 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/50 to-transparent p-2.5">
            <h2 className="text-white font-normal text-base mb-1 line-clamp-1">
              {name}
            </h2>
            <p className="text-white/90 text-xs flex items-center gap-1">
              <RIC_fi.FiMapPin className="w-3 h-3" />
              台灣 {location_name}-{name}
            </p>
          </div>

          {/* 加入行程按鈕 - 右下角 */}
          <button
            onClick={handleAddToTripClick}
            className="absolute bottom-1 right-1  p-2 rounded-full transition hover:bg-white/50"
          >
            <Plus size={15} className="text-white transition" />
          </button>
        </div>
      </div>

      {/* 收藏清單 Modal */}
      <SoloTravelWishlist
        isOpen={showWishlist}
        onClose={() => {
          setShowWishlist(false)
          fetchFavoriteStatus()
        }}
        userId={user?.id}
        placeId={place_id}
      />

      {/* 景點詳細資訊 Modal */}
      <PlaceDetail
        placeId={place_id}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
      {/* 加入行程側邊欄 */}
      <AddToTripDrawer
        isOpen={showAddToTrip}
        onClose={() => setShowAddToTrip(false)}
        placeId={place_id}
        placeName={name}
        placeCategory={category || '景點'} // 從 props 取得或預設為 '景點'
        placeImage={imageUrl}
        userId={user?.id}
      />
    </>
  )
}