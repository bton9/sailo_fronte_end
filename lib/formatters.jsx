// 格式化工具(價格、日期、圖片)
// lib/formatters.js

/**
 * 格式化價格為台幣格式
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * 格式化日期為台灣格式
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 取得圖片描述文字
 */
export function getImageDescription(index) {
  const descriptions = [
    '預設視圖',
    '替代視圖',
    '其他視圖',
    '額外視圖',
    '細節視圖',
    '使用視圖',
  ]
  return descriptions[index] || `視圖 ${index + 1}`
}
