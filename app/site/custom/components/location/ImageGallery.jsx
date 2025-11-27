import { useState } from 'react'
import { Heart, Upload, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

export default function ImageGallery({
  coverImage,
  galleryImages,
  currentImageIndex,
  setCurrentImageIndex,
  isFavorited,
  placeName,
  onFavoriteClick,
  onImageUpload,
  onDeleteImage,
}) {
  const [imageHover, setImageHover] = useState(false)

  const currentImage =
    currentImageIndex === 0
      ? coverImage ||
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      : galleryImages[currentImageIndex - 1]?.url ||
        galleryImages[currentImageIndex - 1]

  return (
    <div
      className="relative bg-black flex items-center justify-center h-[300px]"
      style={{ backgroundColor: '#000000' }}
    >
      <div
        className="relative w-full h-full overflow-hidden group flex items-center justify-center bg-black"
        onMouseEnter={() => setImageHover(true)}
        onMouseLeave={() => setImageHover(false)}
      >
        {/* 主圖片 */}
        <img
          src={currentImage}
          alt={`${placeName} - 圖片 ${currentImageIndex + 1}`}
          style={{
            height: '300px',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
          className="transition-all duration-300"
        />

        {/* 漸層遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* 收藏按鈕 (右上角) */}
        <button
          onClick={onFavoriteClick}
          className="absolute top-4 right-4 bg-white/30 hover:bg-white text-red-500 p-3 rounded-full transition-all hover:scale-110 z-20"
          title={isFavorited ? '已收藏' : '加入收藏'}
        >
          <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500' : ''}`} />
        </button>

        {/* 刪除按鈕 (左下角) - 只有相簿圖片才顯示 */}
        {currentImageIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteImage(currentImageIndex - 1)
            }}
            className="absolute left-4 bottom-4 z-20 bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            title="刪除圖片"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        {/* 上傳按鈕 (右下角) */}
        <label className="absolute right-4 bottom-4 bg-primary-500/80 hover:bg-primary-600 text-white p-3 rounded-full cursor-pointer transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          <Upload className="w-5 h-5" />
        </label>

        {/* 上一張按鈕 */}
        {(galleryImages.length > 0 || currentImageIndex > 0) && (
          <button
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev === 0 ? galleryImages.length : prev - 1
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* 下一張按鈕 */}
        {(galleryImages.length > 0 ||
          currentImageIndex < galleryImages.length) && (
          <button
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev === galleryImages.length ? 0 : prev + 1
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 縮圖預覽列 */}
      {galleryImages.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* 封面縮圖 */}
            <button
              onClick={() => setCurrentImageIndex(0)}
              className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${
                currentImageIndex === 0
                  ? 'border-white scale-110'
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <img
                src={
                  coverImage ||
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
                }
                alt="封面"
                className="w-full h-full object-cover"
              />
            </button>

            {/* 相簿縮圖 */}
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 group/thumb">
                <button
                  onClick={() => setCurrentImageIndex(idx + 1)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-all ${
                    currentImageIndex === idx + 1
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img
                    src={img.url || img}
                    alt={`圖片 ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* 縮圖刪除按鈕 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteImage(idx)
                  }}
                  className="absolute left-1 bottom-1 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full transition-all opacity-0 group-hover/thumb:opacity-100 hover:scale-110 z-10"
                  title="刪除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
