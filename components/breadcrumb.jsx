import React from 'react'
import { LuChevronRight, LuHouse } from 'react-icons/lu'
import Link from 'next/link'

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null
  }
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <LuChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-800 hover:underline transition-colors flex items-center"
            >
              {index === 0 && item.icon === 'home' && (
                <LuHouse className="w-4 h-4 mr-1" />
              )}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumb
