    import React, { useState } from 'react'
    import {
    ChevronLeft,
    Share2,
    Settings,
    X,
    Plus,
    MoreHorizontal,
    } from 'lucide-react'

    export default function ItineraryList({ onNavigateToSettings, onClose }) {
    const [activeDay, setActiveDay] = useState(1)
    const [showSettings, setShowSettings] = useState(false)

    const days = [
        { id: 'overview', label: '總覽頁' },
        { id: 1, label: '第1天' },
        { id: 2, label: '第2天' },
        { id: 3, label: '第3天' },
        { id: 4, label: '第4天' },
        { id: 5, label: '第5天' },
        { id: 6, label: '第6天' },
        { id: 7, label: '第7天' },
        { id: 8, label: '第8天' },
        { id: 9, label: '第9天' },
    ]

    return (
        <>
        {/* 背景遮罩 - 只在手機版顯示 */}
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
        />

        {/* 側邊欄 */}
        <div className="fixed right-0 top-0 h-full w-full md:w-[350px] lg:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* Header */}
            <div className="bg-blue-500 text-white px-3 md:px-4 py-3 md:py-4 shadow-md flex-shrink-0">
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <button
                onClick={onNavigateToSettings}
                className="flex items-center gap-2 hover:opacity-80 transition"
                >
                <ChevronLeft size={22} className="md:w-6 md:h-6" />
                <span className="text-base md:text-lg font-medium">行程列表</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                <button className="hover:opacity-80 transition">
                    <Share2 size={20} className="md:w-[22px] md:h-[22px]" />
                </button>
                <button
                    className="hover:opacity-80 transition"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings size={20} className="md:w-[22px] md:h-[22px]" />
                </button>
                <button onClick={onClose} className="hover:opacity-80 transition">
                    <X size={22} className="md:w-6 md:h-6" />
                </button>
                </div>
            </div>

            {/* Day Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((day) => (
                <button
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-t-lg whitespace-nowrap transition font-medium text-sm md:text-base ${
                    activeDay === day.id
                        ? 'bg-white text-blue-500'
                        : 'text-white hover:bg-blue-400'
                    }`}
                >
                    {day.label}
                </button>
                ))}
                <button className="p-1.5 md:p-2 text-white hover:bg-blue-400 rounded-lg transition ml-2">
                <Plus size={18} className="md:w-5 md:h-5" />
                </button>
            </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 md:p-4 overflow-y-auto">
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                10/24 週五
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={18} className="md:w-5 md:h-5" />
                </button>
            </div>

            {/* Empty State 1 */}
            <div className="bg-gray-100 rounded-2xl p-8 md:p-12 mb-4 text-center">
                <p className="text-gray-500 text-sm md:text-base">
                還沒有排這天的行程呦
                </p>
            </div>

            {/* Dashed Line */}
            <div className="border-l-2 border-dashed border-gray-300 h-8 md:h-12 ml-4 md:ml-6"></div>

            {/* Empty State 2 with CTA */}
            <div className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center">
                <p className="text-gray-600 text-sm md:text-base mb-2 md:mb-3">
                找找感興趣的景點，
                </p>
                <p className="text-gray-600 text-sm md:text-base">
                或
                <button className="text-blue-500 hover:text-blue-600 font-medium underline mx-1">
                    看看收藏
                </button>
                ，讓行程更有趣吧！
                </p>
            </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
            <>
                <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowSettings(false)}
                ></div>
                <div className="fixed right-0 top-0 bottom-0 w-64 md:w-80 bg-white shadow-2xl z-50 p-4 md:p-6 transform transition-transform">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-bold">設定</h3>
                    <button onClick={() => setShowSettings(false)}>
                    <X size={22} className="md:w-6 md:h-6" />
                    </button>
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                    <p>設定選項...</p>
                </div>
                </div>
            </>
            )}
        </div>
        </>
    )
    }
