/**
 * ChatRoom Components - 聊天室相關元件統一導出
 * 路徑: sailo/components/chatroom/index.js
 *
 * 功能說明:
 * 集中管理所有聊天室相關元件的導出
 * 方便其他頁面引用,保持程式碼整潔
 *
 * 使用方式:
 * // 方式 1: 導入預設元件
 * import ChatRoom from '@/components/chatroom'
 *
 * // 方式 2: 導入特定元件
 * import { ChatRoom } from '@/components/chatroom'
 *
 * // 方式 3: 導入所有元件
 * import * as ChatRoomComponents from '@/components/chatroom'
 */

// 導出聊天室主元件 (預設)
export { default } from './ChatRoom'
export { default as ChatRoom } from './ChatRoom'

// 未來可新增其他聊天室相關元件
// export { default as MessageBubble } from './MessageBubble'
// export { default as MessageInput } from './MessageInput'
// export { default as ChatHeader } from './ChatHeader'
// export { default as UserTypingIndicator } from './UserTypingIndicator'
