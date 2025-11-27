import React from 'react'

/**
 * 景點資訊卡片組件
 */
export default function PlaceInfoCard({
  placeName,
  placeCategory,
  placeImage,
}) {
  return (
    <div className="p-6 bg-gray-50 border-b border-gray-200">
      <div className="flex items-start space-x-4">
        {placeImage && (
          <img
            src={placeImage}
            alt={placeName}
            className="w-24 h-24 object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {placeName}
          </h3>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            {placeCategory}
          </span>
        </div>
      </div>
    </div>
  )
}
