'use client' //: Next.js 的客戶端元件標記

import React, { useState, useEffect } from 'react'
//四個 props:
// isOpen: 控制是否顯示 Modal (true/false)
// onClose: 關閉 Modal 的函數
// place: 地點資料(包含名稱、座標等)
// onSelectNavigation: 選擇導航方式後的處理函數
export default function NavigationModal({
  isOpen,
  onClose,
  place,
  onSelectNavigation,
}) {
  if (!isOpen) return null //當 Modal 關閉時不渲染任何東西
  return (
    <>
      <div
        className="fixed inset-0 z-[170] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} // 直接用 inline style
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" //max-w-md w-full最大寬度中等,但會自適應螢幕 mx-4: 左右留白,避免在小螢幕時貼邊
          onClick={(e) => e.stopPropagation()} //重要! 防止點擊內容區時也關閉 Modal
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              選擇導航方式
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              x
            </button>
          </div>
          {/* 內容區 */}
          <div className="p-6 space-y-4">
            {/* 選項  1:google Maps */}
            <button
              onClick={() => onSelectNavigation('google')}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg  hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div>
                <div className="font-semibold text-gray-900">
                  Google Maps 導航
                </div>
                <div className="text-sm text-gray-500">
                  開啟 Google Maps App 進行導航
                </div>
              </div>
              <div className="text-gray-400 text-lg">›</div>
            </button>
            {/* 選項2 leaflet 地圖 */}
            <button
              onClick={() => onSelectNavigation('leaflet')}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">地圖路線規劃</div>
                <div className="text-sm text-gray-500">
                  在網頁內顯示詳細路線
                </div>
              </div>
              <div className="text-gray-400 text-lg">›</div>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
