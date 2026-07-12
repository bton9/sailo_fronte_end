'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getPosts,
  getAllTags,
  getUserStats,
  search,
  togglePostLike,
  toggleBookmark,
  toggleFollow,
  deletePost,
  copyItinerary, //  新增
} from '@/lib/blogApi'
import { useAuth } from '@/contexts/AuthContext'
import * as FaIcons from 'react-icons/fa6'
import UserProfileWidget from './components/layout/UserProfileWidget'
import FilterSidebar from './components/layout/FilterSidebar'
import TabNavigation from './components/shared/TabNavigation'
import SortBar from './components/shared/SortBar'
import NotificationModal from './components/shared/NotificationModal' //
import PostCard from './components/post/PostCard'
import FloatingPostButton from './components/layout/FloatingPostButton'
import PlaceDetail from '@/app/site/custom/components/location/PlaceDetail' //  加入這行
import ConfirmModal from '@/components/confirmModal'

function BlogListPageContent() {
  const { user } = useAuth() // 使用 AuthContext

  const router = useRouter()
  const searchParams = useSearchParams()
  const searchKeyword = searchParams.get('q') || ''

  // 狀態管理
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [tagsLoading, setTagsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({ category: '', tags: [] })
  const [activeTab, setActiveTab] = useState('home')
  const [sortBy, setSortBy] = useState('newest')

  //  加入這兩行（在其他 useState 後面）
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [showPlaceModal, setShowPlaceModal] = useState(false)

  //  Modal 狀態
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    data: null,
    title: '',
    message: '',
    confirmText: '確定',
    confirmButtonStyle: 'bg-point-500 hover:bg-point-400',
  })

  //  通知 Modal 狀態
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
  })

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

  // Tab 配置 - 首頁使用
  const tabs = [
    { value: 'home', label: '首頁', icon: FaIcons.FaNewspaper },
    { value: 'following', label: '追蹤', icon: FaIcons.FaUserGroup },
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

    //  只在追蹤 tab 時才加入
    if (activeTab === 'following') {
      params.following = true
    }

    return params
  }

  // 獲取當前使用者資訊
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (user?.id) {
          const statsResult = await getUserStats(user.id)
          setStats(statsResult.data.stats)
        } else {
          setStats(null)
        }
      } catch (error) {
        console.error('獲取使用者統計失敗:', error)
        setStats(null)
      }
    }

    fetchUserStats()
  }, [user, posts])

  // 載入標籤
  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return

      try {
        setTagsLoading(true)
        const result = await getAllTags(10)

        setFilterConfig((prevConfig) =>
          prevConfig.map((field) =>
            field.name === 'tags'
              ? {
                  ...field,
                  type: 'tagButtons',
                  options: result.data.tags.map((tag) => ({
                    value: tag.tagname,
                    label: tag.tagname,
                  })),
                  onTagClick: (tagName) => {
                    //  使用 router.push 修改 URL 參數
                    router.push(`/site/blog?q=${encodeURIComponent(tagName)}`)
                  },
                }
              : field
          )
        )
      } catch (error) {
        console.error('載入標籤失敗:', error)
        setFilterConfig((prevConfig) =>
          prevConfig.map((field) =>
            field.name === 'tags'
              ? {
                  ...field,
                  options: [],
                }
              : field
          )
        )
      } finally {
        setTagsLoading(false)
      }
    }

    fetchTags()
  }, [user, router]) //  加入 router 依賴

  // 載入文章（包含搜尋）
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        //  第一頁顯示 loading，後續頁顯示 loadingMore
        if (page === 1) {
          setLoading(true)
          setPosts([]) //  清空舊資料
        } else {
          setLoadingMore(true)
        }

        //  如果有搜尋關鍵字，使用 search API
        if (searchKeyword) {
          const result = await search(searchKeyword, 'posts', {
            page,
            limit: 10,
          })

          if (page === 1) {
            setPosts(result.data.posts.data)
          } else {
            setPosts((prev) => [...prev, ...result.data.posts.data])
          }
          setPagination(result.data.posts.pagination)
          setHasMore(
            result.data.posts.pagination.page <
              result.data.posts.pagination.totalPages
          )
        } else {
          //  使用統一的參數建立函式
          const params = buildPostsParams()
          const result = await getPosts(params)

          if (page === 1) {
            setPosts(result.data.posts)
          } else {
            setPosts((prev) => [...prev, ...result.data.posts])
          }
          setPagination(result.data.pagination)
          setHasMore(
            result.data.pagination.page < result.data.pagination.totalPages
          )
        }
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

    fetchPosts()
  }, [filters, page, activeTab, sortBy, searchKeyword])

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

  // 標籤篩選事件監聽
  useEffect(() => {
    const handleTagFilter = (e) => {
      const { tag } = e.detail
      setFilters((prevFilters) => ({
        ...prevFilters,
        tags: prevFilters.tags.includes(tag)
          ? prevFilters.tags.filter((t) => t !== tag)
          : [...prevFilters.tags, tag],
      }))
      setPage(1)
    }

    window.addEventListener('filterByTag', handleTagFilter)
    return () => window.removeEventListener('filterByTag', handleTagFilter)
  }, [])

  // 處理搜尋
  const handleSearchSubmit = (keyword) => {
    router.push(`/site/blog?q=${encodeURIComponent(keyword)}`)
  }

  // 清除搜尋
  const handleClearSearch = () => {
    router.push('/site/blog')
    setPage(1) //  新增
    setHasMore(true) //  新增
  }

  // Tab 切換
  const handleTabChange = (tab) => {
    if (tab === 'following' && !user?.id) {
      setNotificationModal({
        show: true,
        type: 'info',
        title: '提示',
        message: '請先登入以查看追蹤的文章',
      })
      return
    }
    setActiveTab(tab)
    setPage(1)
    setHasMore(true)
  }

  // 排序切換
  const handleSortChange = (sort) => {
    setSortBy(sort)
    setPage(1)
    setHasMore(true)
  }

  // 文章卡片事件處理
  const handlePostClick = (postId) => {
    router.push(`/site/blog/post/${postId}`)
  }

  //  修正: handleLike
  const handleLike = async (postId) => {
    if (!user?.id) {
      setNotificationModal({
        show: true,
        type: 'info',
        title: '提示',
        message: '請先登入以使用此功能',
      })
      return
    }

    try {
      await togglePostLike(postId)

      setPage(1)
      setHasMore(true)

      //  使用統一的參數建立函式
      if (searchKeyword) {
        const result = await search(searchKeyword, 'posts', { page, limit: 10 })
        setPosts(result.data.posts.data)
      } else {
        const params = buildPostsParams()
        const postsResult = await getPosts(params)
        setPosts(postsResult.data.posts)
      }
    } catch (error) {
      console.error('按讚失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: '按讚失敗，請稍後重試',
      })
    }
  }

  const handleComment = (postId) => {
    router.push(`/site/blog/post/${postId}#comments`)
  }

  //  修正: handleBookmark
  const handleBookmark = async (postId) => {
    if (!user?.id) {
      setNotificationModal({
        show: true,
        type: 'info',
        title: '提示',
        message: '請先登入以使用此功能',
      })
      return
    }

    try {
      await toggleBookmark(postId)

      setPage(1)
      setHasMore(true)

      //  使用統一的參數建立函式
      if (searchKeyword) {
        const result = await search(searchKeyword, 'posts', { page, limit: 10 })
        setPosts(result.data.posts.data)
      } else {
        const params = buildPostsParams()
        const postsResult = await getPosts(params)
        setPosts(postsResult.data.posts)
      }
    } catch (error) {
      console.error('收藏失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: '收藏失敗，請稍後重試',
      })
    }
  }

  //  修改：handleShare
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
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(postUrl)
          setNotificationModal({
            show: true,
            type: 'success',
            title: '複製成功',
            message: '連結已複製到剪貼簿',
          })
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = postUrl
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
          setNotificationModal({
            show: true,
            type: 'success',
            title: '複製成功',
            message: '連結已複製到剪貼簿',
          })
        }
      }
    } catch (error) {
      console.error('分享失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: '分享失敗，請稍後重試',
      })
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
          setConfirmModal({
            show: true,
            type: 'delete',
            data: postId,
            title: '確認刪除文章',
            message: '刪除後將無法復原，確定要刪除這篇文章嗎？',
            confirmText: '確認刪除',
            confirmButtonStyle: 'bg-red-600 hover:bg-red-700',
          })
          break

        case 'copy':
          const postUrl = `${window.location.origin}/site/blog/post/${postId}`
          await navigator.clipboard.writeText(postUrl)
          setNotificationModal({
            show: true,
            type: 'success',
            title: '複製成功',
            message: '連結已複製到剪貼簿',
          })
          break

        default:
          break
      }
    } catch (error) {
      console.error('操作失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: '操作失敗，請稍後重試',
      })
    }
  }

  const handleAvatarClick = (userId) => {
    router.push(`/site/blog/profile/${userId}`)
  }

  const handleUsernameClick = (userId) => {
    router.push(`/site/blog/profile/${userId}`)
  }

  //  修正: handleFollow
  const handleFollow = async (userId) => {
    if (!user?.id) {
      setNotificationModal({
        show: true,
        type: 'info',
        title: '提示',
        message: '請先登入以使用此功能',
      })
      return
    }

    try {
      await toggleFollow(userId)

      setPage(1)
      setHasMore(true)

      //  使用統一的參數建立函式
      if (searchKeyword) {
        const result = await search(searchKeyword, 'posts', { page, limit: 10 })
        setPosts(result.data.posts.data)
      } else {
        const params = buildPostsParams()
        const postsResult = await getPosts(params)
        setPosts(postsResult.data.posts)
      }
    } catch (error) {
      console.error('追蹤失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: '追蹤失敗，請稍後重試',
      })
    }
  }

  //  修改：handleItineraryClick
  const handleItineraryClick = async (tripId) => {
    try {
      //  先找到這個行程的文章，確認是否為作者
      const targetPost = posts.find((p) => p.trip_id === tripId)

      if (!targetPost) {
        console.error(' 找不到關聯的文章')
        setNotificationModal({
          show: true,
          type: 'error',
          title: '操作失敗',
          message: '找不到關聯的行程',
        })
        return
      }

      const isOwnTrip = user?.id === targetPost.author?.user_id

      if (!isOwnTrip) {
        setConfirmModal({
          show: true,
          type: 'copyItinerary',
          data: tripId,
          title: '複製行程',
          message: '要將此行程複製到您的行程列表嗎？\n複製後您可以自由編輯。',
          confirmText: '複製行程',
          confirmButtonStyle: 'bg-point-500 hover:bg-point-400',
        })
      } else {
        //  是自己的行程，直接跳轉編輯
        //  改用 sessionStorage 傳遞
        sessionStorage.setItem('openTripId', tripId)
        router.push('/site/custom')
      }
    } catch (error) {
      console.error(' 行程操作失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: error.message,
      })
    }
  }

  //  修改：handleConfirmModalAction
  const handleConfirmModalAction = async () => {
    const { type, data } = confirmModal

    setConfirmModal((prev) => ({ ...prev, show: false }))

    try {
      switch (type) {
        case 'delete':
          await deletePost(data)
          setPage(1)
          setHasMore(true)

          if (searchKeyword) {
            const result = await search(searchKeyword, 'posts', {
              page,
              limit: 10,
            })
            setPosts(result.data.posts.data)
          } else {
            const params = buildPostsParams()
            const postsResult = await getPosts(params)
            setPosts(postsResult.data.posts)
          }

          //  顯示刪除成功 Modal
          setNotificationModal({
            show: true,
            type: 'success',
            title: '刪除成功',
            message: '',
          })
          break

        case 'copyItinerary':

          const copyResult = await copyItinerary(data)

          if (copyResult.success) {
            const newTripId = copyResult.data.trip_id

            //  顯示成功 Modal（特殊樣式）
            setConfirmModal({
              show: true,
              type: 'copySuccess',
              data: newTripId,
              title: '',
              message: '',
              confirmText: '',
              confirmButtonStyle: '',
            })
          } else {
            throw new Error(copyResult.message || '複製失敗')
          }
          break

        case 'copySuccess':
          //  複製成功後點確認跳轉
          sessionStorage.setItem('openTripId', data)
          router.push('/site/custom')
          break

        default:
          break
      }
    } catch (error) {
      console.error('操作失敗:', error)
      setNotificationModal({
        show: true,
        type: 'error',
        title: '操作失敗',
        message: error.message || '操作失敗，請稍後重試',
      })
    }
  }

  const handlePlaceCardClick = (placeId) => {
    setSelectedPlaceId(placeId)
    setShowPlaceModal(true)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto my-8 px-6 grid lg:grid-cols-[1fr_300px] gap-8">
        {/* 主要內容 */}
        <main className="flex flex-col gap-6">
          {/*  手機版 ProfileWidget */}
          <div className="lg:hidden">
            <UserProfileWidget
              currentUser={user}
              profileUser={null}
              stats={stats}
              currentView="posts"
              onAvatarClick={handleAvatarClick}
              onUsernameClick={handleUsernameClick}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
          {/*  搜尋結果提示 */}
          {searchKeyword && (
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaIcons.FaMagnifyingGlass className="text-primary" />
                <span className="text-gray-700">
                  搜尋結果：
                  <strong className="text-primary">「{searchKeyword}」</strong>
                  {pagination && ` (共 ${pagination.total} 篇文章)`}
                </span>
              </div>
              <button
                onClick={handleClearSearch}
                className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
              >
                <FaIcons.FaXmark />
                清除搜尋
              </button>
            </div>
          )}

          {/* Feed Tabs - 首頁模式 */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="feed"
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
                  const shouldShowFollow =
                    !!post.author?.user_id && user?.id !== post.author.user_id

                  return (
                    <PostCard
                      key={`${post.post_id}-${post.user_interaction?.is_following_author}`}
                      post={post}
                      currentUserId={user?.id}
                      showFollowButton={shouldShowFollow}
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
                      onPlaceCardClick={handlePlaceCardClick} //  新增這行
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
                {searchKeyword
                  ? `找不到與「${searchKeyword}」相關的文章`
                  : '沒有符合條件的文章'}
              </p>
            </div>
          )}
        </main>

        {/* 側邊欄 */}
        <aside className="hidden lg:flex flex-col gap-6">
          {/* UserProfileWidget */}
          <UserProfileWidget
            currentUser={user}
            profileUser={null}
            stats={stats}
            currentView="posts"
            onAvatarClick={handleAvatarClick}
            onUsernameClick={handleUsernameClick}
            onSearchSubmit={handleSearchSubmit}
          />

          {/* FilterSidebar */}
          <FilterSidebar
            config={filterConfig}
            initialFilters={{ category: '', tags: [] }}
            onFilterChange={handleFilterChange}
            isLoading={tagsLoading}
          />
        </aside>
      </div>

      {/* 浮動發文按鈕 */}
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

      {/*  確認 Modal */}
      {confirmModal.show && confirmModal.type !== 'copySuccess' && (
        <ConfirmModal
          isOpen={confirmModal.show}
          onClose={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
          onConfirm={handleConfirmModalAction}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmButtonStyle={confirmModal.confirmButtonStyle}
        />
      )}

      {/*  複製行程成功 Modal */}
      {confirmModal.type === 'copySuccess' && confirmModal.show && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sessionStorage.setItem('openTripId', confirmModal.data)
              router.push('/site/custom')
            }
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative bg-white shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              新增成功
            </h3>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  sessionStorage.setItem('openTripId', confirmModal.data)
                  router.push('/site/custom')
                }}
                className="px-8 py-2.5 bg-point-500 hover:bg-point-400 text-white font-medium transition-colors duration-200 min-w-[120px]"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  通知 Modal */}
      <NotificationModal
        isOpen={notificationModal.show}
        onClose={() =>
          setNotificationModal((prev) => ({ ...prev, show: false }))
        }
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
      />
    </>
  )
}

export default function BlogListPage() {
  return (
    <Suspense fallback={null}>
      <BlogListPageContent />
    </Suspense>
  )
}
