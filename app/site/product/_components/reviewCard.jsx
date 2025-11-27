// 單個評論卡片
// _components/ReviewCard.jsx
import Image from 'next/image'
import { Button } from './button'
import { Card } from './card'
import { MoreVertical, Edit2, Trash2, ThumbsUp, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../_components/dropdownMenu '
import { renderStars, formatReviewDate } from '@/lib/reviewUtils'

export default function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) {
  const isOwner = currentUserId === review.user_id

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {review.user_avatar ? (
              <Image
                src={review.user_avatar}
                alt={review.user_name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {review.user_nickname || review.user_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(review.rating)}
              <span className="text-xs text-muted-foreground">
                {formatReviewDate(review.created_at)}
              </span>
              {review.is_verified_purchase === 1 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  已購買
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(review)}>
                <Edit2 className="h-4 w-4 mr-2 " />
                編輯評論
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(review.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                刪除評論
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {review.title && (
        <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.comment}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-4">
          {review.images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded overflow-hidden"
            >
              <Image
                src={img}
                alt={`評論圖片 ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ThumbsUp className="h-4 w-4" />
          <span>有幫助 ({review.helpful_count || 0})</span>
        </button>
      </div>
    </Card>
  )
}
