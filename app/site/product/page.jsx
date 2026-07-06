'use client'

import Footer from '@/components/footer'
import ProductsList from './list/page'

import '@/app/globals.css'

function Product() {
  return (
    <div className="relative min-h-screen">
      {/* 主要內容區塊 */}
      <main className="md:ml-16 lg:p-4">
        <ProductsList />
      </main>
    </div>
  )
}

export default Product
