// 載入狀態
// components/LoadingState.jsx
import RIC_fi from '@/lib/react_icon/fi'
import Footer from '@/components/footer'

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <RIC_fi.FiLoader className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground font-elegant">載入中...</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
