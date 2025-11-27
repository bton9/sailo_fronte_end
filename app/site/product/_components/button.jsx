import * as React from "react";
// 引入 Radix UI 的 Slot，用於實現 asChild 屬性
import { Slot } from "@radix-ui/react-slot";
// 引入 cva 來管理 Tailwind 類別的變體
import { cva } from "class-variance-authority";

// 引入一個處理條件式類別合併的工具函式 (假設路徑正確)
import { cn } from "@/lib/utils";

/**
 * @description 定義 Button 元件的所有樣式變體
 */
const buttonVariants = cva(
  // 基礎樣式：flex 佈局、圓角、文字、過渡效果、焦點環和禁用狀態
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    // 變體樣式定義
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    // 預設樣式
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * @typedef {object} ButtonProps
 * @property {string} [className] - 自訂類別字串
 * @property {'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'} [variant] - 按鈕樣式
 * @property {'default'|'sm'|'lg'|'icon'} [size] - 按鈕尺寸
 * @property {boolean} [asChild=false] - 是否渲染為子元件 (使用 Slot)
 */

/**
 * @description Button 元件，使用 React.forwardRef 實現轉發 ref
 * @param {ButtonProps} props - 元件屬性
 * @param {React.Ref<HTMLButtonElement>} ref - 轉發的 ref
 * @returns {JSX.Element}
 */
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // 根據 asChild 決定渲染 <Slot> 還是 <button>
    const Comp = asChild ? Slot : "button";
    
    // 合併 cva 產生的樣式和自訂的 className
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
