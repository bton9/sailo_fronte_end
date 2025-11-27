// app/site/product/_components/toastProvider.jsx

'use client'

import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react'

// 1. 創建 Context
const ToastContext = createContext(null)

// 2. Hook
export const useToast = () => useContext(ToastContext)

// 3. Provider
export const ToastProvider = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [toastData, setToastData] = useState({})
  const timerRef = useRef(0)

  // 簡易 showToast 用舊介面（不變邏輯）
  const showToast = ({ title, description, type = 'success' }) => {
    setToastData({ title, description, type })
    setOpen(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setOpen(true)
    }, 100)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  // 樣式 grid，官方格式
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className="
            grid grid-cols-[auto_max-content]
            items-center gap-x-[15px] rounded-md bg-white p-[15px]
            shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]
            [grid-template-areas:_'title_action'_'description_action']
            data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
            data-[state=closed]:animate-hide data-[state=open]:animate-slideIn
            data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]
          "
        >
          <Toast.Title className="mb-[5px] text-[15px] font-medium text-slate-700 [grid-area:_title]">
            {toastData.title ?? '操作訊息'}
          </Toast.Title>

          <Toast.Description asChild>
            <span className="m-0 text-[13px] leading-[1.3] text-slate-600 [grid-area:_description]">
              {toastData.description}
            </span>
          </Toast.Description>

          <Toast.Action
            className="[grid-area:_action]"
            asChild
            altText="關閉通知"
          >
            <button className="inline-flex h-[25px] items-center justify-center rounded px-2.5 text-xs font-medium leading-[25px] text-primary-500 hover:opacity-80 focus:outline-none">
              <X className="w-4 h-4" />
            </button>
          </Toast.Action>
        </Toast.Root>

        <Toast.Viewport
          className="
            fixed top-0 right-0 z-[100] m-0 flex w-[390px] max-w-[100vw]
            list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none
            [--viewport-padding:_25px]
          "
        />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
