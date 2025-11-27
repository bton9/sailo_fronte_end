// 評論表單
// _components/ReviewForm.jsx
import { useState } from 'react'
import { Button } from './button'
import { Card } from './card'
import { Textarea } from './textArea'
import { Loader2, Send } from 'lucide-react'
import { renderStars } from '@/lib/reviewUtils'

export default function ReviewForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  })

  const handleSubmit = async () => {
    const success = await onSubmit(formData)
    if (success) {
      setFormData({ rating: 5, title: '', comment: '' })
    }
  }

  const handleRatingClick = (rating) => {
    if (!isSubmitting) {
      setFormData((prev) => ({ ...prev, rating }))
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-foreground mb-4">撰寫您的評論</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            評分
          </label>
          {renderStars(formData.rating, true, handleRatingClick, isSubmitting)}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            標題（選填）
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="為您的評論下個標題..."
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={200}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            您的評論 *
          </label>
          <Textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="分享您使用這款產品的感受..."
            rows={4}
            className="w-full min-h-[100px]"
            maxLength={500}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.comment.length}/500
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.comment.trim()}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              提交評論
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
