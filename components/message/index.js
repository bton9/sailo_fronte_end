/**
 * Message Components - 訊息相關元件統一導出
 * 路徑: sailo/components/message/index.js
 *
 * 功能說明:
 * 集中管理所有訊息相關元件的導出
 * 方便其他頁面引用,保持程式碼整潔
 *
 * 使用方式:
 * // 方式 1: 導入特定元件
 * import { FloatingChatButton } from '@/components/message'
 *
 * // 方式 2: 導入預設元件
 * import FloatingChatButton from '@/components/message'
 *
 * // 方式 3: 導入所有元件
 * import * as MessageComponents from '@/components/message'
 */

// 導出浮動聊天按鈕 (主要元件)
export { default } from './FloatingChatButton'
export { default as FloatingChatButton } from './FloatingChatButton'

// 導出包裝元件 (用於 Layout)
export { default as ChatButtonWrapper } from './ChatButtonWrapper'

// 未來可新增其他訊息相關元件
// export { default as ChatWindow } from './ChatWindow'
// export { default as MessageList } from './MessageList'
// export { default as MessageInput } from './MessageInput'
