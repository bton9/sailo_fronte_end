'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const NotificationContext = createContext(null)

/**
 * 全站共用的 Toast 通知系統，取代 window.alert()
 * 用法：const notify = useNotify(); notify('訊息', 'error' | 'success' | 'info')
 */
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message, type = 'info') => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => dismiss(id), 3000)
    },
    [dismiss]
  )

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 shadow-lg text-white max-w-sm ${
              toast.type === 'error'
                ? 'bg-red-600'
                : toast.type === 'success'
                  ? 'bg-green-600'
                  : 'bg-secondary-900'
            }`}
          >
            {toast.type === 'error' ? (
              <XCircle size={18} className="flex-shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle size={18} className="flex-shrink-0" />
            ) : (
              <Info size={18} className="flex-shrink-0" />
            )}
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-2 flex-shrink-0 opacity-70 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotify must be used within NotificationProvider')
  }
  return ctx
}
