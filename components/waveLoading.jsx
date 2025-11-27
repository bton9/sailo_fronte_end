/**
 * WaveLoading - 使用 iframe 引入原始 HTML 動畫
 * 
 * @param {string} text - 顯示的載入文字 (預設: "Loading")
 * 
 * 使用範例:
 * ```jsx
 * import WaveLoading from '@/components/WaveLoading'
 * 
 * <WaveLoading />
 * <WaveLoading text="載入中..." />
 * ```
 */
'use client'

export default function WaveLoading({ text = "Loading" }) {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <iframe
        src="/wave.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        title="Loading Animation"
      />
      
      {/* 如果需要自訂文字,可以覆蓋在 iframe 上方 */}
      {text !== "Loading" && (
        <div style={{
          position: 'absolute',
          bottom: '30vh',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#374151',
          zIndex: 10
        }}>
          {text}
        </div>
      )}
    </div>
  )
}