'use client'
import '@/app/globals.css' // 確保在這裡導入全域 CSS
import SideMenu from '@/components/sidebar'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function SiteLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div>
      <SideMenu />
      <AuthGuard>{children}</AuthGuard>
    </div>
  )
}
