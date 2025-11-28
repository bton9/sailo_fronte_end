// 狀態提示(登入/無權限/已評論/無)
// _components/ReviewStates.jsx
'use client'

import { Card } from './card'
import { Button } from './button'
import { User, Lock, AlertCircle, CheckCircle, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// 已評論提示
export function ReviewedPrompt({ review, onEditClick }) {
  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">您已評論過此商品</h3>
            <p className="text-sm text-blue-700">
              您可以在下方查看並編輯您的評論
            </p>
          </div>
        </div>

        {/* 編輯按鈕 */}
        {onEditClick && (
          <Button
            onClick={onEditClick}
            variant="outline"
            size="sm"
            className="border-blue-300 text-primary-900 hover:bg-blue-100"
          >
            <Edit className="h-4 w-4 mr-2" />
            編輯評論
          </Button>
        )}
      </div>
    </Card>
  )
}

// 無權限提示
export function NoPermissionPrompt({ reason }) {
  return (
    <Card className="p-6 bg-orange-50 border-orange-200">
      <div className="flex items-start gap-3">
        <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-orange-900 mb-1">無法評論</h3>
          <p className="text-sm text-orange-700">
            {reason || '只有購買過此商品的用戶才能評論'}
          </p>
        </div>
      </div>
    </Card>
  )
}

// 未登入提示
export function LoginPrompt({ onLoginClick }) {
  const { user, setShowLoginModal } = useAuth()

  const handleAuthClick = (e) => {
    e.preventDefault()

    if (!user) {
      console.log(' [LoginPrompt] 開啟登入視窗')
      setShowLoginModal(true)
    }
  }

  return (
    <Card className="p-8 text-center">
      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        登入後發表評論
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        分享您的使用體驗,幫助其他顧客做出更好的選擇
      </p>
      <Button onClick={handleAuthClick} className="mx-auto">
        <Lock className="h-4 w-4 mr-2" />
        前往登入
      </Button>
    </Card>
  )
}

// 空評論提示
export function EmptyReviewsPrompt() {
  return (
    <Card className="p-12 text-center">
      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        目前還沒有評論
      </h3>
      <p className="text-sm text-muted-foreground">
        成為第一位評論此商品的顧客
      </p>
    </Card>
  )
}
