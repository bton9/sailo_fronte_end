'use client'

import React, { useState, createContext, useContext } from 'react'
import ItinerarySettings from './travelSetting'
import ItineraryList from './travelList'
// 創建導航 Context
const NavigationContext = createContext()

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

// 導航 Provider
export function NavigationProvider({ children }) {
  const [currentPage, setCurrentPage] = useState(null) // null, 'settings', or 'list'

  const navigateToSettings = () => setCurrentPage('settings')
  const navigateToList = () => setCurrentPage('list')
  const closePage = () => setCurrentPage(null)

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        navigateToSettings,
        navigateToList,
        closePage,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

// 頁面路由組件
export default function TravelApp() {
  const { currentPage, navigateToList, navigateToSettings, closePage } =
    useNavigation()

  if (!currentPage) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {currentPage === 'settings' ? (
        <ItinerarySettings
          onNavigateToList={navigateToList}
          onClose={closePage}
        />
      ) : (
        <ItineraryList
          onNavigateToSettings={navigateToSettings}
          onClose={closePage}
        />
      )}
    </div>
  )
}
