// 手機版圖片輪播
// hooks/useImageCarousel.js
import { useState } from 'react'

export function useImageCarousel(imageCount) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
  }

  const goToIndex = (index) => {
    setCurrentIndex(index)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    }
    if (isRightSwipe) {
      goToPrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return {
    currentIndex,
    goToPrevious,
    goToNext,
    goToIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
