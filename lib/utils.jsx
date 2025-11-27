// lib/utils.js

// 引入 clsx，用於處理條件式類別
import { clsx } from "clsx";
// 引入 twMerge，用於合併 Tailwind 類別並自動解決樣式衝突
import { twMerge } from "tailwind-merge";

/**
 * @description cn 函式：將多個類別字串或條件式類別合併成一個優化且無衝突的字串
 * @param {...(string | string[] | { [key: string]: boolean } | undefined | null)} inputs - 任意數量的類別輸入，可以是字串、陣列或物件
 * @returns {string} 合併後的 CSS 類別字串
 */
export function cn(...inputs) {
  // 1. 使用 clsx 處理所有條件式類別，生成一個基礎的類別字串
  // 2. 使用 twMerge 處理這個字串，並解決 Tailwind CSS 類別之間的衝突（例如，同時定義 'p-4' 和 'p-6' 時，保留後者）
  return twMerge(clsx(inputs));
}