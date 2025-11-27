'use client'

import { useState, useEffect } from 'react' // ✅ 新增 useEffect
import { useRouter } from 'next/navigation' // ✅ 新增
import * as FaIcons from 'react-icons/fa6'
import CategorySelector from '../form/CategorySelector'
import ImageUpload from '../form/ImageUpload'
import TagInput from '../form/TagInput'
import ItineraryCard from './ItineraryCard' // ✅ 導入行程卡片

/**
 * PostForm - 文章表單元件
 */
export default function PostForm({
  initialData = null,
  existingTags = [],
  suggestedTags = [],
  userItineraries = [],
  userPlaces = [], // ✅ 新增：景點列表
  locations = [], // ✅ 新增：地區列表
  currentUserId = null, // ✅ 新增
  onPlaceCardClick = null, // ✅ 新增
  onSubmit = () => {},
  onCancel = () => {},
  isSubmitting = false,
}) {
  const router = useRouter() // ✅ 新增
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || 'travel',
    tags: initialData?.tags
      ? initialData.tags
          .map((tag) =>
            typeof tag === 'string' ? tag : tag.tagname || tag.name || ''
          )
          .filter(Boolean)
      : [], // ✅ 統一轉換成字串陣列
    // ✅ 修改：改用 contentType 和 hasContent
    contentType: initialData?.trip_id
      ? 'itinerary'
      : initialData?.place_id
        ? 'place'
        : 'itinerary',
    hasContent: !!(initialData?.trip_id || initialData?.place_id),

    selectedItineraryId: initialData?.trip_id || null,
    selectedPlaceId: initialData?.place_id || null, // ✅ 新增
    imageFiles: [], // 改成陣列：新上傳的檔案
    existingImageUrls: initialData?.image_urls || [], // 編輯模式保留的舊圖片 URL
  })

  const [deletedPhotoIds, setDeletedPhotoIds] = useState([])
  const [titleCount, setTitleCount] = useState(initialData?.title?.length || 0)
  const [contentCount, setContentCount] = useState(
    initialData?.content?.length || 0
  )

  // ✅ 新增：景點搜尋相關狀態
  const [placeSearchKeyword, setPlaceSearchKeyword] = useState('')
  const [placeCategory, setPlaceCategory] = useState('')
  const [placeLocationId, setPlaceLocationId] = useState('')
  const [filteredPlaces, setFilteredPlaces] = useState([])

  // 處理標題變更
  const handleTitleChange = (e) => {
    const value = e.target.value
    if (value.length <= 100) {
      setFormData({ ...formData, title: value })
      setTitleCount(value.length)
    }
  }

  // 處理內容變更
  const handleContentChange = (e) => {
    const value = e.target.value
    if (value.length <= 5000) {
      setFormData({ ...formData, content: value })
      setContentCount(value.length)
    }
  }

  // 處理分類變更
  const handleCategoryChange = (category) => {
    setFormData({ ...formData, category })
  }

  // 處理標籤變更
  const handleTagsChange = (tags) => {
    setFormData({ ...formData, tags })
  }

  // 處理圖片選擇（支援多張）
  const handleImageSelect = (files, existingUrls) => {
    setFormData({
      ...formData,
      imageFiles: files, // 新上傳的檔案
      existingImageUrls: existingUrls, // 保留的舊圖片
    })
  }

  // 處理圖片刪除（記錄被刪除的 photo_id）
  const handlePhotoDelete = (photoId) => {
    setDeletedPhotoIds((prev) => {
      const newDeletedIds = [...prev, photoId]
      return newDeletedIds
    })
  }

  // 切換行程
  const handleToggleItinerary = (e) => {
    setFormData({
      ...formData,
      hasItinerary: e.target.checked,
      selectedItineraryId: e.target.checked
        ? formData.selectedItineraryId
        : null,
    })
  }

  // 選擇行程
  const handleItinerarySelect = (e) => {
    setFormData({
      ...formData,
      selectedItineraryId: parseInt(e.target.value) || null,
    })
  }

  // ✅ 新增：切換內容類型（行程 / 景點）
  const handleContentTypeChange = (type) => {
    setFormData({
      ...formData,
      contentType: type,
    })
  }

  // ✅ 新增：切換是否有關聯內容
  const handleToggleContent = (e) => {
    const checked = e.target.checked
    setFormData({
      ...formData,
      hasContent: checked,
      selectedItineraryId:
        checked && formData.contentType === 'itinerary'
          ? formData.selectedItineraryId
          : null,
      selectedPlaceId:
        checked && formData.contentType === 'place'
          ? formData.selectedPlaceId
          : null,
    })
  }

  // ✅ 新增：選擇景點
  const handlePlaceSelect = (placeId) => {
    setFormData({
      ...formData,
      selectedPlaceId: parseInt(placeId) || null,
    })
  }

  // ✅ 修改：處理景點卡片點擊
  const handlePlaceCardClickInternal = (placeId) => {
    console.log('🎯 PostForm 點擊景點卡片:', placeId)
    if (onPlaceCardClick) {
      onPlaceCardClick(placeId)
    } else {
      alert(`景點 ID: ${placeId}\n（景點 Modal 未設定）`)
    }
  }

  // ✅ 新增：處理行程卡片點擊（跳轉編輯）
  const handleItineraryCardClick = (tripId) => {
    console.log('🎯 PostForm 點擊行程卡片，跳轉編輯:', tripId)

    // 使用 sessionStorage 傳遞
    sessionStorage.setItem('openTripId', tripId)
    router.push('/site/custom')
  }

  // ✅ 新增：景點搜尋過濾
  useEffect(() => {
    if (!userPlaces || userPlaces.length === 0) {
      setFilteredPlaces([])
      return
    }

    let result = [...userPlaces]

    if (placeSearchKeyword) {
      result = result.filter(
        (place) =>
          place.name.toLowerCase().includes(placeSearchKeyword.toLowerCase()) ||
          (place.description &&
            place.description
              .toLowerCase()
              .includes(placeSearchKeyword.toLowerCase()))
      )
    }

    if (placeCategory) {
      result = result.filter((place) => place.category === placeCategory)
    }

    if (placeLocationId) {
      result = result.filter(
        (place) => place.location_id === parseInt(placeLocationId)
      )
    }

    setFilteredPlaces(result)
  }, [placeSearchKeyword, placeCategory, placeLocationId, userPlaces])

  // 取得選中的行程
  const selectedItinerary = formData.selectedItineraryId
    ? userItineraries.find((i) => i.trip_id === formData.selectedItineraryId)
    : null

  // ✅ 新增：取得選中的景點
  const selectedPlace = formData.selectedPlaceId
    ? userPlaces?.find((p) => p.place_id === formData.selectedPlaceId)
    : null

  // 表單驗證
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('請輸入文章標題')
      return false
    }

    if (!formData.content.trim()) {
      alert('請輸入文章內容')
      return false
    }

    if (!formData.category) {
      alert('請選擇文章分類')
      return false
    }

    return true
  }

  // 提交表單
  const handleSubmitClick = () => {
    if (!validateForm()) return

    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags,
      // ✅ 修改：根據 contentType 提交對應的 ID
      trip_id:
        formData.hasContent && formData.contentType === 'itinerary'
          ? formData.selectedItineraryId
          : null,
      place_id:
        formData.hasContent && formData.contentType === 'place'
          ? formData.selectedPlaceId
          : null,
      imageFiles: formData.imageFiles, // 新上傳的檔案（陣列）
      existingImageUrls: formData.existingImageUrls, // 編輯模式保留的舊圖片
      deletedPhotoIds: deletedPhotoIds, // ← 改用獨立的 state
    }

    onSubmit(submitData)
  }

  return (
    <div className="bg-white/60 p-8 shadow-md border-l-[3px] border-primary">
      {/* 標題 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-primary mb-2">
          文章標題<span className="text-secondary ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          placeholder="輸入文章標題..."
          maxLength={100}
          disabled={isSubmitting}
          className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div
          className={`text-right text-xs mt-1 ${
            titleCount > 90 ? 'text-secondary' : 'text-gray-500'
          }`}
        >
          {titleCount} / 100
        </div>
      </div>

      {/* ✅ 修改：關聯內容（行程或景點） */}
      {(userItineraries.length > 0 || userPlaces.length > 0) && (
        <div className="mb-6">
          <div className="bg-primary/5 p-4 rounded-lg border-2 border-primary">
            {/* Checkbox：是否附加關聯內容 */}
            <div className="flex items-center gap-4 cursor-pointer select-none">
              <input
                type="checkbox"
                id="hasContent"
                checked={formData.hasContent}
                onChange={handleToggleContent}
                disabled={isSubmitting}
                className="w-5 h-5 cursor-pointer accent-point-500"
              />
              <label
                htmlFor="hasContent"
                className="text-sm font-semibold text-primary cursor-pointer"
              >
                <FaIcons.FaRoute className="inline mr-2" />
                附加關聯內容
              </label>
            </div>

            {formData.hasContent && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* ✅ 切換按鈕（行程 / 景點） */}
                <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300">
                  <button
                    type="button"
                    onClick={() => handleContentTypeChange('itinerary')}
                    disabled={isSubmitting || userItineraries.length === 0}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                      formData.contentType === 'itinerary'
                        ? 'bg-primary text-point-500'
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FaIcons.FaRoute className="inline mr-2" />
                    行程
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentTypeChange('place')}
                    disabled={isSubmitting || userPlaces.length === 0}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                      formData.contentType === 'place'
                        ? 'bg-primary text-point-500'
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FaIcons.FaLocationDot className="inline mr-2" />
                    景點
                  </button>
                </div>

                {/* ✅ 行程選擇區塊 */}
                {formData.contentType === 'itinerary' && (
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      選擇行程
                    </label>
                    <select
                      value={formData.selectedItineraryId || ''}
                      onChange={handleItinerarySelect}
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:shadow-md transition-all disabled:bg-gray-100"
                    >
                      <option value="">-- 請選擇行程 --</option>
                      {userItineraries.map((itinerary) => (
                        <option
                          key={itinerary.trip_id}
                          value={itinerary.trip_id}
                        >
                          {itinerary.trip_name}
                        </option>
                      ))}
                    </select>

                    {/* 行程卡片預覽 */}
                    {selectedItinerary && (
                      <div className="mt-4">
                        <ItineraryCard
                          itinerary={{
                            ...selectedItinerary,
                            user_id: currentUserId,
                          }}
                          currentUserId={currentUserId}
                          onClick={handleItineraryCardClick}
                          showCopyButton={true}
                          onCopy={handleItineraryCardClick}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ 新增：景點選擇區塊 */}
                {formData.contentType === 'place' && (
                  <div className="space-y-4">
                    {/* 搜尋和篩選 */}
                    <div className="space-y-3">
                      {/* 關鍵字搜尋 */}
                      <input
                        type="text"
                        value={placeSearchKeyword}
                        onChange={(e) => setPlaceSearchKeyword(e.target.value)}
                        placeholder="搜尋景點名稱..."
                        disabled={isSubmitting}
                        className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-all disabled:bg-gray-100"
                      />

                      {/* 分類和地區篩選 */}
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={placeCategory}
                          onChange={(e) => setPlaceCategory(e.target.value)}
                          disabled={isSubmitting}
                          className="py-2 px-4 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-all disabled:bg-gray-100"
                        >
                          <option value="">所有分類</option>
                          <option value="景點">景點</option>
                          <option value="餐廳">餐廳</option>
                          <option value="住宿">住宿</option>
                        </select>

                        <select
                          value={placeLocationId}
                          onChange={(e) => setPlaceLocationId(e.target.value)}
                          disabled={isSubmitting}
                          className="py-2 px-4 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-all disabled:bg-gray-100"
                        >
                          <option value="">所有地區</option>
                          {locations.map((loc) => (
                            <option
                              key={loc.location_id}
                              value={loc.location_id}
                            >
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 景點列表 */}
                    <div className="h-[200px] overflow-y-auto border border-gray-300 rounded-lg">
                      {filteredPlaces.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          找不到符合條件的景點
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredPlaces.map((place) => (
                            <label
                              key={place.place_id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name="selectedPlace"
                                value={place.place_id}
                                checked={
                                  formData.selectedPlaceId === place.place_id
                                }
                                onChange={() =>
                                  handlePlaceSelect(place.place_id)
                                }
                                disabled={isSubmitting}
                                className="w-4 h-4 accent-primary"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 truncate">
                                  {place.name}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <span>{place.category}</span>
                                  {place.location_name && (
                                    <>
                                      <span>•</span>
                                      <span>{place.location_name}</span>
                                    </>
                                  )}
                                  {place.rating && (
                                    <>
                                      <span>•</span>
                                      <span>⭐ {place.rating.toFixed(1)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 景點卡片預覽 */}
                    {selectedPlace && (
                      <div className="mt-4">
                        <ItineraryCard
                          place={selectedPlace}
                          onClick={handlePlaceCardClickInternal} // ✅ 修改
                          showCopyButton={false}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 分類 */}
      <CategorySelector
        value={formData.category}
        onChange={handleCategoryChange}
      />

      {/* 圖片上傳 */}
      <ImageUpload
        onImageSelect={handleImageSelect}
        onPhotoDelete={handlePhotoDelete} // ← 新增
        initialImages={formData.existingImageUrls}
        initialPhotosWithIds={initialData?.photos_with_ids || []} // ← 新增
        maxFiles={5}
      />

      {/* 標籤 */}
      <TagInput
        tags={formData.tags}
        onTagsChange={handleTagsChange}
        existingTags={existingTags}
        suggestedTags={suggestedTags}
      />

      {/* 內容 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-primary mb-2">
          文章內容<span className="text-secondary ml-1">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={handleContentChange}
          placeholder="分享您的故事..."
          maxLength={5000}
          disabled={isSubmitting}
          className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-base resize-vertical min-h-[200px] focus:outline-none focus:border-primary focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div
          className={`text-right text-xs mt-1 ${
            contentCount > 4500 ? 'text-secondary' : 'text-gray-500'
          }`}
        >
          {contentCount} / 5000
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-4 mt-8 pt-8 border-t-2 border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="py-3 px-6 border-2 border-gray-500 bg-transparent text-gray-500 rounded-full text-sm font-semibold hover:bg-gray-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaIcons.FaXmark className="inline mr-1" />
          取消
        </button>
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="py-3 px-8 border-2 border-primary-500 bg-primary text-primary-500 rounded-full text-sm font-semibold hover:bg-primary-500 hover:text-white hover:border-primary-light transition-all disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <FaIcons.FaSpinner className="animate-spin" />
              發布中...
            </>
          ) : (
            <>
              <FaIcons.FaPaperPlane />
              發布
            </>
          )}
        </button>
      </div>
    </div>
  )
}
