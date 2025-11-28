'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  getPostById,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  togglePostLike,
  toggleCommentLike,
  toggleBookmark,
  toggleFollow,
  deletePost,
  copyItinerary, // ✅ 新增
} from '@/lib/blogApi'
import { useAuth } from '@/contexts/AuthContext'
import BackButton from '../../components/layout/BackButton'
import PostDetail from '../../components/post/PostDetail'
import CommentsSection from '../../components/comment/CommentsSection'
import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail' // ✅ 加入這行

export default function PostDetailPage() {
  const { user } = useAuth() // 🔐 使用 AuthContext
  const router = useRouter()
  const params = useParams()
  const postId = params.postId

  // 狀態管理
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [totalComments, setTotalComments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)

  // ✅ 加入這兩個狀態
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [showPlaceModal, setShowPlaceModal] = useState(false)

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. 載入文章
        const postResult = await getPostById(postId, { incrementView: true })
        setPost(postResult.data.post)

        // 2. 載入留言
        const commentsResult = await getComments(postId, { page: 1, limit: 50 })
        setComments(commentsResult.data.comments)
        setTotalComments(commentsResult.data.pagination.total)
      } catch (error) {
        console.error('載入失敗:', error)
        alert('載入文章失敗')
        router.push('/site/blog')
      } finally {
        setLoading(false)
        setCommentsLoading(false)
      }
    }

    initialize()
  }, [postId, router])

  // 重新載入文章
  const reloadPost = async () => {
    try {
      const postResult = await getPostById(postId, { incrementView: false }) // ✅ 不增加
      setPost(postResult.data.post)
    } catch (error) {
      console.error('重新載入文章失敗:', error)
    }
  }

  // 重新載入留言
  const reloadComments = async () => {
    try {
      setCommentsLoading(true)
      const commentsResult = await getComments(postId, { page: 1, limit: 50 })
      setComments(commentsResult.data.comments)
      setTotalComments(commentsResult.data.pagination.total)
    } catch (error) {
      console.error('重新載入留言失敗:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // 文章互動處理
  const handleLike = async () => {
    if (!user?.id) {
      alert('請先登入')
      return
    }

    try {
      await togglePostLike(postId)
      await reloadPost()
    } catch (error) {
      console.error('按讚失敗:', error)
      alert('按讚失敗，請稍後重試')
    }
  }

  const handleComment = () => {
    // 滾動到留言區
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBookmark = async () => {
    if (!user?.id) {
      alert('請先登入')
      return
    }

    try {
      await toggleBookmark(postId)
      await reloadPost()
    } catch (error) {
      console.error('收藏失敗:', error)
      alert('收藏失敗，請稍後重試')
    }
  }

  const handleFollow = async (userId) => {
    if (!user?.id) {
      alert('請先登入')
      return
    }

    try {
      await toggleFollow(userId)
      await reloadPost()
    } catch (error) {
      console.error('追蹤失敗:', error)
      alert('追蹤失敗，請稍後重試')
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/site/blog/post/${postId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: '分享這篇文章',
          url: postUrl,
        })
      } else {
        await navigator.clipboard.writeText(postUrl)
        alert('連結已複製到剪貼簿')
      }
    } catch (error) {
      console.error('分享失敗:', error)
    }
  }

  const handleMenuClick = async (postId, action) => {
    try {
      switch (action) {
        case 'edit':
          router.push(`/site/blog/post/create?edit=${postId}`)
          break

        case 'delete':
          if (window.confirm('確定要刪除這篇文章嗎？')) {
            await deletePost(postId)
            alert('文章已刪除')
            router.push('/site/blog')
          }
          break

        case 'copy':
          const postUrl = `${window.location.origin}/site/blog/post/${postId}`
          await navigator.clipboard.writeText(postUrl)
          alert('連結已複製到剪貼簿')
          break

        default:
          break
      }
    } catch (error) {
      console.error('操作失敗:', error)
      alert('操作失敗，請稍後重試')
    }
  }

  const handleAvatarClick = (userId) => {
    router.push(`/site/blog/profile/${userId}`)
  }

  const handleUsernameClick = (userId) => {
    router.push(`/site/blog/profile/${userId}`)
  }

  const handleItineraryClick = async (tripId) => {
    try {
      // ✅ 在詳情頁，直接使用當前 post
      if (!post) {
        console.error(' 找不到文章資料')
        alert('找不到關聯的行程')
        return
      }

      const isOwnTrip = user?.id === post.author?.user_id

      if (!isOwnTrip) {
        // ✅ 不是自己的行程，先複製
        console.log('🔄 複製別人的行程:', tripId)

        const copyResult = await copyItinerary(tripId)

        if (copyResult.success) {
          const newTripId = copyResult.data.trip_id
          console.log('✅ 行程複製成功，新行程 ID:', newTripId)
          alert(`已將行程複製到您的行程列表！`)

          // ✅ 改用 sessionStorage 傳遞
          sessionStorage.setItem('openTripId', newTripId)
          router.push('/site/custom')
        } else {
          throw new Error(copyResult.message || '複製失敗')
        }
      } else {
        // ✅ 是自己的行程，直接跳轉編輯
        console.log('✏️ 編輯自己的行程:', tripId)

        // ✅ 改用 sessionStorage 傳遞
        sessionStorage.setItem('openTripId', tripId)
        router.push('/site/custom')
      }
    } catch (error) {
      console.error(' 行程操作失敗:', error)
      alert(`操作失敗: ${error.message}`)
    }
  }

  const handleTagClick = (tag) => {
    router.push(`/site/blog?tags=${encodeURIComponent(tag)}`)
  }

  // ✅ 加入這個函式
  const handlePlaceCardClick = (placeId) => {
    console.log('🎯 開啟景點 Modal:', placeId)
    setSelectedPlaceId(placeId)
    setShowPlaceModal(true)
  }

  // 留言互動處理
  const handleCommentSubmit = async (content) => {
    try {
      await createComment(postId, content)
      await reloadComments()
      await reloadPost() // 更新留言數
    } catch (error) {
      console.error('發布留言失敗:', error)
      throw error
    }
  }

  const handleCommentLike = async (commentId) => {
    if (!user?.id) {
      alert('請先登入')
      return
    }

    try {
      await toggleCommentLike(commentId)
      await reloadComments()
    } catch (error) {
      console.error('按讚留言失敗:', error)
      alert('按讚失敗，請稍後重試')
    }
  }

  const handleCommentEdit = async (commentId, content) => {
    try {
      await updateComment(commentId, content)
      await reloadComments()
    } catch (error) {
      console.error('編輯留言失敗:', error)
      alert('編輯失敗，請稍後重試')
      throw error
    }
  }

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      await reloadComments()
      await reloadPost() // 更新留言數
    } catch (error) {
      console.error('刪除留言失敗:', error)
      alert('刪除失敗，請稍後重試')
      throw error
    }
  }

  // 判斷是否顯示追蹤按鈕
  const shouldShowFollowButton =
    post && post.author?.user_id && user?.id !== post.author.user_id

  if (loading || !post) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-6">
        <div className="text-center py-12">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-6">
      <BackButton />

      {/* 文章詳細內容 */}
      <PostDetail
        post={post}
        currentUserId={user?.id}
        showFollowButton={shouldShowFollowButton}
        onLike={handleLike}
        onComment={handleComment}
        onBookmark={handleBookmark}
        onFollow={handleFollow}
        onShare={handleShare}
        onMenuClick={handleMenuClick}
        onAvatarClick={handleAvatarClick}
        onUsernameClick={handleUsernameClick}
        onItineraryClick={handleItineraryClick}
        onTagClick={handleTagClick}
        onPlaceCardClick={handlePlaceCardClick} // ✅ 加入這行
      />

      {/* 留言區 */}
      <CommentsSection
        comments={comments}
        totalComments={totalComments}
        currentUser={user}
        isLoading={commentsLoading}
        onCommentSubmit={handleCommentSubmit}
        onCommentLike={handleCommentLike}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        onAvatarClick={handleAvatarClick}
        onUsernameClick={handleUsernameClick}
      />
      {/* ✅ 加入景點 Modal */}
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
    </div>
  )
}
