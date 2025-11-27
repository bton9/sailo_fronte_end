// components/infinite-scroll-trigger.jsx
'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

const InfiniteScrollTrigger = ({ onLoadMore, isLoading, isReachingEnd }) => {
  const triggerRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 當觸發元素進入視窗且還有更多資料時,載入下一頁
        if (entries[0].isIntersecting && !isLoading && !isReachingEnd) {
          onLoadMore()
        }
      },
      { threshold: 0.1 } // 當 10% 進入視窗時觸發
    )
    
    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }
    
    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current)
      }
    }
  }, [onLoadMore, isLoading, isReachingEnd])
  
  return (
    <div ref={triggerRef} className="py-8 flex justify-center">
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>載入更多商品...</span>
        </div>
      )}
      {isReachingEnd && !isLoading && (
        <p className="text-muted-foreground">已經到底了</p>
      )}
    </div>
  )
}

export default InfiniteScrollTrigger
