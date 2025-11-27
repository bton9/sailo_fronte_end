// ==================== components/Toast.jsx ====================
import { Check } from 'lucide-react'

export function Toast({ show, message, type }) {
  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-[120] animate-slideIn">
      <div
        className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] ${
          type === 'success'
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            : type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
        }`}
      >
        <Check className="w-5 h-5" />
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  )
}
