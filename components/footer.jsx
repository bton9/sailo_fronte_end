import React from 'react'
import { LuInstagram, LuFacebook, LuYoutube } from 'react-icons/lu'

const Footer = ({
  logo = '',
  slogan = '',
  copyrightYear = '',
  menuLinks = [],
  socialMedia = {},
}) => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 主要內容區 - 橫向排列 */}
        <div className="flex flex-col items-center md:flex-row flex-wrap md:items-start justify-between gap-8 mb-6">
          {/* Logo 和 Slogan */}
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{logo}</h2>
            <p className="text-xs text-gray-600 max-w-xs">{slogan}</p>
          </div>

          {/* 主選單連結 - 橫向排列 */}
          <nav className="flex-grow">
            <ul className="flex flex-col md:flex-row flex-wrap gap-x-6 gap-y-2 justify-center">
              {menuLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* 社群媒體 - 橫向排列 */}
          {Object.keys(socialMedia).length > 0 && (
            <div className="flex items-center gap-4 flex-shrink-0">
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Instagram"
                >
                  <LuInstagram className="w-5 h-5" />
                </a>
              )}
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Facebook"
                >
                  <LuFacebook className="w-5 h-5" />
                </a>
              )}
              {socialMedia.pinterest && (
                <a
                  href={socialMedia.pinterest}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Pinterest"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
              {socialMedia.youtube && (
                <a
                  href={socialMedia.youtube}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="YouTube"
                >
                  <LuYoutube className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* 版權聲明 */}
        <div className="pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-600 text-center">
            © {copyrightYear} {logo}
          </p>
        </div>
      </div>
    </footer>
  )
}

// 示範用法
export default function App() {
  const footerConfig = {
    logo: 'Sailo 享遊',
    slogan: 'Travel in your flow',
    copyrightYear: '2025',
    menuLinks: [
      //主要選單連結
      { label: '首頁', href: '/' },
      { label: '關於我們', href: '/about' },
      { label: '產品服務', href: '/products' },
      { label: '最新消息', href: '/news' },
      { label: '聯絡我們', href: '/contact' },
      //其他連結
      { label: '隱私政策', href: '/privacy' },
      { label: '服務條款', href: '/terms' },
    ],
    socialMedia: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com',
    },
  }

  return (
    <div className=" flex flex-col ">
      {/* Footer 元件 */}
      <Footer {...footerConfig} />
    </div>
  )
}
