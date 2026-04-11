// src/components/app/tab-bar.tsx
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpenIcon, GamepadIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

const tabs = [
  { to: '/colecao', label: 'Coleção', icon: BookOpenIcon },
  { to: '/jogar', label: 'Jogar', icon: GamepadIcon },
]

export function TabBar() {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop top nav */}
      {!isMobile && (
        <nav className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center h-14 px-4">
            <span className="font-black text-lg text-gray-900 mr-8">Pokédex TCG</span>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`
                  }
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Page content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
          <div className="flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                    isActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`mb-0.5 ${isActive ? 'border-t-2 border-gray-900 w-6 -mt-2 pt-1.5' : ''}`}>
                      <tab.icon className="size-5" />
                    </div>
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
