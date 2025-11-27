/**
 * 密碼加密工具模組
 * 路徑: sailo/utils/password.js
 *
 * 功能：
 * - 密碼雜湊加密 (bcrypt)
 * - 密碼驗證
 * - 密碼強度檢測
 */

import bcrypt from 'bcryptjs'

/**
 * 加密密碼
 * @param {string} password - 明文密碼
 * @returns {Promise<string>} 加密後的密碼
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * 驗證密碼
 * @param {string} password - 使用者輸入的密碼
 * @param {string} hashedPassword - 資料庫中的加密密碼
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 檢查密碼強度
 *
 * @param {string} password - 要檢查的密碼
 * @returns {Object} 密碼強度資訊
 * @returns {boolean} .isValid - 密碼是否符合基本要求
 * @returns {string} .strength - 強度等級 ('weak' | 'medium' | 'strong')
 * @returns {string} .level - 強度等級別名 (與 strength 相同，用於向下相容)
 * @returns {string} .label - 強度標籤（顯示用）
 * @returns {string} .message - 詳細說明訊息
 * @returns {number} .score - 密碼評分 (0-7)
 *
 * 評分規則：
 * - 長度 >= 12 字元: +2 分
 * - 長度 >= 10 字元: +1 分
 * - 包含小寫字母 (a-z): +1 分
 * - 包含大寫字母 (A-Z): +1 分
 * - 包含數字 (0-9): +1 分
 * - 包含特殊字元: +2 分
 *
 * 強度判定：
 * - score >= 6: 強密碼 (strong)
 * - score >= 4: 中等密碼 (medium)
 * - score < 4: 弱密碼 (weak)
 *
 * 更新說明 (2025-10-15):
 * - 新增 level 屬性（與 strength 相同）
 * - 新增 label 屬性（中文顯示標籤）
 * - 修正密碼強度指示器無法正確顯示的問題
 */
export function checkPasswordStrength(password) {
  const result = {
    isValid: false,
    strength: 'weak',
    level: 'weak', // 新增：與 strength 相同，用於向下相容
    label: '弱', // 新增：中文顯示標籤
    message: '',
    score: 0,
  }

  // ============================================
  // 步驟 1: 基本長度檢查
  // ============================================
  if (!password || password.length < 8) {
    result.message = '密碼至少需要 8 個字元'
    result.label = '太短'
    return result
  }

  let score = 0

  // ============================================
  // 步驟 2: 計算密碼評分
  // ============================================

  // 長度加分（最多 2 分）
  if (password.length >= 12) {
    score += 2 // 12 字元以上
  } else if (password.length >= 10) {
    score += 1 // 10-11 字元
  }

  // 包含小寫字母 (+1 分)
  if (/[a-z]/.test(password)) {
    score += 1
  }

  // 包含大寫字母 (+1 分)
  if (/[A-Z]/.test(password)) {
    score += 1
  }

  // 包含數字 (+1 分)
  if (/\d/.test(password)) {
    score += 1
  }

  // 包含特殊字元 (+2 分)
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 2
  }

  result.score = score

  // ============================================
  // 步驟 3: 判斷密碼強度
  // ============================================
  if (score >= 6) {
    // 強密碼：6-7 分
    result.strength = 'strong'
    result.level = 'strong'
    result.label = '強'
    result.isValid = true
    result.message = '強密碼！非常安全'
  } else if (score >= 4) {
    // 中等密碼：4-5 分
    result.strength = 'medium'
    result.level = 'medium'
    result.label = '中等'
    result.isValid = true
    result.message = '中等強度，建議加入更多字元類型'
  } else {
    // 弱密碼：0-3 分
    result.strength = 'weak'
    result.level = 'weak'
    result.label = '弱'
    result.isValid = false
    result.message = '密碼強度不足，請包含大小寫字母、數字與特殊字元'
  }

  return result
}

const passwordUtils = {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
}

export default passwordUtils
