'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  createPost,
  updatePost,
  getPostById,
  uploadPhoto,
  addPhotoToPost,
  getPostPhotos, // ← 新增
  deletePhoto, // ← 新增
  getAllTags,
  getUserItineraries,
  getPlaces, // ✅ 新增
} from '@/lib/blogApi'
import { useAuth } from '@/contexts/AuthContext'
import BackButton from '../../components/layout/BackButton'
import PostForm from '../../components/post/PostForm'
import * as FaIcons from 'react-icons/fa6'
import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail' // ✅ 新增

export default function CreatePostPage() {
  const { user } = useAuth() // 🔐 使用 AuthContext
  const router = useRouter()
  const searchParams = useSearchParams()
  const editPostId = searchParams.get('edit') // ✅ 取得編輯的文章 ID

  const [existingTags, setExistingTags] = useState([])
  const [suggestedTags, setSuggestedTags] = useState([])
  const [userItineraries, setUserItineraries] = useState([])
  const [userPlaces, setUserPlaces] = useState([]) // ✅ 新增：景點列表
  const [locations, setLocations] = useState([]) // ✅ 新增：地區列表
  const [isSubmitting, setIsSubmitting] = useState(false)
  // ✅ 新增：景點 Modal 相關狀態
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialData, setInitialData] = useState(null) // ✅ 編輯模式的初始資料
  const [uploadProgress, setUploadProgress] = useState(null) // 上傳進度
  // ✅ 新增：成功提示 Modal 狀態
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: '',
    postId: null,
  })

  // ✅ 判斷是否為編輯模式
  const isEditMode = !!editPostId

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        // ✅ 調試日誌
        console.log('🔍 CreatePost - user 物件:', user)
        console.log('🔍 CreatePost - user.id:', user?.id)
        console.log(
          '🔍 CreatePost - user keys:',
          user ? Object.keys(user) : 'user is null'
        )

        // 1. 檢查登入狀態 (使用 AuthContext)
        if (!user) {
          alert('請先登入')
          router.push('/login?redirect=/site/blog/post/create')
          return
        }

        // ✅ 檢查 id 是否存在
        if (!user.id) {
          console.error('❌ user 物件沒有 id 屬性:', user)
          alert('使用者資料異常，請重新登入')
          router.push('/login')
          return
        }

        // ✅ 2. 如果是編輯模式,載入文章資料
        if (isEditMode) {
          try {
            const postResult = await getPostById(editPostId)
            const post = postResult.data.post

            // ✅ 檢查是否為文章作者
            if (post.author?.user_id !== user.id) {
              alert('您沒有權限編輯此文章')
              router.push('/site/blog')
              return
            }

            const photosResult = await getPostPhotos(post.post_id)
            const photosWithIds = photosResult.data.photos || []

            // ✅ 設定初始資料
            setInitialData({
              title: post.title,
              content: post.content,
              category: post.category,
              trip_id: post.itinerary?.trip_id || null,
              // ✅ 新增這行
              place_id: post.place?.place_id || null,
              tags: post.tags
                ? post.tags
                    .map((tag) =>
                      typeof tag === 'string'
                        ? tag
                        : tag.tagname || tag.name || ''
                    )
                    .filter(Boolean)
                : [], // ✅ 統一轉換成字串陣列
              image_urls: post.photos || [], // 用於顯示
              photos_with_ids: photosWithIds, // 完整的圖片資料（含 photo_id）
            })
          } catch (error) {
            console.error('載入文章失敗:', error)
            alert('載入文章失敗')
            router.push('/site/blog')
            return
          }
        }

        // 3. 載入標籤列表
        const tagsResult = await getAllTags(50)
        setExistingTags(tagsResult.data.tags || [])

        // ✅ 4. 設定推薦標籤（取前 6 個最熱門的）
        const topTags = (tagsResult.data.tags || [])
          .slice(0, 6)
          .map((tag) => tag.tagname)
        setSuggestedTags(topTags)

        // 4. 載入使用者的行程列表
        try {
          const itinerariesResult = await getUserItineraries(user.id)
          setUserItineraries(itinerariesResult.data.itineraries || [])
        } catch (error) {
          console.log('載入行程失敗（可能使用者沒有行程）:', error)
          setUserItineraries([])
        }
        // ✅ 5. 載入景點列表
        try {
          const placesResult = await getPlaces()
          setUserPlaces(placesResult.data || [])
        } catch (error) {
          console.log('載入景點失敗:', error)
          setUserPlaces([])
        }

        // ✅ 6. 載入地區列表
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          const response = await fetch(`${API_URL}/api/locations`)
          const data = await response.json()
          setLocations(data.success ? data.data : [])
        } catch (error) {
          console.log('載入地區失敗:', error)
          setLocations([])
        }
      } catch (error) {
        console.error('初始化失敗:', error)
        alert('載入失敗，請重試')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [router, isEditMode, editPostId, user])

  // 處理取消
  const handleCancel = () => {
    if (window.confirm('確定要取消？未儲存的內容將會遺失。')) {
      router.back()
    }
  }

  // ✅ 新增：處理景點卡片點擊
  const handlePlaceCardClick = (placeId) => {
    console.log('🎯 開啟景點 Modal:', placeId)
    setSelectedPlaceId(placeId)
    setShowPlaceModal(true)
  }

  // 處理提交
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)

      console.log('📋 CreatePostPage: 收到表單資料')
      console.log('📋 formData:', formData)
      console.log('📋 formData.deletedPhotoIds:', formData.deletedPhotoIds)

      let allImageUrls = [...(formData.existingImageUrls || [])]

      // 如果有上傳新圖片，批次上傳
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        try {
          setUploadProgress({ current: 0, total: formData.imageFiles.length })

          for (let i = 0; i < formData.imageFiles.length; i++) {
            const file = formData.imageFiles[i]
            const uploadResult = await uploadPhoto(file)
            allImageUrls.push(uploadResult.data.url)

            setUploadProgress({
              current: i + 1,
              total: formData.imageFiles.length,
            })
          }

          setUploadProgress(null)
        } catch (error) {
          console.error('圖片上傳失敗:', error)
          alert('圖片上傳失敗，但仍會繼續發布文章')
          setUploadProgress(null)
        }
      }

      // 準備文章資料（不包含 image_url）
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        trip_id: formData.trip_id,
        place_id: formData.place_id, // ✅ 新增
        tags: formData.tags,
      }

      // 根據模式呼叫不同的 API
      if (isEditMode) {
        await updatePost(editPostId, postData)

        console.log('🗑️ 編輯模式：準備刪除圖片')
        console.log('🗑️ formData.deletedPhotoIds:', formData.deletedPhotoIds)

        // ✅ 1. 刪除被移除的圖片（直接使用 formData）
        if (formData.deletedPhotoIds && formData.deletedPhotoIds.length > 0) {
          for (const photoId of formData.deletedPhotoIds) {
            console.log('🗑️ 正在刪除圖片:', photoId)
            try {
              const result = await deletePhoto(photoId)
              console.log('✅ 刪除成功:', result)
            } catch (error) {
              console.error(`❌ 刪除圖片 ${photoId} 失敗:`, error)
            }
          }
        } else {
          console.log('⚠️ 沒有要刪除的圖片')
        }

        // ✅ 2. 新增新上傳的圖片
        const newImageUrls = allImageUrls.filter(
          (url) => !formData.existingImageUrls.includes(url)
        )
        if (newImageUrls.length > 0) {
          for (const url of newImageUrls) {
            await addPhotoToPost(editPostId, url)
          }
        }

        // ✅ 改為顯示 ConfirmModal
        setSuccessModal({
          isOpen: true,
          message: '文章更新成功！',
          postId: editPostId,
        })
      } else {
        // 新增模式：建立文章
        const result = await createPost(postData)
        const newPostId = result.data.post_id

        // 如果有圖片，逐一關聯到文章
        if (allImageUrls.length > 0) {
          for (const url of allImageUrls) {
            await addPhotoToPost(newPostId, url)
          }
        }

        // ✅ 改為顯示 ConfirmModal
        setSuccessModal({
          isOpen: true,
          message: '文章發布成功！',
          postId: newPostId,
        })
      }
    } catch (error) {
      console.error(isEditMode ? '更新文章失敗:' : '發布文章失敗:', error)
      alert(
        error.message ||
          (isEditMode ? '更新失敗，請稍後重試' : '發布失敗，請稍後重試')
      )
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-6">
        <div className="text-center py-12">
          <FaIcons.FaSpinner className="animate-spin text-4xl text-primary mx-auto" />
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto my-8 px-6">
        <BackButton />

        {/* ✅ 頁面標題:根據模式顯示不同內容 */}
        <div className="bg-white/60 p-8 shadow-md border-l-[3px] border-primary mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            <FaIcons.FaPenToSquare className="inline mr-2" />
            {isEditMode ? '編輯文章' : '新增文章'}
          </h1>
          <p className="text-gray-600 text-base">
            {isEditMode
              ? '修改您的文章內容'
              : '分享您的旅遊經驗、美食推薦或生活點滴'}
          </p>
        </div>

        {/* ✅ 文章表單:編輯模式時傳入 initialData */}
        <PostForm
          initialData={initialData}
          existingTags={existingTags}
          suggestedTags={suggestedTags}
          userItineraries={userItineraries}
          userPlaces={userPlaces} // ✅ 新增
          locations={locations} // ✅ 新增
          currentUserId={user?.id} // ✅ 新增
          onPlaceCardClick={handlePlaceCardClick} // ✅ 新增
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* ✅ 新增：景點 Modal */}
      {showPlaceModal && selectedPlaceId && (
        <PlaceDetail
          placeId={selectedPlaceId}
          isOpen={showPlaceModal}
          onClose={() => {
            setShowPlaceModal(false)
            setSelectedPlaceId(null)
          }}
        />
      )}

      {/* ✅ 上傳進度 Modal */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              {/* 旋轉動畫 */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <FaIcons.FaCloudArrowUp className="text-6xl text-primary absolute inset-0 m-auto animate-pulse" />
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>

              {/* 文字 */}
              <p className="text-2xl font-bold text-primary mb-2">
                上傳圖片中...
              </p>
              <p className="text-gray-600 mb-4">
                {uploadProgress.current} / {uploadProgress.total} 張
              </p>

              {/* 進度條 */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary-light h-3 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                ></div>
              </div>

              {/* 百分比 */}
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(
                  (uploadProgress.current / uploadProgress.total) * 100
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 成功提示 Modal（自定義，只有確認按鈕） */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* 半透明背景遮罩 */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* 確認對話框 */}
          <div className="relative bg-white shadow-2xl max-w-md w-full p-6">
            {/* 標題 */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">成功</h3>

            {/* 訊息內容 */}
            <p className="text-gray-600 mb-6 whitespace-pre-line">
              {successModal.message}
            </p>

            {/* 按鈕群組 */}
            <div className="flex gap-3 justify-end">
              {/* 確定按鈕 */}
              <button
                onClick={() => {
                  sessionStorage.setItem('fromPostCreate', 'true')
                  router.push(`/site/blog/post/${successModal.postId}`)
                }}
                className="px-5 py-2.5 text-white font-medium transition-colors duration-200 bg-primary-500 hover:bg-primary-300"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
