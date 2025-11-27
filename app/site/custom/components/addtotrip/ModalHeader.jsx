import { X } from 'lucide-react'

export function ModalHeader({ title, icon: Icon, onClose }) {
  return (
    <div className="relative bg-primary-500 p-6 pb-8">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
      >
        <X size={24} />
      </button>
      <div className="flex items-center gap-3 mt-2">
        <div className="bg-white/20 p-3 rounded-lg">
          <Icon className="text-white" size={28} fill="white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
    </div>
  )
}
