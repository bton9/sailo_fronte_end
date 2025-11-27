import { useEffect, useRef, useState } from 'react'

export function useLeafletLoader() {
  const leafletRef = useRef(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || leafletLoaded) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      leafletRef.current = window.L
      setLeafletLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.body.removeChild(script)
    }
  }, [leafletLoaded])

  return { leafletRef, leafletLoaded }
}
