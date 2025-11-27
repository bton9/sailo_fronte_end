/**
 * 處理景點圖片路徑
 * @param {string} coverImage - 原始圖片路徑
 * @returns {string|null} 處理後的圖片路徑
 */
export function processPlaceImage(coverImage) {
  if (!coverImage) {
    return null
  }

  // 如果已經是完整 URL 或正確的相對路徑，直接返回
  if (coverImage.startsWith('http') || coverImage.startsWith('/uploads/')) {
    return coverImage
  }

  // 否則加上 /uploads/ 前綴
  return `/uploads/${coverImage}`
}
