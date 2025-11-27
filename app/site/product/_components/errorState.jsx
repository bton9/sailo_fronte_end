// 錯誤顯示頁
// components/ErrorState.jsx
import Link from 'next/link'
import { Button } from '../_components/button'
import RIC_fi from '@/lib/react_icon/fi'
import Footer from '@/components/footer'

export default function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-2xl font-luxury text-foreground">找不到商品</h1>
          <p className="text-muted-foreground">{error || '商品不存在'}</p>
          <Link href="/site/product/list">
            <Button variant="outline">
              <RIC_fi.FiChevronLeft className="h-4 w-4 mr-2" />
              返回商城
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
