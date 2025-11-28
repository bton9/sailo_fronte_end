// app/site/product/[pid]/page.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/footer'
import { Button } from '../_components/button'
import RIC_fi from '@/lib/react_icon/fi'
import ReviewSection from '../_components/reviewSection'

// Hooks
import { useProductData } from '../hooks/useProductData'
import { useImageCarousel } from '../hooks/useImageCarousel'
import { useDesktopImageNavigation } from '../hooks/useDesktopImageNavigation'
import { useProductActions } from '../hooks/useProductActions'

// Components
import LoadingState from '../_components/loadingState'
import ErrorState from '../_components/errorState'
import MobileImageCarousel from '../_components/mobileImageCarousel'
import DesktopImageGallery from '../_components/desktopImageGallery'
import ProductInfo from '../_components/productInfo'
import { ToastProvider } from '../_components/toastProvider'
import SwiperProduct from '../_components/swiperProductSlider'
import StickyBar from '../_components/stickyBar'

// Utils
import { formatPrice, formatDate, getImageDescription } from '@/lib/formatters'

export default function ProductDetail() {
  const params = useParams()
  const productId = params.pid || params.id

  return (
    <ToastProvider>
      <ProductDetailContent productId={productId} />
    </ToastProvider>
  )
}

function ProductDetailContent({ productId }) {
  const { product, loading, error, updateProduct } = useProductData(productId)

  const mobileCarousel = useImageCarousel(product?.images?.length || 0)

  const desktopNav = useDesktopImageNavigation(product?.images?.length || 0)

  const productActions = useProductActions(product)

  const [quantity, setQuantity] = useState('1')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])

  // sticky bar
  const infoRef = useRef() // 商品資訊區 dom ref
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (!infoRef.current) return
      const infoTop = infoRef.current.getBoundingClientRect().top
      // 視窗頂端小於等於0（已滑到或超過info區）
      setShowStickyBar(infoTop <= 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // 獲取推薦商品 (使用同類別商品)
    const fetchRelatedProducts = async () => {
      if (!product?.product_id || !product?.category_id) {
        console.log('⚠️ 沒有商品資訊,無法獲取推薦商品')
        return
      }

      console.log('🔄 開始獲取推薦商品,當前商品 ID:', product.product_id)
      console.log('🔄 當前商品類別 ID:', product.category_id)

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

        // 方法1: 使用同類別商品 API
        const url = `${API_URL}/api/products?category=${product.category_id}&limit=8`
        console.log('📡 API URL:', url)

        const response = await fetch(url)
        console.log('📥 API 回應狀態:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('✅ 獲取商品成功:', data)

          // 過濾掉當前商品,取前 8 個
          let products = Array.isArray(data)
            ? data
            : data.products || data.data || []
          products = products
            .filter((p) => p.product_id !== product.product_id)
            .slice(0, 8)

          console.log('✅ 過濾後的推薦商品數量:', products.length)
          setRelatedProducts(products)
        } else {
          console.warn('⚠️ API 回應不成功:', response.status)
          setRelatedProducts([])
        }
      } catch (error) {
        console.error(' 獲取推薦商品失敗:', error)
        setRelatedProducts([])
      }
    }

    fetchRelatedProducts()
  }, [product?.product_id, product?.category_id])

  const handleReviewAdded = (newReview) => {
    updateProduct((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
      review_count: (prev.review_count || 0) + 1,
    }))
  }

  const handleReviewUpdated = (updatedReview) => {
    updateProduct((prev) => ({
      ...prev,
      reviews: prev.reviews.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      ),
    }))
  }

  const handleReviewDeleted = (reviewId) => {
    updateProduct((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((review) => review.id !== reviewId),
      review_count: Math.max((prev.review_count || 0) - 1, 0),
    }))
  }

  const handleAddToCart = () => {
    productActions.handleAddToCart(quantity)
  }

  if (loading) return <LoadingState />
  if (error || !product) return <ErrorState error={error} />

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 hidden md:block bg-background/95 backdrop-blur-sm ">
        <div className="container mx-auto px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = '/site/product/list')}
            className="font-elegant"
          >
            <RIC_fi.FiChevronLeft className="h-4 w-4 mr-2" />
            返回商城
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-8">
        {/* 綁定 ref 到圖片區的容器 */}
        <div ref={infoRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:hidden">
            <MobileImageCarousel
              images={product.images}
              productName={product.product_name}
              currentIndex={mobileCarousel.currentIndex}
              onPrevious={mobileCarousel.goToPrevious}
              onNext={mobileCarousel.goToNext}
              onIndexChange={mobileCarousel.goToIndex}
              onTouchStart={mobileCarousel.handleTouchStart}
              onTouchMove={mobileCarousel.handleTouchMove}
              onTouchEnd={mobileCarousel.handleTouchEnd}
              getImageDescription={getImageDescription}
            />
          </div>

          <div className="hidden lg:block lg:col-span-7 xl:col-span-8 ">
            <DesktopImageGallery
              images={product.images}
              productName={product.product_name}
              imageRefs={desktopNav.imageRefs}
              getImageDescription={getImageDescription}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <ProductInfo
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
              isWishlisted={productActions.isWishlisted}
              isSharing={productActions.isSharing}
              onWishlist={productActions.handleWishlist}
              onShare={productActions.handleShare}
              onAddToCart={handleAddToCart}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-20 border-t border-border pt-12">
            <ReviewSection
              product={product}
              reviews={product.reviews || []}
              currentUserId={currentUserId}
              onReviewAdded={handleReviewAdded}
              onReviewUpdated={handleReviewUpdated}
              onReviewDeleted={handleReviewDeleted}
            />
          </div>
        )}
      </div>

      {/* sticky bar - 當圖片區滑出視窗時出現 */}
      {showStickyBar && (
        <StickyBar
          product={product}
          quantity={quantity}
          onWishlist={productActions.handleWishlist}
          onAddToCart={productActions.handleAddToCart}
        />
      )}

      {/* 取得推薦商品列表後 */}
      {console.log('🎨 渲染階段 - relatedProducts:', relatedProducts)}

      {relatedProducts && relatedProducts.length > 0 ? (
        <div className="container mx-auto px-6 py-10">
          <h3 className="text-xl font-bold">你可能會喜歡的商品</h3>
          <SwiperProduct products={relatedProducts} />
        </div>
      ) : (
        <div className="container mx-auto px-6 py-5">
          <p className="text-gray-500 text-center">正在載入推薦商品...</p>
        </div>
      )}

      <Footer />
    </div>
  )
}
