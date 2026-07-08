'use client'

import { createContext, useContext, useState } from 'react'

const OverlayContext = createContext(null)

export function OverlayProvider({ children }) {
  const [hideMobileHeader, setHideMobileHeader] = useState(false)

  return (
    <OverlayContext.Provider value={{ hideMobileHeader, setHideMobileHeader }}>
      {children}
    </OverlayContext.Provider>
  )
}

export function useOverlay() {
  const context = useContext(OverlayContext)

  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider')
  }

  return context
}
