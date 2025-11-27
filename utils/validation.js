/**
 * 表單驗證工具模組
 * 路徑: sailo/utils/validation.js
 *
 * 功能：
 * - Email 格式驗證
 * - 電話格式驗證
 * - 表單欄位驗證
 */

/**
 * 驗證 Email 格式
 * @param {string} email - Email 地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 驗證台灣手機號碼格式
 * @param {string} phone - 手機號碼
 * @returns {boolean} 是否有效
 */
export function isValidPhone(phone) {
  // 台灣手機格式: 09xx-xxx-xxx 或 09xxxxxxxx
  const phoneRegex = /^09\d{8}$/
  return phoneRegex.test(phone.replace(/[-\s]/g, ''))
}

/**
 * 驗證必填欄位
 * @param {string} value - 欄位值
 * @returns {boolean} 是否有效
 */
export function isRequired(value) {
  return value !== null && value !== undefined && value.trim() !== ''
}

/**
 * 驗證字串長度
 * @param {string} value - 字串
 * @param {number} min - 最小長度
 * @param {number} max - 最大長度
 * @returns {boolean} 是否有效
 */
export function isValidLength(value, min, max) {
  if (!value) return false
  const length = value.length
  return length >= min && length <= max
}

/**
 * 統一表單驗證
 * @param {Object} formData - 表單資料
 * @param {Object} rules - 驗證規則
 * @returns {Object} { isValid, errors }
 */
export function validateForm(formData, rules) {
  const errors = {}
  let isValid = true

  Object.keys(rules).forEach((field) => {
    const value = formData[field]
    const rule = rules[field]

    // 必填檢查
    if (rule.required && !isRequired(value)) {
      errors[field] = rule.requiredMessage || `${field} 為必填欄位`
      isValid = false
      return
    }

    // Email 檢查
    if (rule.email && value && !isValidEmail(value)) {
      errors[field] = rule.emailMessage || 'Email 格式不正確'
      isValid = false
      return
    }

    // 長度檢查
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] =
        rule.minLengthMessage || `至少需要 ${rule.minLength} 個字元`
      isValid = false
      return
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = rule.maxLengthMessage || `最多 ${rule.maxLength} 個字元`
      isValid = false
      return
    }

    // 自訂驗證函數
    if (rule.custom && typeof rule.custom === 'function') {
      const customResult = rule.custom(value, formData)
      if (!customResult.isValid) {
        errors[field] = customResult.message
        isValid = false
        return
      }
    }
  })

  return { isValid, errors }
}

// 匯出所有函數
export default {
  isValidEmail,
  isValidPhone,
  isRequired,
  isValidLength,
  validateForm,
}
