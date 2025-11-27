// ==================== components/SelectListModal.jsx ====================
import { Plus, Heart, Loader2 } from 'lucide-react'
import { ModalHeader } from './ModalHeader'
import { ListItem } from './ListItem'

export function SelectListModal({
  lists,
  loading,
  selectedCount,
  onCreateNew,
  onToggle,
  onDelete,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden animate-slideUp">
        <ModalHeader title="收藏清單" icon={Heart} onClose={onClose} />

        <div className="p-6 max-h-[28rem] overflow-y-auto space-y-4">
          <button
            onClick={onCreateNew}
            className="w-full mb-5 p-4 bg-gray-300 border-2 border-dashed border-secondary-500 hover:shadow-md flex items-center gap-3 group"
          >
            <div className="bg-secondary-600 p-2">
              <Plus className="text-white" size={20} />
            </div>
            <span className="text-secondary-600 font-semibold">新增清單</span>
          </button>
    
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto text-secondary-600" />
              <p className="text-gray-500 mt-4">載入中...</p>
            </div>
          ) : lists.length === 0 ? (
            <p className="text-center text-gray-500 py-8">目前無收藏清單</p>
          ) : (
            <div className="space-y-5">
              {lists.map((list) => (
                <ListItem
                  key={list.list_id}
                  list={list}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-5 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-gray-600">
            已選擇{' '}
            <span className="font-bold text-secondary-600">
              {selectedCount}
            </span>{' '}
            個
          </span>
          <button
            onClick={onClose}
            className="px-7 py-2.5 bg-primary-500 text-white font-semibold hover:scale-105 transition"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  )
}
