'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import ProductCard from './productCard'

// 你也可以用你喜歡的圖示庫改成 svg Icon 或其他
const PrevArrow = () => (
  <button className="custom-swiper-prev absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 cursor-pointer text-2xl">
    ‹
  </button>
)

const NextArrow = () => (
  <button className="custom-swiper-next absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 cursor-pointer text-2xl">
    ›
  </button>
)

/**
 * SwiperProduct 組件
 * 
 * 使用方式：
 * 1. 傳入商品列表：<SwiperProduct products={products} />
 * 2. 自動獲取推薦商品：<SwiperProduct autoFetch limit={3} />
 * 
 * @param {Array} products - 商品列表（選填，如果不提供則自動獲取）
 * @param {boolean} autoFetch - 是否自動獲取推薦商品（預設 false）
 * @param {number} limit - 顯示商品數量（預設 12）
 * @param {string} title - 標題（預設「你可能會喜歡的商品」）
 */
export default function SwiperProduct({ 
  products: externalProducts, 
  autoFetch = false,
  limit = 12,

}) {
  const [internalProducts, setInternalProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // 如果啟用 autoFetch，自動獲取推薦商品
  useEffect(() => {
    if (!autoFetch || externalProducts) return

    const fetchProducts = async () => {
      console.log('🔄 [SwiperProduct] 開始獲取推薦商品')
      setIsLoading(true)

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

        // 獲取更多商品以便隨機選取
        const url = `${API_URL}/api/products?limit=20`
        console.log('📡 [SwiperProduct] API URL:', url)

        const response = await fetch(url)
        console.log('📥 [SwiperProduct] API 回應狀態:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('✅ [SwiperProduct] 獲取商品成功:', data)

          // 解析商品列表
          let fetchedProducts = Array.isArray(data)
            ? data
            : data.products || data.data || []

          // 隨機打亂商品順序，取指定數量
          const shuffled = fetchedProducts.sort(() => 0.5 - Math.random())
          const randomProducts = shuffled.slice(0, 12)

          console.log(
            '✅ [SwiperProduct] 隨機選取的推薦商品數量:',
            randomProducts.length
          )
          setInternalProducts(randomProducts)
        } else {
          console.warn('⚠️ [SwiperProduct] API 回應不成功:', response.status)
          setInternalProducts([])
        }
      } catch (error) {
        console.error('❌ [SwiperProduct] 獲取推薦商品失敗:', error)
        setInternalProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [autoFetch, externalProducts, limit])

  // 決定使用哪個商品列表
  const products = externalProducts || internalProducts

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-5">
        <p className="text-gray-500 text-center">正在載入推薦商品...</p>
      </div>
    )
  }

  // 沒有商品時不顯示
  if (!products || products.length === 0) return null

  return (
    <div className="container mx-auto py-5 relative">

      <PrevArrow />
      <NextArrow />

      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: '.custom-swiper-prev',
          nextEl: '.custom-swiper-next',
        }}
        spaceBetween={16}
        slidesPerView={3}
        breakpoints={{
          320: { slidesPerView: 1 },
          480: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.product_id}>
            <ProductCard
              id={product.product_id}
              name={product.product_name}
              price={product.price}
              image={product.images?.[0] || '/placeholder-product.jpg'}
              category={product.category_name}
              rating={parseFloat(product.avg_rating) || 0}
              reviewCount={product.review_count || 0}
              favoriteCount={product.favorite_count || 0}
              initialIsFavorite={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}