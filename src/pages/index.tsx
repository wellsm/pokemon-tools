import { Folder, Gamepad2, Settings as SettingsIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { TacticalCard } from '@/components/shared/tactical-card'
import { StatusPanel } from '@/components/shared/status-panel'
import { useMatchStore } from '@/stores/match-store'

export function IndexPage() {
  const hasMatch = useMatchStore((s) => s.active)

  return (
    <div className="min-h-screen pb-12">
      <Header
        actions={
          <Link
            to="/settings"
            aria-label="Settings"
            className="p-2 rounded-md hover:bg-surface-container"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-on-surface-variant" />
          </Link>
        }
      />
      <main className="px-4 max-w-screen-md mx-auto">
        <p className="mt-8 text-xs font-bold uppercase tracking-wider text-primary-container">
          System Online
        </p>
        <h1 className="mt-2 text-5xl font-extrabold leading-tight text-on-surface">
          Welcome<br/>back, Trainer.
        </h1>
        <div className="mt-3 h-1 w-12 bg-primary-container rounded-full" />

        <div className="mt-10 flex flex-col gap-4">
          <TacticalCard
            icon={Folder}
            decorIcon={Folder}
            title="Binder Manager"
            subtitle="Manage collections & master sets."
            cta="Initialize Data"
            to="/binder"
          />
          <TacticalCard
            icon={Gamepad2}
            decorIcon={Gamepad2}
            title="Battle Assistant"
            subtitle="Track damage, status & energy."
            cta="Launch Interface"
            to="/play"
            badge={hasMatch ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1
                               rounded-full bg-secondary-container text-on-secondary-container">
                In Progress
              </span>
            ) : undefined}
          />
        </div>

        <div className="mt-10">
          <StatusPanel />
        </div>
      </main>
    </div>
  )
}
