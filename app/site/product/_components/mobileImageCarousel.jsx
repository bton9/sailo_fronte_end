import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import RIC_fi from '@/lib/react_icon/fi'

export default function MobileImageCarousel({
  images,
  productName,
  currentIndex,
  onPrevious,
  onNext,
  onIndexChange,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  getImageDescription,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-square bg-gray-100">
        <p className="text-muted-foreground">無圖片</p>
      </div>
    )
  }

  const openLightbox = () => setLightboxOpen(true)
  const closeLightbox = () => setLightboxOpen(false)

  return (
    <>
      <div className="space-y-4">
        {/* 主圖片輪播 */}
        <div
          className="relative aspect-square bg-gray-50 overflow-hidden group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={openLightbox} // 點擊啟動 lightbox
          style={{cursor: 'pointer'}}
        >
          <Image
            src={images[currentIndex]}
            alt={`${productName} - ${getImageDescription(currentIndex)}`}
            fill
            className="object-cover"
            priority
          />

          {/* 左右箭頭 */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPrevious()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                aria-label="上一張圖片"
              >
                <RIC_fi.FiChevronLeft className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNext()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                aria-label="下一張圖片"
              >
                <RIC_fi.FiChevronRight className="h-5 w-5 text-gray-800" />
              </button>

              {/* 圖片指示器 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      onIndexChange(index)
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    aria-label={`查看圖片 ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 縮圖列表 */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`relative flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`縮圖 ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        slides={images.map((src) => ({ src }))}
        index={currentIndex}
        onIndexChange={onIndexChange}
      />
    </>
  )
}
