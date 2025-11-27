/**
 * Providers - 統一管理所有 Provider
 * 路徑: sailo/components/providers/Providers.jsx
 * 
 * 使用方式:
 * import Providers from '@/components/providers/Providers'
 * 
 * 然後在你的 layout.jsx 中:
 * <Providers>{children}</Providers>
 */

'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  )
}