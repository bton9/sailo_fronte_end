'use client'
import { Check, XCircle } from 'lucide-react'
import { useWishlistContext } from '@/contexts/WishlistContext'

export default function Toast() {
  const { toast } = useWishlistContext()

  if (!toast.show) return null

  return (
    <div className="fixed top-4 right-4 z-[200] animate-slideIn">
      <div
        className={`px-6 py-4 rounded-2xl flex items-center gap-3 text-white shadow-lg
      ${
        toast.type === 'success'
          ? 'bg-green-600'
          : toast.type === 'error'
            ? 'bg-red-600'
            : 'bg-blue-600'
      }`}
      >
        <Check size={18} />
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
