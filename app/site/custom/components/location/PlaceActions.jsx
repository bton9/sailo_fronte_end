import { MapPin, Plus, Star, MessageCircle } from 'lucide-react'

export default function PlaceActions({ 
  onGoogleReview, 
  onNavigation, 
  onAddToTrip,
  onComments
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Google 評論按鈕 */}
      <button
        onClick={onGoogleReview}
        className="bg-[#a48c62] hover:bg-[#bfb3a1] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
      >
        <Star className="w-5 h-5" />
        Google 評論
      </button>

      {/* 導航按鈕 */}
      <button
        onClick={onNavigation}
        className="bg-[#a48c62] hover:bg-[#bfb3a1] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
      >
        <MapPin className="w-5 h-5" />
        導航
      </button>

      {/* 加入行程按鈕 */}
      <button
        onClick={onAddToTrip}
        className="bg-[#a48c62] hover:bg-[#bfb3a1] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
      >
        <Plus className="w-5 h-5" />
        加入行程
      </button>

      {/* 評論按鈕 */}
      <button
        onClick={onComments}
        className="bg-[#a48c62] hover:bg-[#bfb3a1] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        查看評論
      </button>
    </div>
  )
}