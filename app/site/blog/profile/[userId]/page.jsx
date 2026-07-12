'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  getUserStats,
  getUserPosts,
  getUserBookmarks,
  getUserLikedPosts,
  checkFollowStatus,
  toggleFollow,
  togglePostLike,
  toggleBookmark,
  deletePost,
  getAllTags,
  copyItinerary,
} from '@/lib/blogApi'
import { useAuth } from '@/contexts/AuthContext'
import { useNotify } from '@/contexts/NotificationContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import BackButton from '../../components/layout/BackButton'
import UserProfileWidget from '../../components/layout/UserProfileWidget'
import FilterSidebar from '../../components/layout/FilterSidebar'
import TabNavigation from '../../components/shared/TabNavigation'
import SortBar from '../../components/shared/SortBar'
import PostCard from '../../components/post/PostCard'
import FloatingPostButton from '../../components/layout/FloatingPostButton'
import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail' //  加入這行
import * as FaIcons from 'react-icons/fa6'

function ProfilePageContent() {
  const { user } = useAuth() // 使用 AuthContext
  const notify = useNotify()
  const confirmAction = useConfirm()

  const router = useRouter()
  const params = useParams()
  //const searchParams = useSearchParams()
  const userId = params.userId

  // 狀態管理
  const [profileUser, setProfileUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({ category: '', tags: [] })
  const [currentView, setCurrentView] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  //  加入這兩個狀態
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [showPlaceModal, setShowPlaceModal] = useState(false)

  const [filterConfig, setFilterConfig] = useState([
    {
      name: 'category',
      label: '文章分類',
      type: 'category',
      options: [
        { value: '', label: '全部', icon: FaIcons.FaLayerGroup },
        { value: 'life', label: '生活分享', icon: FaIcons.FaMugHot },
        { value: 'travel', label: '旅遊紀錄', icon: FaIcons.FaPlane },
        { value: 'food', label: '美食推薦', icon: FaIcons.FaUtensils },
        { value: 'photo', label: '攝影作品', icon: FaIcons.FaCamera },
      ],
    },
    {
      name: 'tags',
      label: '熱門標籤',
      type: 'tagButtons',
      options: [],
    },
  ])

  // Tab 配置 - 個人頁使用
  const profileTabs = [
    { value: 'posts', label: '文章', icon: FaIcons.FaNewspaper },
    { value: 'liked', label: '按讚', icon: FaIcons.FaHeart },
    { value: 'bookmarks', label: '收藏', icon: FaIcons.FaBookmark },
  ]

  // 排序選項
  const sortOptions = [
    { value: 'newest', label: '最新發布' },
    { value: 'likes', label: '最多按讚' },
    { value: 'comments', label: '最多留言' },
    { value: 'bookmarks', label: '最多收藏' },
  ]

  //  新增: 統一建立 API 參數的輔助函式
  const buildPostsParams = () => {
    const params = {
      page,
      limit: 10,
      sort: sortBy,
    }

    //  只在 category 有效時才加入
    if (
      filters.category &&
      filters.category !== '' &&
      filters.category !== 'all'
    ) {
      params.category = filters.category
    }

    //  只在有標籤時才加入
    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags
    }

    return params
  }

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. 取得 view 參數
        // const view = searchParams.get('view') || 'posts'
        // setCurrentView(view)

        // 2. 載入使用者資料
        const userStatsResult = await getUserStats(userId)
        setProfileUser(userStatsResult.data.user)
        setStats(userStatsResult.data.stats)

        // 3. 如果已登入且不是自己,檢查追蹤狀態
        if (user && user.id !== parseInt(userId)) {
          const followStatus = await checkFollowStatus(userId)
          setIsFollowing(followStatus.data.is_following)
        }

        // 4. 載入標籤
        const tagsResult = await getAllTags(10)
        setFilterConfig((prevConfig) =>
          prevConfig.map((field) =>
            field.name === 'tags'
              ? {
                  ...field,
                  type: 'tagButtons',
                  options: tagsResult.data.tags.map((tag) => ({
                    value: tag.tagname,
                    label: tag.tagname,
                  })),
                  onTagClick: (tagName) => {
                    //  加入 onTagClick
                    router.push(`/site/blog?q=${encodeURIComponent(tagName)}`)
                  },
                }
              : field
          )
        )
      } catch (error) {
        console.error('初始化失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [userId, user])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userStatsResult = await getUserStats(userId)
      setStats(userStatsResult.data.stats)
    }

    if (userId) {
      fetchCurrentUser()
    }
  }, [JSON.stringify(posts)])

  // 載入文章
  // 載入文章
  useEffect(() => {
    const loadPosts = async () => {
      if (!profileUser) return

      try {
        //  第一頁顯示 loading，後續頁顯示 loadingMore
        if (page === 1) {
          setLoading(true)
          setPosts([]) //  清空舊資料
        } else {
          setLoadingMore(true)
        }

        //  使用統一的參數建立函式
        const params = buildPostsParams()

        let result
        if (currentView === 'bookmarks') {
          result = await getUserBookmarks(userId, params)
        } else if (currentView === 'liked') {
          result = await getUserLikedPosts(userId, params)
        } else {
          result = await getUserPosts(userId, params)
        }

        //  第一頁直接設定，後續頁追加
        if (page === 1) {
          setPosts(result.data.posts)
        } else {
          setPosts((prev) => [...prev, ...result.data.posts])
        }

        setPagination(result.data.pagination)

        //  檢查是否還有更多資料
        setHasMore(
          result.data.pagination.page < result.data.pagination.totalPages
        )
      } catch (error) {
        console.error('載入文章失敗:', error)
        if (page === 1) {
          setPosts([])
        }
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    loadPosts()
  }, [profileUser, filters, page, currentView, userId, sortBy])

  //  新增：滾動載入更多
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight - 300) {
        setPage((prev) => prev + 1)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadingMore, hasMore, loading])

  // 處理篩選變更
  const handleFilterChange = (newFilters) => {
    setFilters({
      category: newFilters.category || '',
      tags: newFilters.tags || [],
    })
    setPage(1)
    setHasMore(true)
  }

  // 切換檢視模式 (Tab切換)
  const handleTabChange = (view) => {
    setCurrentView(view)
    setPage(1)
    setHasMore(true)
  }

  // 排序切換
  const handleSortChange = (sort) => {
    setSortBy(sort)
    setPage(1)
    setHasMore(true)
  }

  // 追蹤按鈕
  const handleFollowClick = async () => {
    if (!user) {
      notify('請先登入', 'error')
      return
    }

    try {
      const result = await toggleFollow(userId)
      setIsFollowing(result.data.is_following)

      // 重新載入統計資料
      const userStatsResult = await getUserStats(userId)
      setStats(userStatsResult.data.stats)
    } catch (error) {
      console.error('追蹤失敗:', error)
      notify('追蹤失敗，請稍後重試', 'error')
    }
  }

  // 處理搜尋
  const handleSearchSubmit = (keyword) => {
    router.push(`/site/blog?q=${encodeURIComponent(keyword)}`)
  }

  // 文章卡片事件處理
  const handlePostClick = (postId) => {
    router.push(`/site/blog/post/${postId}`)
  }

  //  修正: handleLike
  const handleLike = async (postId) => {
    if (!user?.id) {
      notify('請先登入', 'error')
      return
    }

    try {
      await togglePostLike(postId)

      setPage(1)
      setHasMore(true)

      //  使用統一的參數建立函式
      const params = buildPostsParams()

      let result
      if (currentView === 'bookmarks') {
        result = await getUserBookmarks(userId, params)
      } else if (currentView === 'liked') {
        result = await getUserLikedPosts(userId, params)
      } else {
        result = await getUserPosts(userId, params)
      }

      setPosts(result.data.posts)
    } catch (error) {
      console.error('按讚失敗:', error)
      notify('按讚失敗，請稍後重試', 'error')
    }
  }

  const handleComment = (postId) => {
    router.push(`/site/blog/post/${postId}#comments`)
  }

  //  修正: handleBookmark
  const handleBookmark = async (postId) => {
    if (!user?.id) {
      notify('請先登入', 'error')
      return
    }

    try {
      await toggleBookmark(postId)

      setPage(1)
      setHasMore(true)

      //  使用統一的參數建立函式
      const params = buildPostsParams()

      let result
      if (currentView === 'bookmarks') {
        result = await getUserBookmarks(userId, params)
      } else if (currentView === 'liked') {
        result = await getUserLikedPosts(userId, params)
      } else {
        result = await getUserPosts(userId, params)
      }

      setPosts(result.data.posts)
    } catch (error) {
      console.error('收藏失敗:', error)
      notify('收藏失敗，請稍後重試', 'error')
    }
  }

  //  修正: handleFollow
  const handleFollow = async (authorId) => {
    if (!user?.id) {
      notify('請先登入', 'error')
      return
    }

    try {
      await toggleFollow(authorId)

      setPage(1)
      setHasMore(true)

      //  使用統一的參數建立函式
      const params = buildPostsParams()

      let result
      if (currentView === 'bookmarks') {
        result = await getUserBookmarks(userId, params)
      } else if (currentView === 'liked') {
        result = await getUserLikedPosts(userId, params)
      } else {
        result = await getUserPosts(userId, params)
      }

      setPosts(result.data.posts)
    } catch (error) {
      console.error('追蹤失敗:', error)
      notify('追蹤失敗，請稍後重試', 'error')
    }
  }

  const handleShare = async (postId) => {
    const postUrl = `${window.location.origin}/site/blog/post/${postId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: '簡單社群',
          text: '分享這篇文章',
          url: postUrl,
        })
      } else {
        await navigator.clipboard.writeText(postUrl)
        notify('連結已複製到剪貼簿', 'success')
      }
    } catch (error) {
      console.error('分享失敗:', error)
    }
  }

  //  修正: handleMenuClick
  const handleMenuClick = async (postId, action) => {
    try {
      switch (action) {
        case 'edit':
          router.push(`/site/blog/post/create?edit=${postId}`)
          break
        case 'delete':
          if (await confirmAction('確定要刪除這篇文章嗎？')) {
            await deletePost(postId)

            setPage(1)
            setHasMore(true)

            //  使用統一的參數建立函式
            const params = buildPostsParams()

            let result
            if (currentView === 'bookmarks') {
              result = await getUserBookmarks(userId, params)
            } else if (currentView === 'liked') {
              result = await getUserLikedPosts(userId, params)
            } else {
              result = await getUserPosts(userId, params)
            }

            setPosts(result.data.posts)

            // 重新載入統計資料
            const userStatsResult = await getUserStats(userId)
            setStats(userStatsResult.data.stats)

            notify('文章已刪除', 'success')
          }
          break
        case 'copy':
          const postUrl = `${window.location.origin}/site/blog/post/${postId}`
          await navigator.clipboard.writeText(postUrl)
          notify('連結已複製到剪貼簿', 'success')
          break
        default:
          break
      }
    } catch (error) {
      console.error('操作失敗:', error)
      notify('操作失敗，請稍後重試', 'error')
    }
  }

  const handleAvatarClick = (authorId) => {
    router.push(`/site/blog/profile/${authorId}`)
  }

  const handleUsernameClick = (authorId) => {
    router.push(`/site/blog/profile/${authorId}`)
  }

  const handleItineraryClick = async (tripId) => {
    try {
      //  先找到這個行程的文章，確認是否為作者
      const targetPost = posts.find((p) => p.trip_id === tripId)

      if (!targetPost) {
        console.error(' 找不到關聯的文章')
        notify('找不到關聯的行程', 'error')
        return
      }

      const isOwnTrip = user?.id === targetPost.author?.user_id

      if (!isOwnTrip) {
        //  不是自己的行程，先複製

        // 呼叫 Blog 的複製行程 API
        const copyResult = await copyItinerary(tripId)

        if (copyResult.success) {
          const newTripId = copyResult.data.trip_id
          notify('已將行程複製到您的行程列表！', 'success')

          //  改用 sessionStorage 傳遞
          sessionStorage.setItem('openTripId', newTripId)
          router.push('/site/custom')
        } else {
          throw new Error(copyResult.message || '複製失敗')
        }
      } else {
        //  是自己的行程，直接跳轉編輯
        //  改用 sessionStorage 傳遞
        sessionStorage.setItem('openTripId', tripId)
        router.push('/site/custom')
      }
    } catch (error) {
      console.error(' 行程操作失敗:', error)
      notify(`操作失敗: ${error.message}`, 'error')
    }
  }

  //  加入這個函式 (在 handleItineraryClick 後面)
  const handlePlaceCardClick = (placeId) => {
    setSelectedPlaceId(placeId)
    setShowPlaceModal(true)
  }

  // 判斷是否顯示追蹤按鈕
  const shouldShowFollowButton = (post) => {
    const currentUserId = user?.id

    // 如果是「按讚」或「收藏」view
    if (currentView === 'liked' || currentView === 'bookmarks') {
      // 只有當文章不是自己的時候才顯示追蹤按鈕
      return post.author?.user_id !== currentUserId
    }

    // 其他情況都不顯示
    return false
  }

  if (loading && !profileUser) {
    return (
      <div className="max-w-6xl mx-auto my-8 px-6">
        <div className="text-center py-12">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto my-8 px-6">
        <BackButton />

        <div className="lg:hidden">
          <UserProfileWidget
            currentUser={user}
            profileUser={profileUser}
            stats={stats}
            isFollowing={isFollowing}
            currentView={currentView}
            onViewChange={handleTabChange}
            onFollowClick={handleFollowClick}
            onAvatarClick={handleAvatarClick}
            onUsernameClick={handleUsernameClick}
            onSearchSubmit={handleSearchSubmit}
            onItineraryClick={handleItineraryClick}
            onPlaceCardClick={handlePlaceCardClick} //  加入這行
          />
        </div>

        {/* 文章列表 */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <main className="flex flex-col gap-6">
            {/*  手機版 ProfileWidget */}

            {/* Profile Tabs - 個人頁模式 */}
            <TabNavigation
              tabs={profileTabs}
              activeTab={currentView}
              onTabChange={handleTabChange}
              variant="profile"
            />

            {/* Sort Bar */}
            <SortBar
              sortOptions={sortOptions}
              currentSort={sortBy}
              onSortChange={handleSortChange}
            />

            {/* 文章列表 */}
            {loading ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
                <p className="mt-4 text-gray-600">載入中...</p>
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {posts.map((post) => {
                    const showFollow = shouldShowFollowButton(post)

                    return (
                      <PostCard
                        key={post.post_id}
                        post={post}
                        currentUserId={user?.id}
                        showFollowButton={showFollow}
                        onPostClick={handlePostClick}
                        onLike={handleLike}
                        onComment={handleComment}
                        onBookmark={handleBookmark}
                        onFollow={handleFollow}
                        onShare={handleShare}
                        onMenuClick={handleMenuClick}
                        onAvatarClick={handleAvatarClick}
                        onUsernameClick={handleUsernameClick}
                        onItineraryClick={handleItineraryClick}
                        onPlaceCardClick={handlePlaceCardClick}
                      />
                    )
                  })}
                </div>

                {/*  新增：載入更多提示 */}
                {loadingMore && (
                  <div className="text-center py-6">
                    <FaIcons.FaSpinner className="inline-block animate-spin text-2xl text-primary mb-2" />
                    <p className="text-sm text-gray-600">載入更多...</p>
                  </div>
                )}

                {/*  新增：沒有更多資料提示 */}
                {!loading && !loadingMore && posts.length > 0 && !hasMore && (
                  <div className="text-center py-6 text-sm text-gray-500">
                    已顯示全部 {pagination?.total || posts.length} 篇文章
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <i className="fa-solid fa-inbox text-4xl text-gray-400"></i>
                <p className="mt-4 text-gray-600">
                  {currentView === 'bookmarks'
                    ? '還沒有收藏任何文章'
                    : currentView === 'liked'
                      ? '還沒有按讚任何文章'
                      : '還沒有發布任何文章'}
                </p>
              </div>
            )}
          </main>

          <aside className="hidden lg:flex flex-col gap-6">
            {/* UserProfileWidget */}
            <UserProfileWidget
              currentUser={user}
              profileUser={profileUser}
              stats={stats}
              isFollowing={isFollowing}
              currentView={currentView}
              onViewChange={handleTabChange}
              onFollowClick={handleFollowClick}
              onAvatarClick={handleAvatarClick}
              onUsernameClick={handleUsernameClick}
              onSearchSubmit={handleSearchSubmit}
            />

            {/* FilterSidebar - 只在文章 Tab 顯示 */}
            {currentView === 'posts' && (
              <FilterSidebar
                config={filterConfig}
                initialFilters={{ category: '', tags: [] }}
                onFilterChange={handleFilterChange}
              />
            )}
          </aside>
        </div>
      </div>

      <FloatingPostButton />

      {/*  加入景點 Modal */}
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
    </>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  )
}
