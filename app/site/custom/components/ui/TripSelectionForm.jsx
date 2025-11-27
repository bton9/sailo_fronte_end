import React from 'react'
import { formatDate } from '@/utils/date.js'

/**
 * 行程選擇表單組件
 */
export default function TripSelectionForm({
  userTrips,
  selectedTripId,
  setSelectedTripId,
  selectedTripDayId,
  setSelectedTripDayId,
  tripDays,
  note,
  setNote,
  loading,
}) {
  return (
    <div className="p-6 space-y-6">
      {/* 選擇行程 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          選擇行程 <span className="text-red-500">*</span>
        </label>
        {loading ? (
          <div className="text-center py-4 text-gray-500">載入中...</div>
        ) : userTrips.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            您還沒有建立任何行程
          </div>
        ) : (
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">請選擇行程</option>
            {userTrips.map((trip) => (
              <option key={trip.trip_id} value={trip.trip_id}>
                {trip.trip_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 選擇日期 */}
      {selectedTripId && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            選擇日期 <span className="text-red-500">*</span>
          </label>
          {tripDays.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              此行程還沒有日期
            </div>
          ) : (
            <select
              value={selectedTripDayId}
              onChange={(e) => setSelectedTripDayId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">請選擇日期</option>
              {tripDays.map((day) => (
                <option key={day.trip_day_id} value={day.trip_day_id}>
                  Day {day.day_number} - {formatDate(day.date)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* 備註 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          備註 (選填)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如: 早上人比較少,建議9點前到達"
          className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}
