'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import ConfirmModal from '@/components/confirmModal'

const ConfirmContext = createContext(null)

/**
 * 全站共用的確認視窗系統，取代 window.confirm()
 * 用法：const confirmAction = useConfirm()
 *      const ok = await confirmAction('確定要刪除嗎？')
 *      if (ok) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    message: '',
    options: {},
  })
  const resolveRef = useRef(null)

  const confirmAction = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({ isOpen: true, message, options })
    })
  }, [])

  const handleConfirm = () => {
    setState((s) => ({ ...s, isOpen: false }))
    resolveRef.current?.(true)
  }

  const handleCancel = () => {
    setState((s) => ({ ...s, isOpen: false }))
    resolveRef.current?.(false)
  }

  return (
    <ConfirmContext.Provider value={confirmAction}>
      {children}
      <ConfirmModal
        isOpen={state.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={state.options.title || '確認'}
        message={state.message}
        confirmText={state.options.confirmText || '確定'}
        cancelText={state.options.cancelText || '取消'}
        confirmButtonStyle={state.options.confirmButtonStyle}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return ctx
}
