'use client'

import { useState, useEffect } from 'react'

/**
 * Animated TripWeatherCard Component
 * Displays current weather with video background animations
 * Minimal design inspired by the screenshot
 */

export default function TripWeatherCard({ city }) {
  const [weather, setWeather] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  //  IMPORTANT: Replace with your actual API key
  const API_KEY = '1c163c5d5df7a9530b14864ffccb2230'
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

  /**
   * City name translation map (Chinese → English)
   */
  const cityTranslationMap = {
    // Taiwan
    台北: 'Taipei',
    台北市: 'Taipei',
    新北: 'New Taipei',
    新北市: 'New Taipei',
    桃園: 'Taoyuan',
    桃園市: 'Taoyuan',
    台中: 'Taichung',
    台中市: 'Taichung',
    台南: 'Tainan',
    台南市: 'Tainan',
    高雄: 'Kaohsiung',
    高雄市: 'Kaohsiung',

    // Japan
    東京: 'Tokyo',
    大阪: 'Osaka',
    京都: 'Kyoto',
    北海道: 'Hokkaido',
    沖繩: 'Okinawa',

    // Korea
    首爾: 'Seoul',
    釜山: 'Busan',
    濟州: 'Jeju',

    // China
    北京: 'Beijing',
    上海: 'Shanghai',
    廣州: 'Guangzhou',
    深圳: 'Shenzhen',
    香港: 'Hong Kong',
    澳門: 'Macau',

    // Southeast Asia
    曼谷: 'Bangkok',
    新加坡: 'Singapore',
    吉隆坡: 'Kuala Lumpur',
    河內: 'Hanoi',
    胡志明市: 'Ho Chi Minh City',

    // Europe
    倫敦: 'London',
    巴黎: 'Paris',
    羅馬: 'Rome',
    柏林: 'Berlin',
    阿姆斯特丹: 'Amsterdam',

    // Americas
    紐約: 'New York',
    洛杉磯: 'Los Angeles',
    舊金山: 'San Francisco',
    多倫多: 'Toronto',
    溫哥華: 'Vancouver',
    渥太華: 'Ottawa',

    // Oceania
    雪梨: 'Sydney',
    墨爾本: 'Melbourne',
    奧克蘭: 'Auckland',
  }

  /**
   * Get video URL based on weather condition
   * Using free video sources from Pexels
   */
  const getWeatherVideo = (main) => {
    const LOCAL_VIDEOS = {
      Clear: '/videos/bg-sunny.mp4',
      Clouds: '/videos/bg-cloudy.mp4',
      Rain: '/videos/bg-rainy.mp4',
      Drizzle: '/videos/bg-rainy.mp4',
      Thunderstorm: '/videos/bg-rainy.mp4',
      Snow: '/videos/snow.mp4',
      Mist: '/videos/bg-foggy.mp4',
      Fog: '/videos/bg-foggy.mp4',
    }
    return LOCAL_VIDEOS[main] || LOCAL_VIDEOS['Clear']

    // // ===== 選項 2: 線上影片 (Pixabay) =====
    // const ONLINE_VIDEOS = {
    //   Clear:
    //     'https://cdn.pixabay.com/video/2022/11/07/137490-768599331_large.mp4',
    //   Clouds:
    //     'https://cdn.pixabay.com/video/2020/05/01/37055-415581302_large.mp4',
    //   Rain: 'https://cdn.pixabay.com/video/2021/08/10/84415-587050204_large.mp4',
    //   Drizzle:
    //     'https://cdn.pixabay.com/video/2021/08/10/84415-587050204_large.mp4',
    //   Thunderstorm:
    //     'https://cdn.pixabay.com/video/2020/01/18/31232-385044917_large.mp4',
    //   Snow: 'https://cdn.pixabay.com/video/2022/11/09/138167-770906814_large.mp4',
    //   Mist: 'https://cdn.pixabay.com/video/2020/05/01/37055-415581302_large.mp4',
    //   Fog: 'https://cdn.pixabay.com/video/2020/05/01/37055-415581302_large.mp4',
    // }

    // return ONLINE_VIDEOS[main] || ONLINE_VIDEOS['Clear']
  }

  /**
   * Translate city name
   */
  const translateCityName = (cityName) => {
    if (!cityName) return ''
    const cleaned = cityName.trim().replace(/市$/, '')
    return cityTranslationMap[cleaned] || cityName.trim()
  }

  /**
   * Weather translation
   */
  const translateWeather = (description, main) => {
    const weatherMap = {
      Clear: '晴天',
      Clouds: '多雲',
      Rain: '雨天',
      Drizzle: '細雨',
      Thunderstorm: '雷雨',
      Snow: '下雪',
      Mist: '薄霧',
      Fog: '濃霧',
      Haze: '霾',
    }
    return weatherMap[main] || main
  }

  /**
   * Get weather icon (SVG for better quality)
   */
  const WeatherIcon = ({ weatherType }) => {
    const icons = {
      Clear: (
        <svg
          className="w-20 h-20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
      Clouds: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
        >
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      ),
      Rain: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <line x1="8" y1="19" x2="8" y2="21" />
          <line x1="8" y1="13" x2="8" y2="15" />
          <line x1="16" y1="19" x2="16" y2="21" />
          <line x1="16" y1="13" x2="16" y2="15" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="12" y1="15" x2="12" y2="17" />
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
        </svg>
      ),
      Drizzle: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <line x1="8" y1="19" x2="8" y2="21" />
          <line x1="16" y1="19" x2="16" y2="21" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
        </svg>
      ),
      Thunderstorm: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
          <polyline points="13 11 9 17 15 17 11 23" />
        </svg>
      ),
      Snow: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
          <line x1="8" y1="16" x2="8.01" y2="16" />
          <line x1="8" y1="20" x2="8.01" y2="20" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
          <line x1="12" y1="22" x2="12.01" y2="22" />
          <line x1="16" y1="16" x2="16.01" y2="16" />
          <line x1="16" y1="20" x2="16.01" y2="20" />
        </svg>
      ),
      Mist: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="3" y1="21" x2="21" y2="21" />
        </svg>
      ),
      Fog: (
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="3" y1="21" x2="21" y2="21" />
        </svg>
      ),
    }

    return icons[weatherType] || icons['Clear']
  }

  /**
   * Fetch weather data
   */
  useEffect(() => {
    const fetchWeather = async () => {
      console.log('🔍 fetchWeather called with city:', city)

      if (!city || !city.trim()) {
        console.log(' No city provided')
        setLoading(false)
        return
      }

      if (API_KEY === 'YOUR_API_KEY_HERE') {
        setError('請設定 API Key')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const englishCityName = translateCityName(city)
        console.log('🌍 Translated city name:', englishCityName)

        const apiUrl = `${BASE_URL}?q=${encodeURIComponent(englishCityName)}&appid=${API_KEY}&units=metric&lang=zh_tw`
        console.log('🔗 API URL:', apiUrl.replace(API_KEY, 'API_KEY_HIDDEN'))

        const response = await fetch(apiUrl)
        console.log('📡 Response status:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json()
          console.error(' API Error:', errorData)
          throw new Error(
            `無法取得天氣資料: ${errorData.message || response.statusText}`
          )
        }

        const data = await response.json()
        console.log(' Weather data received:', data)

        const weatherInfo = {
          city: data.name,
          temp: Math.round(data.main.temp),
          weather: data.weather[0].main,
          description: data.weather[0].description,
        }

        setWeather(weatherInfo)
        console.log(' Weather state updated:', weatherInfo)

        //  Emit event with weather data
        window.dispatchEvent(
          new CustomEvent('weatherUpdated', {
            detail: weatherInfo,
          })
        )

        console.log(' Weather event dispatched')
      } catch (err) {
        console.error(' Weather fetch error:', err)
        setError(err.message || '無法取得天氣資料')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [city])

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full h-[280px] rounded-3xl overflow-hidden bg-primary-300">
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white text-lg">載入天氣資料中...</div>
        </div>
      </div>
    )
  }

  // Error or no data
  if (error || !weather) {
    return (
      <div className="relative w-full h-[280px] rounded-3xl overflow-hidden bg-primary-300">
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white text-center">
            <p className="text-lg mb-2">😕 無法取得天氣資料</p>
            <p className="text-sm opacity-80">請確認城市名稱是否正確</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[280px] overflow-hidden shadow-2xl ">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src={getWeatherVideo(weather?.weather || 'Clear')}
          type="video/mp4"
        />
        {/*                              ^^^^^^^^^^^^^^ - Added optional chaining and fallback */}
      </video>

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Location with pin icon - Top Left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 text-white">
        <span className="text-base font-light tracking-wide">目前當地天氣</span>
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>

      {/* Content - Centered */}
      <div className="relative h-full flex flex-col items-center justify-center text-white">
        {/* Weather Icon */}
        <div className="mb-4 drop-shadow-sm">
          <WeatherIcon weatherType={weather.weather} />
        </div>

        {/* Temperature */}
        <div className="text-2xl font-light mb-1 drop-shadow-sm">
          {weather.temp}°C
        </div>

        {/* Weather Description (Optional - can be removed for even more minimal look) */}
        <div className="text-lg font-light opacity-90 drop-shadow">
          {translateWeather(weather.description, weather.weather)}
        </div>
      </div>

      {/* Subtle gradient overlay at bottom for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  )
}
