import * as React from "react";

// 引入一個處理條件式類別合併的工具函式 (假設路徑正確)
import { cn } from "@/lib/utils";

/**
 * @description Card 元件：卡片的主容器
 * 使用 React.forwardRef 實現轉發 ref
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  // 基礎樣式：圓角、邊框、背景色、文字顏色和陰影
  <div ref={ref} className={cn(" bg-card text-card-foreground ", className)} {...props} />
));
Card.displayName = "Card";

/**
 * @description CardHeader 元件：卡片的頭部區塊
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    // 基礎樣式：flex 垂直排列，設定間距和內邊距 (p-6)
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

/**
 * @description CardTitle 元件：卡片的標題
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLHeadingElement>} ref - 轉發的 ref
 */
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    // 渲染為 <h3> 標籤，設定字體大小、粗細、行高和字母間距
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

/**
 * @description CardDescription 元件：卡片的副標題或描述
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLParagraphElement>} ref - 轉發的 ref
 */
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    // 渲染為 <p> 標籤，設定字體大小和前景色
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

/**
 * @description CardContent 元件：卡片的內容區塊
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

/**
 * @description CardFooter 元件：卡片的底部區塊
 * @param {object} props - 屬性
 * @param {string} [props.className] - 自訂類別字串
 * @param {React.Ref<HTMLDivElement>} ref - 轉發的 ref
 */
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    // 基礎樣式：flex 佈局，垂直居中，內邊距 (p-6)，頂部內邊距設為 0 (pt-0)
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

// 匯出所有元件，供外部使用
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
