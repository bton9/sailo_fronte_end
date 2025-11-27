/**
 * 格式化日期顯示
 * @param {string} dateString - 日期字串
 * @returns {string} 格式化後的日期 (MM/DD)
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
  })
}
