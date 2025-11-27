// 評論相關的工具(星星、日期)
// lib/reviewUtils.jsx
import RIC_ai from '@/lib/react_icon/ai'

/**
 * 格式化日期
 */
export function formatReviewDate(dateString) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 渲染星星評分
 */
export function renderStars(
  rating,
  interactive = false,
  onClick = null,
  isDisabled = false
) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <div
        key={i}
        role={interactive ? 'button' : 'img'}
        onClick={interactive && !isDisabled ? () => onClick(i) : undefined}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={
          interactive
            ? (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                  onClick(i)
                }
              }
            : undefined
        }
        aria-label={`評分 ${i} 顆星`}
        className={
          interactive && !isDisabled
            ? 'cursor-pointer hover:scale-110 transition-transform'
            : 'cursor-default'
        }
      >
        <RIC_ai.AiFillStar
          className={`h-5 w-5 ${i <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
        />
      </div>
    )
  }
  return <div className="flex gap-1">{stars}</div>
}
