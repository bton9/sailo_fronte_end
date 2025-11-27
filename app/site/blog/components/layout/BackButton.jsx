'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';

/**
 * BackButton - 返回按鈕元件
 * 
 * @param {Object} props
 * @param {Function} [props.onClick] - 自訂點擊處理函式 (選填,預設為 router.back())
 * 
 * @example
 * // 預設行為 (返回上一頁)
 * <BackButton />
 * 
 * @example
 * // 自訂返回行為
 * <BackButton onClick={() => router.push('/blog')} />
 */
export default function BackButton({ onClick }) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      // 如果有傳入自訂 onClick,使用自訂處理
      onClick();
    } else {
      // ✅ 檢查是否從新增/編輯頁來的
      if (typeof window !== 'undefined') {
        const fromPostCreate = sessionStorage.getItem('fromPostCreate');
        
        if (fromPostCreate === 'true') {
          // 清除標記
          sessionStorage.removeItem('fromPostCreate');
          // 跳轉到首頁
          router.push('/site/blog');
          return;
        }
      }
      
      // 預設行為:返回上一頁
      router.back();
    }
  };


  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-primary font-semibold mb-4 cursor-pointer hover:text-primary-light transition-colors"
    >
      <FaArrowLeft />
      返回
    </button>
  );
}