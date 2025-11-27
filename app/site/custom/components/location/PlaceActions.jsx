import { Star, MapPin } from 'lucide-react'

export default function PlaceActions({
  onGoogleReview,
  onNavigation,
  onAddToTrip,
}) {
  return (
    <div className="grid grid-cols-3 gap-3 ">
      <button
        onClick={onGoogleReview}
        className="py-3 bg-white border-2 border-gray-200 font-semibold text-sm text-gray-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
      >
        <Star className="w-5 h-5" />
        <span className="hidden lg:inline">Google評論</span>
        <span className="lg:hidden">評論</span>
      </button>

      <button
        onClick={onNavigation}
        className="py-3 bg-primary-500 hover:bg-amber-600 font-semibold text-sm text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
      >
        <MapPin className="w-5 h-5" />
        <span className="hidden lg:inline">開始導航</span>
        <span className="lg:hidden">導航</span>
      </button>

      <button
        onClick={onAddToTrip}
        className="py-3 bg-secondary-900 hover:bg-secondary-800 font-semibold text-sm text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
      >
        <span className="hidden lg:inline">加入行程</span>
        <span className="lg:hidden">行程</span>
      </button>
    </div>
  )
}
