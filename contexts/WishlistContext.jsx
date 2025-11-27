'use client'
import { createContext, useContext, useState } from 'react'

// 建立 Context
const WishlistContext = createContext()

// Provider：包住整個 App 或 layout
export function WishlistProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openWishlist = () => setIsOpen(true)
  const closeWishlist = () => setIsOpen(false)

  return (
    <WishlistContext.Provider value={{ isOpen, openWishlist, closeWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

// 自訂 Hook：讓元件可以使用 wishlist 狀態
export function useWishlist() {
  return useContext(WishlistContext)
}
