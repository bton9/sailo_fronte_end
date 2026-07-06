import { Landmark, Utensils, Hotel } from 'lucide-react'

/**
 * 景點分類清單與圖示映射（共用於 Mapsidebarmenu.jsx、SearchFilterNavbar.jsx）
 */
export const DEFAULT_CATEGORIES = [
  { value: '景點', label: '景點', icon: 'Landmark' }, // 景點對應 Landmark
  { value: '餐廳', label: '美食', icon: 'Utensils' }, // 餐廳對應 Utensils
  { value: '住宿', label: '住宿', icon: 'Hotel' }, // 住宿對應 Hotel
]

export const CATEGORY_ICON_MAP = {
  Landmark,
  Utensils,
  Hotel,
}
