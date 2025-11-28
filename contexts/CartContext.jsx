/**
 * CartContext - 購物車狀態管理
 * 路徑: sailo/contexts/CartContext.jsx
 *
 * 重點：
 * 1. 不需要傳 userId 到 API（後端從 JWT 自動取得）
 * 2. 等待 AuthContext 完全載入
 * 3. 適配後端 snake_case 欄位
 *  FIXED: Export both 'items' and 'cartItems' for compatibility
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import { cartAPI } from '@/lib/cartApi'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [cartItems, setCartItems] = useState([])
  const [summary, setSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
    totalQuantity: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 載入購物車
   */
  const loadCart = useCallback(async () => {
    // 🔥 等待 Auth 載入完成
    if (authLoading) {
      console.log('🛒 CartContext: Auth 尚未載入完成，等待中...')
      return
    }

    // 未登入時清空購物車
    if (!isAuthenticated) {
      console.log('🛒 CartContext: 未登入，清空購物車')
      setCartItems([])
      setSummary({
        subtotal: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
        totalQuantity: 0,
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🛒 CartContext: 開始載入購物車')

      const response = await cartAPI.getCart()

      console.log('🛒 CartContext: API 回應:', response)
      console.log('🛒 CartContext: 商品數量:', response.items?.length)

      if (response.items && response.items.length > 0) {
        console.log('🛒 CartContext: 第一個商品（原始）:', response.items[0])
      }

      if (response.success) {
        const items = response.items || []

        // 🔥 適配後端 snake_case 欄位
        const transformedItems = items.map((item) => {
          const transformed = {
            id: item.id,
            productId: item.product_id || item.productId,
            name: item.product_name || item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price || item.unitPrice,
            stockQuantity: item.stock_quantity || item.stockQuantity,
            imageUrl: item.image_url || item.imageUrl || '',
            subtotal:
              item.subtotal ||
              item.quantity * (item.unit_price || item.unitPrice || 0),
          }

          if (items.indexOf(item) === 0) {
            console.log('🛒 CartContext: 轉換後的第一個商品:', transformed)
          }

          return transformed
        })

        setCartItems(transformedItems)
        setSummary({
          subtotal: response.summary?.subtotal || 0,
          shipping: response.summary?.shipping || 0,
          total: response.summary?.total || 0,
          itemCount: response.summary?.itemCount || transformedItems.length,
          totalQuantity:
            response.summary?.totalQuantity ||
            transformedItems.reduce((sum, item) => sum + item.quantity, 0),
        })

        console.log(
          ' CartContext: 購物車載入成功，商品數:',
          transformedItems.length
        )
      } else {
        throw new Error(response.message || '載入購物車失敗')
      }
    } catch (err) {
      console.error(' CartContext: 載入購物車失敗:', err)
      setError(err.message)
      setCartItems([])
      setSummary({
        subtotal: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
        totalQuantity: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, authLoading])

  /**
   * 加入商品到購物車
   */
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        return { success: false, message: '請先登入' }
      }

      try {
        setLoading(true)
        setError(null)

        console.log('🛒 CartContext: 加入商品到購物車', { productId, quantity })

        // 不需要傳 userId，後端從 JWT 取得
        const response = await cartAPI.addToCart(productId, quantity)

        if (response.success) {
          await loadCart()
          return {
            success: true,
            message: response.message || '成功加入購物車',
          }
        } else {
          throw new Error(response.message || '加入購物車失敗')
        }
      } catch (err) {
        console.error(' 加入購物車失敗:', err)
        setError(err.message)
        return { success: false, message: err.message }
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, loadCart]
  )

  /**
   * 更新商品數量
   */
  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      try {
        setLoading(true)
        setError(null)

        // 不需要傳 userId，後端從 JWT 取得
        const response = await cartAPI.updateQuantity(itemId, quantity)

        if (response.success) {
          await loadCart()
          return { success: true, message: response.message || '更新成功' }
        } else {
          throw new Error(response.message || '更新失敗')
        }
      } catch (err) {
        console.error(' 更新數量失敗:', err)
        setError(err.message)
        return { success: false, message: err.message }
      } finally {
        setLoading(false)
      }
    },
    [loadCart]
  )

  /**
   * 刪除商品
   */
  const removeItem = useCallback(
    async (itemId) => {
      try {
        setLoading(true)
        setError(null)

        // 不需要傳 userId，後端從 JWT 取得
        const response = await cartAPI.removeItem(itemId)

        if (response.success) {
          await loadCart()
          return { success: true, message: response.message || '刪除成功' }
        } else {
          throw new Error(response.message || '刪除失敗')
        }
      } catch (err) {
        console.error(' 刪除商品失敗:', err)
        setError(err.message)
        return { success: false, message: err.message }
      } finally {
        setLoading(false)
      }
    },
    [loadCart]
  )

  /**
   * 清空購物車
   */
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false, message: '請先登入' }
    }

    try {
      setLoading(true)
      setError(null)

      // 不需要傳 userId，後端從 JWT 取得
      const response = await cartAPI.clearCart()

      if (response.success) {
        setCartItems([])
        setSummary({
          subtotal: 0,
          shipping: 0,
          total: 0,
          itemCount: 0,
          totalQuantity: 0,
        })
        return { success: true, message: response.message || '購物車已清空' }
      } else {
        throw new Error(response.message || '清空購物車失敗')
      }
    } catch (err) {
      console.error(' 清空購物車失敗:', err)
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // 🔥 當登入狀態改變時，載入購物車
  useEffect(() => {
    console.log('🛒 CartContext: useEffect 觸發', {
      authLoading,
      isAuthenticated,
      user,
    })

    loadCart()
  }, [loadCart, authLoading, isAuthenticated, user])

  //  FIXED: Export both naming conventions for compatibility
  const value = {
    items: cartItems, // For components using 'items'
    cartItems, // For components using 'cartItems'
    summary,
    loading,
    error,
    fetchCart: loadCart, // Alias for loadCart
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export default CartContext
