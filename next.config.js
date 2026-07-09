/** @type {import('next').NextConfig} */
const nextConfig = {
  // 關閉React Strict Mode工具(避免useEffect執行兩次)
  devIndicators: false,
  reactStrictMode: false,
  // eslint設定
  eslint: {
    // 警告: 開啟以下的設定將會忽略所有在build時的eslint錯誤與警告，不建議在部署時直接使用，或請先自行修正eslint相關錯誤與警告
    ignoreDuringBuilds: true,
  },
  // sass設定，修正新版本sass導致的過多棄用警告訊息
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  // output: 'export', // 導出靜態頁面(SPA) 無法使用`next start`或 api路由
  // distDir: 'dist', // 導出路徑
  // 把 /api、/uploads 代理到後端，讓瀏覽器看到的請求都是「同網域」。
  // 前後端本來是不同網域（Vercel / Render），Safari 會把後端設定的
  // httpOnly cookie 當成跨網站 cookie 不穩定地擋掉（帳密登入、Google
  // 登入在 Safari 上都遇過：登入當下看似成功，後續請求卻讀不到
  // cookie）。代理後 cookie 由前端自己網域設定，就不再是第三方 cookie。
  // Socket.IO 走 NEXT_PUBLIC_SOCKET_URL 直連後端，不受影響。
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:5000'
    return [
      { source: '/api/:path*', destination: `${backendOrigin}/api/:path*` },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ]
  },
  experimental: {
    esmExternals: true,
  },
}

export default nextConfig
