'use client'

import { useState, useEffect, useCallback } from 'react'
import Footer from '@/components/footer'
import ProductCard from '../_components/productCard'
import ProductFilters from '../_components/productFilters'
import ProductNavbar from '../_components/productNavbar'
import InfiniteScrollTrigger from '../hooks/infinite-scroll-trigger'
import { Loader2, Search, X } from 'lucide-react'
import { useProducts } from '../hooks/use-products'
import { useCategories } from '../hooks/use-categories'
import SwiperProduct from '../_components/swiperProductSlider'

import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'

const ProductsList = () => {
  // 篩選狀態
  const [filters, setFilters] = useState({
    categoryId: '',
    inStock: false,
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    specialFilter: '',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // 搜尋防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // 使用自訂 hooks - 直接傳入 filters,不需額外的 mutate
  const {
    products,
    error: productsError,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
  } = useProducts({
    perPage: 6,
    search: searchQuery,
    categoryId: filters.categoryId,
    inStock: filters.inStock,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    specialFilter: filters.specialFilter,
  })

  const { categories, error: categoriesError } = useCategories()

  // 處理篩選變更 - 只需要更新 state,useProducts 會自動重新請求
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  // 清除搜尋
  const clearSearch = useCallback(() => {
    setSearchInput('')
    setSearchQuery('')
  }, [])

  // 計算啟用的篩選數量
  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    if (filters.categoryId) count++
    if (filters.inStock) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.specialFilter) count++
    return count
  }, [filters])

  // 根據分類 ID 取得分類資訊
  const getCategoryInfo = useCallback(() => {
    if (!filters.categoryId) {
      return {
        title: '旅行必備商品',
        description:
          '精選旅行用品,從盥洗用具到戶外裝備,讓您的旅程更加輕鬆愉快。',
      }
    }

    // 分類資訊對應表
    const categoryMap = {
      1: {
        title: '盥洗用品',
        description: '旅行必備的清潔與衛生用品,讓您隨時保持清爽舒適。',
      },
      2: {
        title: '電子產品',
        description: '旅途中不可或缺的電子配件,記錄美好時光的每一刻。',
      },
      3: {
        title: '衣物收納',
        description: '聰明收納您的行李,讓旅行更加井然有序。',
      },
      4: {
        title: '旅行配件',
        description: '提升旅行品質的實用配件,讓旅程更加便利。',
      },
      5: {
        title: '戶外露營',
        description: '探索大自然必備的露營裝備,享受戶外生活的樂趣。',
      },
      6: {
        title: '登山健行',
        description: '征服高山所需的專業裝備,安全舒適地挑戰自我。',
      },
      7: { title: '攝影器材', description: '捕捉旅途精彩瞬間的專業攝影配件。' },
      8: {
        title: '防護用品',
        description: '保護您的安全與健康,讓旅行更加安心。',
      },
      9: { title: '運動用品', description: '旅行中也能保持活力的運動裝備。' },
      10: {
        title: '雨具防水',
        description: '無懼風雨的防水裝備,應對各種天氣狀況。',
      },
    }

    // 先從預設對應表查找
    if (categoryMap[filters.categoryId]) {
      return categoryMap[filters.categoryId]
    }

    // 如果是動態分類,從 API 資料查找
    const category = categories?.find(
      (cat) => cat.category_id.toString() === filters.categoryId
    )

    if (category) {
      return {
        title: category.category_name,
        description: `探索 ${category.category_name} 分類中的精選商品。`,
      }
    }

    // 預設值
    return {
      title: '旅行必備商品',
      description: '精選旅行用品,從盥洗用具到戶外裝備,讓您的旅程更加輕鬆愉快。',
    }
  }, [filters.categoryId, categories])

  // 錯誤狀態
  if (productsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-xl font-medium text-foreground">載入失敗</h2>
            <p className="text-muted-foreground">{productsError.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-800 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Banner 輪播組件,改成 Splide 版本
  function InSituBannerCarousel() {
    const banners = [
      {
        img: '/images/american-green-travel-BJ5gcirJa4Y-unsplash.jpg',
      },
      {
        img: '/images/pinkoi.jpg',
      },

      // 若有更多圖片,繼續擴充此陣列
    ]

    const categoryInfo = getCategoryInfo()

    return (
      <div className=" py-10 mx-auto">
        <div className="grid md:grid-cols-1 items-center">
          {/* 圖片輪播區 */}
          <div className="relative flex aspect-[2/1] items-center overflow-hidden">
            {' '}
            {/* overflow-hidden 改 overflow-visible */}
            <Splide
              options={{
                type: 'loop',
                perPage: 1,
                gap: 0,
                autoplay: true,
                pauseOnHover: true,
                pagination: true,
                arrows: true,
                // 自動置中是預設行為,確保無特別禁用centered設定
              }}
              aria-label="In Situ Images Carousel"
              className="relative" // 確保Splide外層相對定位,讓箭頭絕對定位正確
            >
              {banners.map((item, idx) => (
                <SplideSlide key={idx}>
                  <img
                    src={item.img}
                    alt={`Banner image ${idx + 1}`}
                    className="w-fullobject-cover object-center" // 增加 object-center
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      margin: '0 auto',
                    }} // 額外居中保險
                  />
                </SplideSlide>
              ))}
            </Splide>
          </div>
        </div>
        {/* 文字區域 */}
        <section className="text-center mt-10 mb-5">
          <h2 className="text-3xl md:text-3xl mb-4 font-heading font-bold">
            {categoryInfo.title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {categoryInfo.description}
          </p>
        </section>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background  px-2">
        <main className="container mx-auto mb-20 lg:mt-20">
          <InSituBannerCarousel />

          {/* Product Navbar - Fixed at top */}
          <ProductNavbar
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            onClearSearch={clearSearch}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onFilterClick={() => setShowFilters(true)}
            getActiveFiltersCount={getActiveFiltersCount}
          />

          {/* ProductFilters - 隱藏側邊欄版本 */}
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories || []}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {/* 推薦商品輪播 - 使用 autoFetch 自動獲取 3 個商品 */}
          <div className="mb-12">
            <SwiperProduct autoFetch limit={3} />
          </div>
          {/* 搜尋結果提示 */}
          {searchQuery && (
            <div className="mb-6 p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-sm text-accent">
                搜尋 "<span className="font-medium">{searchQuery}</span>" 的結果
                {products.length === 0 && ' - 未找到相關商品'}
              </p>
            </div>
          )}
          {/* Product Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-5 md:gap-x-8 gap-y-12">
                {products.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    id={product.product_id}
                    name={product.product_name}
                    price={product.price}
                    image={product.images?.[0] || '/placeholder-product.jpg'}
                    category={product.category_name}
                    rating={parseFloat(product.avg_rating) || 0}
                    reviewCount={product.review_count || 0}
                    stock={product.stock_quantity}
                    favoriteCount={product.favorite_count}
                  />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <InfiniteScrollTrigger
                onLoadMore={loadMore}
                isLoading={isLoadingMore}
                isReachingEnd={isReachingEnd}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `沒有找到與 "${searchQuery}" 相關的商品`
                  : filters.categoryId ||
                      filters.specialFilter ||
                      filters.minPrice ||
                      filters.maxPrice
                    ? '沒有符合條件的商品'
                    : '此分類目前沒有商品'}
              </p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default ProductsList
