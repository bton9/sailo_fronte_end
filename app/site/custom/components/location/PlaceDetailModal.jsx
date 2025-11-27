import { X } from 'lucide-react'
import ImageGallery from './ImageGallery'
import PlaceInfo from './PlaceInfo'
import PlaceActions from './PlaceActions'

export default function PlaceDetailModal({
  place,
  loading,
  coverImage,
  galleryImages,
  currentImageIndex,
  setCurrentImageIndex,
  isFavorited,
  onClose,
  onFavoriteClick,
  onNavigation,
  onAddToTrip,
  onGoogleReview,
  onImageUpload,
  onDeleteImage,
}) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <>
      {/* 模糊背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 z-[150] animate-fade-in"
        onClick={handleBackdropClick}
      />
      {/* Modal 視窗 */}
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div className="max-w-5xl w-full animate-scale-in relative">
          {/* 關閉按鈕 */}
          <div className="absolute -top-3 -right-3 z-[10000] flex gap-2">
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2.5 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              title="關閉 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white overflow-hidden">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary-900"></div>
              </div>
            ) : !place ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    找不到景點資料
                  </h2>
                  <p className="text-gray-600">請稍後再試</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-1 h-3/4 gap-0">
                {/* 圖片畫廊 */}
                <ImageGallery
                  coverImage={coverImage}
                  galleryImages={galleryImages}
                  currentImageIndex={currentImageIndex}
                  setCurrentImageIndex={setCurrentImageIndex}
                  isFavorited={isFavorited}
                  placeName={place.name}
                  onFavoriteClick={onFavoriteClick}
                  onImageUpload={onImageUpload}
                  onDeleteImage={onDeleteImage}
                />
                {/* 景點資訊與操作 */}
                <div className="p-8 grid md:grid-cols-2 gap-6 ">
                  <PlaceInfo place={place} />
                  <PlaceActions
                    onGoogleReview={onGoogleReview}
                    onNavigation={onNavigation}
                    onAddToTrip={onAddToTrip}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}
