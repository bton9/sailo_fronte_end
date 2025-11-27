// hooks/use-categories.js
import useSWR from 'swr'

const fetcher = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('無法取得分類資料')
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || '取得分類失敗')
  }

  return result.data
}

export const useCategories = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const { data, error, isLoading } = useSWR(
    `${API_URL}/api/products/categories`,
    fetcher
  )

  return {
    categories: data || [],
    error,
    isLoading,
  }
}
