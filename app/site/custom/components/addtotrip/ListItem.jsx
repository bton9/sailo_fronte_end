// ==================== components/ListItem.jsx ====================
import { Check, Trash2 } from 'lucide-react'

export function ListItem({ list, onToggle, onDelete }) {
  return (
    <div
      className={`relative p-6 transition-all border-2 ${
        list.checked
          ? 'bg-gray-50 border-secondary-600'
          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-50 transition-all duration-200 group/delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(list.list_id)
        }}
        title="刪除清單"
      >
        <Trash2
          size={18}
          className="group-hover/delete:scale-110 transition-transform"
        />
      </button>

      <div
        onClick={() => onToggle(list.list_id)}
        className="flex items-start justify-between cursor-pointer pr-6"
      >
        <div className="space-y-1.5">
          <h3 className="font-semibold text-gray-800 text-base">{list.name}</h3>
          <p className="text-sm text-gray-500 leading-snug">
            {list.description || '（無描述）'}
          </p>
        </div>

        <div
          className={`w-7 h-7 border-2 rounded-md flex items-center justify-center shrink-0 ${
            list.checked
              ? 'bg-secondary-600 border-secondary-600'
              : 'border-gray-300'
          }`}
        >
          {list.checked && <Check className="text-white" size={14} />}
        </div>
      </div>
    </div>
  )
}
