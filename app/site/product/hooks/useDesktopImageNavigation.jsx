// 桌面版圖片導航
// hooks/useDesktopImageNavigation.js
import { useState, useEffect, useRef } from 'react'

export function useDesktopImageNavigation(imageCount) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const imageRefs = useRef([])

  useEffect(() => {
    if (imageCount === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      imageRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect()
          const absoluteTop = window.scrollY + rect.top
          const absoluteBottom = absoluteTop + rect.height

          if (
            scrollPosition >= absoluteTop &&
            scrollPosition <= absoluteBottom
          ) {
            setActiveImageIndex(index)
          }
        }
      })
    }

    // 只在桌面版監聽滾動
    if (window.innerWidth >= 1024) {
      window.addEventListener('scroll', handleScroll)
      handleScroll()
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [imageCount])

  const scrollToImage = (index) => {
    if (imageRefs.current[index]) {
      const element = imageRefs.current[index]
      const offset = 100
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return { activeImageIndex, imageRefs, scrollToImage }
}
