// components/ui/select.jsx

import React from 'react'
// 引入 Radix Select Primitive 組件
import * as SelectPrimitive from '@radix-ui/react-select'
// 引入 Lucide icons
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

// 引入一個處理條件式類別合併的工具函式 (假設路徑正確)
import { cn } from '@/lib/utils'

// 基礎 Select 容器
const Select = SelectPrimitive.Root

// Select 組件的分組容器
const SelectGroup = SelectPrimitive.Group

// Select 顯示當前選定值的組件
const SelectValue = SelectPrimitive.Value

/**
 * @description SelectTrigger 元件：觸發選擇器下拉選單的按鈕
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.ReactNode} props.children - 內容 (通常是 SelectValue)
 * @param {React.Ref<HTMLButtonElement>} ref - 轉發的 ref
 */
const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        // 基礎樣式：flex 佈局、固定高度、全寬度、圓角、邊框、背景色、內邊距、文字大小、焦點環樣式
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className
      )}
      {...props}
    >
      {children}
      {/* 下拉圖標：使用 SelectPrimitive.Icon 包裝 ChevronDown */}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * @description SelectScrollUpButton 元件：下拉內容滾動向上按鈕
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const SelectScrollUpButton = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  )
)
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/**
 * @description SelectScrollDownButton 元件：下拉內容滾動向下按鈕
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const SelectScrollDownButton = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  )
)
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

/**
 * @description SelectContent 元件：下拉選單的內容容器
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.ReactNode} props.children - 內容 (通常是 SelectItem)
 * @param {string} [props.position='popper'] - 定位模式 (popper 或 item-aligned)
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const SelectContent = React.forwardRef(
  ({ className, children, position = 'popper', ...props }, ref) => (
    // 使用 Portal 將內容渲染到 body 外部，防止被父級容器裁剪
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          // 基礎樣式：層級、最大高度、最小寬度、圓角、邊框、背景、陰影、動畫效果
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground bg-white shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          // 針對 'popper' 定位模式添加額外的位移校正
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        {/* 視窗區域：實際顯示選項的區域 */}
        <SelectPrimitive.Viewport
          className={cn(
            '',
            // 針對 'popper' 定位模式調整 Viewport 大小以匹配 Trigger
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
)
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * @description SelectLabel 元件：組件的標籤或分組名稱
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * @description SelectItem 元件：下拉選單中的單個選項
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.ReactNode} props.children - 內容 (選項文本)
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        // 基礎樣式：相對定位、flex 佈局、禁用樣式、焦點樣式
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground',
        className
      )}
      {...props}
    >
      {/* 檢查標記圖標容器 */}
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* 僅在選項被選中時顯示 Check 圖標 */}
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {/* 選項文本內容 */}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
)
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * @description SelectSeparator 元件：選項之間的分隔線
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// 匯出所有組件
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
