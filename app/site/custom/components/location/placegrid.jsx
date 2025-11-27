import { useMemo, useRef, useEffect, useState } from 'react'
import Card from '../location/card'

/**
 * 使用 CSS Grid Masonry 解決左右載入延遲問題
 *
 * @param {Array} places - 要顯示的景點數據
 * @param {number} currentPage - 當前頁碼
 * @returns {JSX.Element}
 */
export default function PlaceGrid({ places, currentPage }) {
  const prevLengthRef = useRef(0)
  const [columnCount, setColumnCount] = useState(6)

  // 監聽視窗大小變化，更新欄位數量
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumnCount(1)
      else if (width < 768) setColumnCount(2)
      else if (width < 1024) setColumnCount(3)
      else if (width < 1280) setColumnCount(4)
      else setColumnCount(6)
    }
 
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // 將卡片分配到各個欄位
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => [])

    places.forEach((item, index) => {
      const columnIndex = index % columnCount
      cols[columnIndex].push({ item, index })
    })

    return cols
  }, [places, columnCount])

  const previousLength = prevLengthRef.current
  const isNewBatch = places.length > previousLength

  useEffect(() => {
    prevLengthRef.current = places.length
  }, [places.length])

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-animate-new {
          animation-name: fadeInUp;
          animation-duration: 0.4s;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
          opacity: 0;
          transform: translateY(20px);
          will-change: opacity, transform;
        }

        .card-animate-existing {
          opacity: 1;
          transform: translateY();
        }
      `}</style>

      {/* Masonry Grid 佈局 - 使用 Tailwind Flex */}
      <div className="flex gap-3 px-4 lg:px-0">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-3">
            {column.map(({ item, index }) => {
              const isNewItem = isNewBatch && index >= previousLength
              const animationDelay = isNewItem
                ? `${Math.min(index - previousLength, 30) * 0.05}s`
                : '0s'

              return (
                <div
                  key={`${item.place_id}-${currentPage}-${index}`}
                  className={
                    isNewItem ? 'card-animate-new' : 'card-animate-existing'
                  }
                  style={{
                    animationDelay: isNewItem ? animationDelay : undefined,
                  }}
                >
                  <Card {...item} cover_image={item.cover_image} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
