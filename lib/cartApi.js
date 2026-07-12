/**
 * Shopping Cart API
 * 路徑: sailo/lib/cartApi.js
 *
 * 功能: 統一管理購物車、訂單、付款 API 呼叫
 * 整合後端修正後的 API 端點
 *
 * Auth V2: 使用 httpOnly cookies, 不使用 localStorage
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * 通用 Fetch 函式 (Auth V2 - 使用 httpOnly cookies)
 *
 * 功能:
 * 1. 自動帶上 httpOnly cookies (瀏覽器自動處理)
 * 2. 統一錯誤處理
 * 3. 符合 Auth V2 規範 (不使用 localStorage)
 */
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include', // 自動帶上 httpOnly cookies
    })

    const data = await response.json()

    // 檢查回應狀態
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: 請求失敗`)
    }

    return data
  } catch (error) {
    console.error(` API 請求失敗 [${url}]:`, error)
    throw error
  }
}

/**
 * 購物車 API
 */
export const cartAPI = {
  /**
   * 取得購物車
   * 後端從 httpOnly cookie 中的 JWT 自動取得 userId
   */
  async getCart() {
    return fetchWithAuth('/api/cart')
  },

  /**
   * 加入商品到購物車
   *
   * @param {number} productId - 商品ID
   * @param {number} quantity - 數量
   */
  async addToCart(productId, quantity) {
    return fetchWithAuth('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    })
  },

  /**
   * 更新購物車商品數量
   *
   * @param {number} itemId - 購物車項目ID (cart_items.id)
   * @param {number} quantity - 新數量
   */
  async updateQuantity(itemId, quantity) {
    return fetchWithAuth('/api/cart/update', {
      method: 'PATCH',
      body: JSON.stringify({ itemId, quantity }),
    })
  },

  /**
   * 刪除購物車商品
   *
   * @param {number} itemId - 購物車項目ID
   */
  async removeItem(itemId) {
    return fetchWithAuth('/api/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ itemId }),
    })
  },

  /**
   * 清空購物車
   * 後端從 httpOnly cookie 中的 JWT 自動取得 userId
   */
  async clearCart() {
    return fetchWithAuth('/api/cart/clear', { method: 'DELETE' })
  },
}

/**
 * 訂單 API
 */
export const orderAPI = {
  /**
   * 建立訂單
   *
   * @param {Object} orderData - 訂單資料
   * @param {Array} orderData.items - 訂單商品
   * @param {Object} orderData.shippingInfo - 收件資訊
   * @param {string} orderData.shippingMethod - 配送方式 (standard/express)
   * @param {string} orderData.paymentMethod - 付款方式 (ecpay/cod)
   */
  async createOrder(orderData) {
    return fetchWithAuth('/api/order/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  },

  /**
   * 取得訂單詳情
   *
   * @param {number} orderId - 訂單ID
   */
  async getOrder(orderId) {
    return fetchWithAuth(`/api/order/${orderId}`)
  },

  /**
   * 取得用戶所有訂單
   * 後端從 httpOnly cookie 中的 JWT 自動取得 userId
   *
   * @param {string|null} status - 訂單狀態篩選 (all/processing/shipped/completed/cancelled)
   */
  async getUserOrders(status = null) {
    let endpoint = '/api/order/list'

    if (status) {
      endpoint += `?status=${status}`
    }

    return fetchWithAuth(endpoint)
  },

  /**
   * 取消訂單
   *
   * @param {number} orderId - 訂單ID
   */
  async cancelOrder(orderId) {
    return fetchWithAuth(`/api/order/${orderId}/cancel`, {
      method: 'PUT',
    })
  },

  /**
   * 更新訂單狀態（管理員功能）
   *
   * @param {number} orderId - 訂單ID
   * @param {number} status - 訂單狀態 (0:待處理 1:處理中 2:已出貨 3:已完成 4:已取消)
   */
  async updateOrderStatus(orderId, status) {
    return fetchWithAuth(`/api/order/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },
}

/**
 * 付款 API
 */
export const paymentAPI = {
  /**
   * 建立付款請求
   *
   * @param {number} orderId - 訂單ID
   * @param {string} email - 客戶 Email
   * @param {string} paymentType - 付款方式 (ALL/Credit/WebATM/ATM/CVS/BARCODE)
   */
  async createPayment(orderId, email, paymentType = 'Credit') {
    return fetchWithAuth('/api/payment/create', {
      method: 'POST',
      body: JSON.stringify({ orderId, email, paymentType }),
    })
  },

  /**
   * 取得付款表單 URL
   *
   * @param {number} orderId - 訂單ID
   * @param {string} email - 客戶 Email
   * @returns {string} 付款表單 URL
   */
  getPaymentFormURL(orderId, email) {
    return `${API_BASE_URL}/api/payment/form/${orderId}?email=${encodeURIComponent(email)}`
  },

  /**
   * 查詢付款狀態
   *
   * @param {number} orderId - 訂單ID
   */
  async getPaymentStatus(orderId) {
    return fetchWithAuth(`/api/payment/status/${orderId}`)
  },

  /**
   * 模擬付款成功（測試用）
   *
   * @param {number} orderId - 訂單ID
   */
  async simulatePayment(orderId) {
    return fetchWithAuth('/api/payment/simulate', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    })
  },
}

/**
 * 健康檢查 API
 */
export const healthAPI = {
  /**
   * 檢查購物車模組狀態
   */
  async check() {
    return fetchWithAuth('/api/health')
  },
}

const cartApiExport = {
  cartAPI,
  orderAPI,
  paymentAPI,
  healthAPI,
}

export default cartApiExport
