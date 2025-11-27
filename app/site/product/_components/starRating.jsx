// 星星評分組件
// components/StarRating.jsx
import RIC_ai from '@/lib/react_icon/ai'

export default function StarRating({ rating, size = 'default' }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  const sizeClass = size === 'large' ? 'h-6 w-6' : 'h-4 w-4'

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <RIC_ai.AiFillStar
          key={i}
          className={`${sizeClass} fill-yellow-500 text-yellow-500`}
        />
      )
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <RIC_ai.AiFillStar
          key={i}
          className={`${sizeClass} fill-yellow-500/50 text-yellow-500`}
        />
      )
    } else {
      stars.push(
        <RIC_ai.AiFillStar key={i} className={`${sizeClass} text-gray-300`} />
      )
    }
  }

  return <div className="flex">{stars}</div>
}
