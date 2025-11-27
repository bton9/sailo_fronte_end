import { MapPin, Star, Clock } from 'lucide-react'

export default function PlaceInfo({ place }) {
  const openingHours = [
    { day: '星期一', time: '11:00-17:00' },
    { day: '星期二', time: '11:00-17:00' },
    { day: '星期三', time: '11:00-17:00' },
    { day: '星期四', time: '11:00-17:00' },
    { day: '星期五', time: '11:00-17:00' },
    { day: '星期六', time: '11:00-17:00' },
    { day: '星期日', time: '11:00-17:00' },
  ]

  return (
    <>
      {/* 左側：景點名稱和描述 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            {place.name}
          </h1>

          {/* 評分 */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center px-3 py-1.5">
              <Star className="w-5 h-5 text-secondary-600 fill-secondary-600 mr-1" />
              <span className="font-bold text-secondary-600 text-base">
                {place.rating?.toFixed(1) || '4.4'}
              </span>
            </div>
          </div>

          {/* 位置 */}
          <div className="flex items-start space-x-2 text-gray-700 group hover:text-secondary-900 transition-colors duration-300">
            <MapPin className="w-6 h-6 mt-0.5 flex-shrink-0" />
            <p className="text-base">
              台灣 {place.location_name} - {place.name}
            </p>
          </div>
        </div>

        {/* 描述 */}
        {place.description && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-700 leading-relaxed text-base">
              {place.description}
            </p>
          </div>
        )}
      </div>

      {/* 右側：開放時間 */}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-800 text-base">
              開放時間
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {openingHours.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-gray-700 py-1"
              >
                <span className="font-medium">{item.day}</span>
                <span className="text-gray-900">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
