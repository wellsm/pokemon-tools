import { NavLink, Outlet } from 'react-router-dom'
import { BookOpenIcon, GamepadIcon, SettingsIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

const tabs = [
  { to: '/colecao', label: 'Coleção', icon: BookOpenIcon },
  { to: '/jogar', label: 'Jogar', icon: GamepadIcon },
  { to: '/config', label: 'Config', icon: SettingsIcon },
]

export function TabBar() {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isMobile && (
        <nav className="bg-card border-b border-border shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center h-14 px-4">
            <span className="font-black text-lg text-foreground mr-8">Pokédex TCG</span>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
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

      <div className="flex-1">
        <Outlet />
      </div>

      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-40">
          <div className="flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`mb-0.5 ${isActive ? 'border-t-2 border-primary w-6 -mt-2 pt-1.5' : ''}`}>
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
