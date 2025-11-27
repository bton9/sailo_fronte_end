'use client'
import React from 'react'
import Card from '@/app/site/custom/components/location/card'

export default function PlacesList({
  places,
  currentPage,
  isLoading,
  clearFilters,
}) {
  return (
    <>
      {/* 定義動畫的 CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .place-card-animate {
          animation-name: fadeInUp;
          animation-duration: 0.6s;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
          opacity: 0;
          transform: translateY(2rem);
        }
      `}</style>

      <div className="lg:p-4">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">載入中...</span>
          </div>
        )}

        {!isLoading && places.length > 0 && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-4 px-4 lg:px-0">
            {places.map((item, index) => (
              <div
                key={`${item.place_id}-${currentPage}`}
                className="break-inside-avoid mb-4 place-card-animate"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <Card {...item} cover_image={item.cover_image} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && places.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md mx-4 lg:mx-0">
            <div className="text-6xl mb-4">😢</div>
            <p className="text-gray-500 text-lg mb-2">找不到符合條件的景點</p>
            <p className="text-gray-400 text-sm mb-4">
              試試調整搜尋條件或清除篩選
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              清除所有篩選
            </button>
          </div>
        )}
      </div>
    </>
  )
}
