// 編輯/刪除對話框
// _components/ReviewDialogs.jsx
import { Button } from './button'
import { Textarea } from './textArea'
import { Loader2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { renderStars } from '@/lib/reviewUtils'

// 編輯評論對話框
export function EditReviewDialog({
  isOpen,
  onClose,
  review,
  formData,
  onFormChange,
  onSubmit,
  isSubmitting,
}) {
  if (!review) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-secondary-200">
        <DialogHeader>
          <DialogTitle>編輯評論</DialogTitle>
          <DialogDescription>修改您對此商品的評價</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              評分
            </label>
            {renderStars(
              formData.rating,
              true,
              (rating) => onFormChange({ ...formData, rating }),
              isSubmitting
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              標題（選填）
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                onFormChange({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              評論內容 *
            </label>
            <Textarea
              value={formData.comment}
              onChange={(e) =>
                onFormChange({ ...formData, comment: e.target.value })
              }
              rows={4}
              className="w-full min-h-[100px]"
              placeholder="請描述您的使用體驗..."
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {formData.comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.comment.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                儲存中...
              </>
            ) : (
              '儲存變更'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 刪除確認對話框
export function DeleteReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認刪除</DialogTitle>
          <DialogDescription>
            確定要刪除這則評論嗎？此操作無法復原。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                刪除中...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                確認刪除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
