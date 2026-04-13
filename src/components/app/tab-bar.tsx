import { BookOpenIcon, GamepadIcon, SettingsIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const tabs = [
  { to: "/colecao", label: "Collection", icon: BookOpenIcon },
  { to: "/jogar", label: "Play", icon: GamepadIcon },
  { to: "/config", label: "Settings", icon: SettingsIcon },
];

export function TabBar() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop top nav */}
      {!isMobile && (
        <nav className="bg-primary shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center h-14 px-4">
            <span className="font-black text-lg text-white mr-8">
              Pokédex TCG
            </span>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
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
        <nav className="fixed bottom-0 inset-x-0 bg-primary z-40">
          <div className="flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-4 text-xs transition-colors ${isActive ? "text-white font-bold" : "text-white/60"
                  }`
                }
              >
                {() => (
                  <>
                    <div className="relative mb-0.5">
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
  );
}
