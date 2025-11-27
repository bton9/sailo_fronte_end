// 叫商品資料
// hooks/useProductData.js
import { useState, useEffect } from 'react'

export function useProductData(productId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)

        if (!productId) {
          throw new Error('無效的商品 ID')
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const url = `${API_URL}/api/products/${productId}`

        console.log('Fetching product from:', url)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('Product data:', result)

        if (result.success && result.data) {
          setProduct(result.data)
        } else {
          throw new Error(result.error || '商品不存在')
        }
      } catch (err) {
        console.error('取得商品時出錯:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const updateProduct = (updater) => {
    setProduct((prev) =>
      typeof updater === 'function' ? updater(prev) : updater
    )
  }

  return { product, loading, error, updateProduct }
}
