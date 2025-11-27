'use client'

import { useEffect, useState } from 'react'

/**
 * RainEffect Component
 * Creates an animated rain effect with falling raindrops
 * Integrates with weather API to show rain when it's actually raining
 */
export default function RainEffect() {
  const [raindrops, setRaindrops] = useState([])

  useEffect(() => {
    let raindropId = 0

    const createRaindrop = () => {
      const newRaindrop = {
        id: raindropId++,
        left: Math.random() * window.innerWidth,
        duration: Math.random() * 1 + 0.5, // Duration between 0.5s to 1.5s
      }

      setRaindrops((prev) => [...prev, newRaindrop])

      // Remove raindrop after animation completes
      setTimeout(() => {
        setRaindrops((prev) =>
          prev.filter((drop) => drop.id !== newRaindrop.id)
        )
      }, newRaindrop.duration * 1000)
    }

    // Create raindrops every 50ms
    const interval = setInterval(createRaindrop, 50)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Raindrops */}
      {raindrops.map((raindrop) => (
        <div
          key={raindrop.id}
          className="absolute w-[2px] h-[15px] bg-secondary-600 opacity-60 animate-fall"
          style={{
            left: `${raindrop.left}px`,
            top: '-15px',
            animationDuration: `${raindrop.duration}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(110vh);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  )
}
