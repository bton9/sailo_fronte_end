// ==================== components/CreateListModal.jsx ====================
import { useState } from 'react'
import { Edit3 } from 'lucide-react'
import { ModalHeader } from './ModalHeader'

export function CreateListModal({ onSubmit, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('請輸入清單名稱')
      return
    }
    onSubmit(name, description)
    setName('')
    setDescription('')
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p  -4">
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden animate-slideUp">
        <ModalHeader title="新增清單" icon={Edit3} onClose={onClose} />
        <div className="px-6 pb-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              清單名稱 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 focus:border-secondary-600 outline-none"
              placeholder="例如:高雄景點收藏"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              清單說明(選填)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 150))}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 focus:border-secondary-600 outline-none resize-none"
            />
          </div>
        </div>
        <div className="p-6">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-4 bg-primary-500 text-white font-bold text-lg hover:scale-105 transition disabled:opacity-50"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  )
}
