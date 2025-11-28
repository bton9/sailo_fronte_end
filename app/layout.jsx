// app/layout.js (或 .tsx)
import './globals.css' // 確保在這裡導入全域 CSS
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { ChatButtonWrapper } from '@/components/message'
import { TransitionProvider } from '@/contexts/transitionContext'
import CustomCursor from '@/components/cursor'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <TransitionProvider>
          <AuthProvider>
            <CartProvider>
              <TransitionProvider>
                <SocketProvider>
                  {children}
                  {/* 全站客服聊天按鈕 (WebSocket + ImageKit) */}
                  <CustomCursor />
                  <ChatButtonWrapper />
                </SocketProvider>
              </TransitionProvider>
            </CartProvider>
          </AuthProvider>
        </TransitionProvider>
      </body>
    </html>
  )
}
