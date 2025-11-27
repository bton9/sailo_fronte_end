'use client'

import * as FaIcons from 'react-icons/fa6'

export default function TabNavigation({
  tabs = [],
  activeTab = '',
  onTabChange = () => {},
  className = '',
  variant = 'feed', // 'feed' 或 'profile'
}) {
  return (
    <div className={`bg-transparent border-b-2 border-primary flex overflow-hidden ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value
        const Icon = tab.icon

        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`flex-1 py-4 bg-transparent border-none text-base font-semibold transition-all ${
              isActive
                ? 'text-primary border-b-[3px] border-primary'
                : 'text-gray-600 border-b-[3px] border-transparent hover:bg-primary/5'
            }`}
          >
            {Icon && <Icon className="inline mr-2" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}