'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams , useSearchParams} from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserStats,
  getFollowers,
  getFollowing,
  toggleFollow,
  checkFollowStatus,
} from '@/lib/blogApi'
import BackButton from '../../../components/layout/BackButton'
import UserProfileWidget from '../../../components/layout/UserProfileWidget'
import TabNavigation from '../../../components/shared/TabNavigation'
import FollowSearchBar from '../../../components/follow/FollowSearchBar'
import FollowList from '../../../components/follow/FollowList'
import FloatingPostButton from '../../../components/layout/FloatingPostButton'
import * as FaIcons from 'react-icons/fa6'

export default function FollowingPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params.userId
  const { user } = useAuth()

  // 狀態管理
  const [profileUser, setProfileUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)  // ✅ 新增
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [hasMore, setHasMore] = useState(true)  // ✅ 新增
  const [activeTab, setActiveTab] = useState('following') // 'followers' 或 'following'
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)

  // ✅ 從 sessionStorage 讀取 tab（頁面初次載入）
  useEffect(() => {
    const savedTab = sessionStorage.getItem('followingPageTab')
    if (savedTab === 'followers' || savedTab === 'following') {
      setActiveTab(savedTab)
      sessionStorage.removeItem('followingPageTab')
    }
  }, [])

  // ✅ 新增：監聽自訂事件（在同一頁面切換 Tab）
  useEffect(() => {
    const handleSwitchTab = (event) => {
      const { tab } = event.detail
      if (tab === 'followers' || tab === 'following') {
        setActiveTab(tab)
        setPage(1)
        setHasMore(true)
        setSearchKeyword('')
      }
    }

    window.addEventListener('switchFollowTab', handleSwitchTab)
    return () => window.removeEventListener('switchFollowTab', handleSwitchTab)
  }, [])

  // Tab 配置
  const followTabs = [
    {
      value: 'followers',
      label: '追蹤者',
      icon: FaIcons.FaUsers,
      count: stats?.followers_count || 0,
    },
    {
      value: 'following',
      label: '追蹤中',
      icon: FaIcons.FaUserCheck,
      count: stats?.following_count || 0,
    },
  ]

  // 初始化:載入個人頁使用者資料
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. 載入個人頁使用者資料
        const userStatsResult = await getUserStats(userId)
        setProfileUser(userStatsResult.data.user)
        setStats(userStatsResult.data.stats)

        // 2. 如果已登入且不是自己,檢查追蹤狀態
        if (user && user.id !== parseInt(userId)) {
          const followStatus = await checkFollowStatus(userId)
          setIsFollowing(followStatus.data.is_following)
        }
      } catch (error) {
        console.error('初始化失敗:', error)
      }
    }

    initialize()
  }, [userId, user, JSON.stringify(users)])

  // 載入追蹤列表（根據 activeTab、page、searchKeyword）
  useEffect(() => {
  const fetchUsers = async () => {
    try {
      // ✅ 第一頁顯示 loading，後續頁顯示 loadingMore
      if (page === 1) {
        setLoading(true)
        setUsers([])  // ✅ 清空舊資料
      } else {
        setLoadingMore(true)
      }

      const params = {
        page,
        limit: 10,
      }

      if (searchKeyword) {
        params.search = searchKeyword
      }

      // 根據 activeTab 決定呼叫哪個 API
      let result
      if (activeTab === 'followers') {
        result = await getFollowers(userId, params)
        
        // ✅ 第一頁直接設定，後續頁追加
        if (page === 1) {
          setUsers(result.data.followers)
        } else {
          setUsers(prev => [...prev, ...result.data.followers])
        }
      } else {
        result = await getFollowing(userId, params)
        
        if (page === 1) {
          setUsers(result.data.following)
        } else {
          setUsers(prev => [...prev, ...result.data.following])
        }
      }

      setPagination(result.data.pagination)
      
      // ✅ 檢查是否還有更多資料
      setHasMore(result.data.pagination.page < result.data.pagination.totalPages)
      
    } catch (error) {
      console.error('載入追蹤列表失敗:', error)
      if (page === 1) {
        setUsers([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  fetchUsers()
}, [userId, activeTab, page, searchKeyword])

// ✅ 新增：滾動載入更多
useEffect(() => {
  const handleScroll = () => {
    // 如果正在載入、沒有更多資料、或在載入第一頁，就不觸發
    if (loadingMore || !hasMore || loading) return

    // 檢查是否滾動到底部（距離底部 300px 時觸發）
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    if (scrollTop + windowHeight >= documentHeight - 300) {
      setPage(prev => prev + 1)
    }
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [loadingMore, hasMore, loading])

  // 處理 Tab 切換
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
    setSearchKeyword('')
    setHasMore(true)  // ✅ 新增
  }

  // 處理搜尋
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword)
    setPage(1)
    setHasMore(true)  // ✅ 新增
  }

  // 處理清除搜尋
  const handleClearSearch = () => {
    setSearchKeyword('')
    setPage(1)
    setHasMore(true)  // ✅ 新增
  }

  // 處理點擊使用者
  const handleUserClick = (clickedUserId) => {
    router.push(`/site/blog/profile/${clickedUserId}`)
  }

  // 處理追蹤/取消追蹤
  const handleFollowClick = async (targetUserId) => {
  if (!user?.id) {
    alert('請先登入')
    return
  }

  try {
    await toggleFollow(targetUserId)

    // ✅ 重新載入第一頁
    setPage(1)
    setHasMore(true)
    
    const params = {
      page: 1,  // ✅ 固定第一頁
      limit: 10,
    }

    if (searchKeyword) {
      params.search = searchKeyword
    }

    let result
    if (activeTab === 'followers') {
      result = await getFollowers(userId, params)
      setUsers(result.data.followers)  // ✅ 直接設定，不追加
    } else {
      result = await getFollowing(userId, params)
      setUsers(result.data.following)
    }

    setPagination(result.data.pagination)
    setHasMore(result.data.pagination.page < result.data.pagination.totalPages)

    // 如果追蹤的是個人頁使用者，更新統計和追蹤狀態
    if (parseInt(targetUserId) === parseInt(userId)) {
      const userStatsResult = await getUserStats(userId)
      setStats(userStatsResult.data.stats)

      const followStatus = await checkFollowStatus(userId)
      setIsFollowing(followStatus.data.is_following)
    }
  } catch (error) {
    console.error('追蹤操作失敗:', error)
    alert('操作失敗，請稍後重試')
  }
}

  // 處理換頁
  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 處理點擊頭像
  const handleAvatarClick = (clickedUserId) => {
    router.push(`/site/blog/profile/${clickedUserId}`)
  }

  // 處理點擊使用者名稱
  const handleUsernameClick = (clickedUserId) => {
    router.push(`/site/blog/profile/${clickedUserId}`)
  }

  // 處理追蹤個人頁使用者
  // 處理追蹤個人頁使用者
  const handleProfileUserFollow = async () => {
    if (!user?.id) {
      alert('請先登入')
      return
    }

    try {
      await toggleFollow(userId)

      // ✅ 重新載入列表
      setPage(1)
      setHasMore(true)
      
      const params = {
        page: 1,
        limit: 10,
      }

      if (searchKeyword) {
        params.search = searchKeyword
      }

      let result
      if (activeTab === 'followers') {
        result = await getFollowers(userId, params)
        setUsers(result.data.followers)
      } else {
        result = await getFollowing(userId, params)
        setUsers(result.data.following)
      }

      setPagination(result.data.pagination)
      setHasMore(result.data.pagination.page < result.data.pagination.totalPages)

      // 更新追蹤狀態和統計
      const followStatus = await checkFollowStatus(userId)
      setIsFollowing(followStatus.data.is_following)

      const userStatsResult = await getUserStats(userId)
      setStats(userStatsResult.data.stats)
    } catch (error) {
      console.error('追蹤失敗:', error)
      alert('操作失敗，請稍後重試')
    }
  }

  // ✅ 新增：處理檢視切換（參考首頁和個人頁的邏輯）
const handleViewChange = (view) => {
  if (view === 'posts') {
    router.push(`/site/blog/profile/${userId}`)
  } else if (view === 'bookmarks') {
    router.push(`/site/blog/profile/${userId}`)  // 會自動切換到收藏 tab
  }
}

  // 處理搜尋提交（從 UserProfileWidget）
  const handleSearchSubmit = (keyword) => {
    router.push(`/site/blog?q=${encodeURIComponent(keyword)}`)
  }

  // 判斷是否為自己的頁面
  const isOwnProfile = user && profileUser && user.id === profileUser.id

  // 決定空狀態訊息
  const emptyMessage =
    activeTab === 'followers'
      ? isOwnProfile
        ? '你還沒有追蹤者'
        : `${profileUser?.nickname || '使用者'}還沒有追蹤者`
      : isOwnProfile
        ? '你還沒有追蹤任何人'
        : `${profileUser?.nickname || '使用者'}還沒有追蹤任何人`

  return (
    <>
      <div className="max-w-6xl mx-auto my-8 px-6">
        <BackButton />

        {/* ✅ 手機版 Profile Widget */}
        <div className="lg:hidden mb-6">
          <UserProfileWidget
            currentUser={user}
            profileUser={profileUser}
            stats={stats}
            isFollowing={isFollowing}
            currentView="following"  // ✅ 加入這行
          onViewChange={handleViewChange}  // ✅ 加入這行
            onFollowClick={handleProfileUserFollow}
            onAvatarClick={handleAvatarClick}
            onUsernameClick={handleUsernameClick}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>

        {/* ✅ 文章列表布局（與首頁/個人頁一致） */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <main className="flex flex-col gap-6">
            {/* 頁面標題 */}
            <div className="bg-white/60 p-8 shadow-md border-l-[3px] border-primary">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {isOwnProfile
                  ? '我的追蹤列表'
                  : `${profileUser?.nickname || '使用者'}的追蹤列表`}
              </h1>
              <p className="text-gray-600 text-base">
                {isOwnProfile
                  ? '管理你的追蹤關係'
                  : `探索${profileUser?.nickname || '使用者'}的追蹤關係`}
              </p>
            </div>

            {/* Tab 切換 */}
            <TabNavigation
              tabs={followTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              variant="follow"
            />

            {/* 搜尋列 */}
            <FollowSearchBar
              placeholder="搜尋使用者..."
              initialValue={searchKeyword}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />

            {/* 追蹤列表 */}
            <FollowList
              users={users}
              loading={loading}
              currentUserId={user?.id}
              pagination={null}
              onUserClick={handleUserClick}
              onFollowClick={handleFollowClick}
              onPageChange={() => {}}
              emptyMessage={emptyMessage}
            />

            {/* ✅ 新增：載入更多提示 */}
{loadingMore && (
  <div className="text-center py-6">
    <FaIcons.FaSpinner className="inline-block animate-spin text-2xl text-primary mb-2" />
    <p className="text-sm text-gray-600">載入更多...</p>
  </div>
)}

{/* ✅ 新增：沒有更多資料提示 */}
{!loading && !loadingMore && users.length > 0 && !hasMore && (
  <div className="text-center py-6 text-sm text-gray-500">
    已顯示全部 {pagination?.total || users.length} 位使用者
  </div>
)}
          </main>

          {/* ✅ 側邊欄(桌面版) */}
          <aside className="hidden lg:flex flex-col gap-6">
            <UserProfileWidget
              currentUser={user}
              profileUser={profileUser}
              stats={stats}
              isFollowing={isFollowing}
              currentView="following"  // ✅ 加入這行
            onViewChange={handleViewChange}  // ✅ 加入這行
              onFollowClick={handleProfileUserFollow}
              onAvatarClick={handleAvatarClick}
              onUsernameClick={handleUsernameClick}
              onSearchSubmit={handleSearchSubmit}
            />
          </aside>
        </div>
      </div>

      {/* 浮動發文按鈕 */}
      <FloatingPostButton />
    </>
  )
}
