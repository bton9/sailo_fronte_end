/**
 * Avatar Utilities (ImageKit Version)
 * 路徑: sailo/utils/avatar.js
 *
 * 功能：提供頭像相關的工具函數
 * - 統一處理頭像 URL 轉換
 * - 支援 ImageKit CDN URL
 * - 支援舊的本地路徑（向下相容）
 * - 確保所有地方的頭像顯示邏輯一致
 *
 * 使用方式：
 * import { getFullAvatarUrl } from '@/utils/avatar'
 * <img src={getFullAvatarUrl(user?.avatar)} alt="頭像" />
 */

/**
 * 取得完整的頭像 URL
 *
 * 處理邏輯：
 * 1. 如果沒有頭像，回傳 null
 * 2. 如果是完整 URL（以 http/https 開頭），直接回傳（ImageKit CDN 或外部 URL）
 * 3. 如果是本地路徑（以 / 開頭），加上 API 基礎 URL（舊資料相容）
 *
 * @param {string|null} avatar - 頭像路徑或 URL
 * @returns {string|null} 完整的頭像 URL 或 null
 *
 * @example
 * // ImageKit CDN URL（新版）
 * getFullAvatarUrl('https://ik.imagekit.io/your_id/avatars/avatar_123.jpg')
 * // 回傳: 'https://ik.imagekit.io/your_id/avatars/avatar_123.jpg'
 *
 * @example
 * // 本地路徑（舊版，向下相容）
 * getFullAvatarUrl('/uploads/avatars/avatar_123.jpg')
 * // 回傳: 'http://localhost:5000/uploads/avatars/avatar_123.jpg'
 *
 * @example
 * // 外部 URL
 * getFullAvatarUrl('https://example.com/avatar.jpg')
 * // 回傳: 'https://example.com/avatar.jpg'
 *
 * @example
 * // 空值
 * getFullAvatarUrl(null)
 * // 回傳: null
 */
export function getFullAvatarUrl(avatar) {
  // 如果沒有頭像，回傳 null
  if (!avatar) {
    return null
  }

  // 如果是完整 URL（以 http 或 https 開頭），直接回傳
  // 包含：ImageKit CDN URL、外部圖片 URL 等
  if (avatar.startsWith('http')) {
    return avatar
  }

  // 如果是本地路徑（舊資料相容），加上 API 基礎 URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  return `${API_BASE_URL}${avatar}`
}

/**
 * 取得頭像的縮圖 URL（ImageKit 專用）
 * 使用 ImageKit 的即時轉換功能產生縮圖
 *
 * @param {string|null} avatar - 頭像 URL
 * @param {number} width - 縮圖寬度（預設 200px）
 * @param {number} height - 縮圖高度（預設 200px）
 * @returns {string|null} 縮圖 URL 或 null
 *
 * @example
 * // 產生 200x200 的縮圖
 * getAvatarThumbnail('https://ik.imagekit.io/.../avatar.jpg')
 * // 回傳: 'https://ik.imagekit.io/.../tr:w-200,h-200,c-at_max/avatar.jpg'
 */
export function getAvatarThumbnail(avatar, width = 200, height = 200) {
  // 如果沒有頭像，回傳 null
  if (!avatar) {
    return null
  }

  // 只處理 ImageKit URL
  if (!avatar.includes('ik.imagekit.io')) {
    return getFullAvatarUrl(avatar) // 非 ImageKit URL，使用原圖
  }

  // 在 URL 中插入轉換參數
  // 格式: tr:w-寬度,h-高度,c-at_max
  // c-at_max: 保持長寬比，不裁切
  const transformation = `tr:w-${width},h-${height},c-at_max`

  // ImageKit URL 格式: https://ik.imagekit.io/your_id/path/file.jpg
  // 插入轉換參數: https://ik.imagekit.io/your_id/tr:w-200,h-200,c-at_max/path/file.jpg
  const parts = avatar.split('/')
  const idIndex = parts.indexOf(parts.find((p) => p.includes('ik.imagekit.io')))

  if (idIndex >= 0 && parts[idIndex + 1]) {
    // 在 your_id 後面插入轉換參數
    parts.splice(idIndex + 2, 0, transformation)
    return parts.join('/')
  }

  return avatar // 如果解析失敗，回傳原 URL
}

/**
 * 預設頭像 URL (ImageKit CDN)
 *
 * 說明:
 * - 使用 ImageKit 上的預設頭像
 * - 當使用者沒有上傳自訂頭像時使用
 * - 與後端註冊時設定的預設頭像保持一致
 *
 * ImageKit URL 結構:
 * https://ik.imagekit.io/{imagekit_id}/avatars/{filename}.png?updatedAt={timestamp}
 *
 * @constant {string}
 */
export const DEFAULT_AVATAR_URL =
  'https://ik.imagekit.io/crjen7iza/avatars/avatarxxx01.png?updatedAt=1761200375843'

/**
 * 取得頭像 URL（含預設頭像處理）
 *
 * 處理邏輯:
 * 1. 如果沒有登入，回傳 null（不顯示頭像）
 * 2. 如果有自訂頭像，回傳完整的頭像 URL
 * 3. 如果已登入但沒有頭像，回傳 ImageKit 預設頭像
 *
 * 這樣可以確保只有登入的使用者才顯示頭像，提升安全性
 *
 * @param {string|null} avatar - 使用者的頭像路徑或 URL
 * @param {boolean} isLoggedIn - 使用者是否已登入（預設為 false）
 * @returns {string|null} 完整的頭像 URL，或 null（未登入時）
 *
 * @example
 * // 有自訂頭像且已登入
 * getAvatarUrl('https://ik.imagekit.io/.../custom_avatar.jpg', true)
 * // 回傳: 'https://ik.imagekit.io/.../custom_avatar.jpg'
 *
 * @example
 * // 沒有頭像但已登入，使用預設
 * getAvatarUrl(null, true)
 * // 回傳: 'https://ik.imagekit.io/crjen7iza/avatars/avatarxxx01.png?updatedAt=1761200375843'
 *
 * @example
 * // 未登入
 * getAvatarUrl(null, false)
 * // 回傳: null
 */
export function getAvatarUrl(avatar, isLoggedIn = false) {
  // 如果使用者未登入，不顯示任何頭像
  if (!isLoggedIn) {
    return null
  }

  // 如果有自訂頭像，使用完整 URL 處理函數
  if (avatar) {
    return getFullAvatarUrl(avatar)
  }

  // 如果已登入但沒有頭像，回傳預設頭像
  return DEFAULT_AVATAR_URL
}

/**
 * 頭像顯示元件的預設 Props
 * 用於統一所有頭像顯示的樣式
 */
export const AVATAR_DISPLAY_CONFIG = {
  // 預設頭像 URL（ImageKit CDN）
  defaultAvatarUrl: DEFAULT_AVATAR_URL,

  // 預設表情符號（作為後備選項）
  defaultEmoji: '😊',

  // 漸層背景顏色（Tailwind CSS 類別）
  gradientClasses: 'bg-gradient-to-br from-purple-400 to-pink-400',

  // 圖片顯示類別
  imageClasses: 'w-full h-full object-cover',

  // 表情符號顏色
  emojiClasses: 'text-white',
}
