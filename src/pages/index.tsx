import { Folder, Gamepad2, Settings as SettingsIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { TacticalCard } from '@/components/shared/tactical-card'
import { StatusPanel } from '@/components/shared/status-panel'
import { useMatchStore } from '@/stores/match-store'
import { useT } from '@/lib/i18n/store'

export function IndexPage() {
  const t = useT()
  const { active: hasMatch } = useMatchStore()

  return (
    <div className="min-h-screen pb-12">
      <Header
        actions={
          <Link
            to="/settings"
            aria-label={t.header.settings}
            className="p-2 rounded-md hover:bg-card"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-muted-foreground" />
          </Link>
        }
      />
      <main className="mt-6 px-4 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TacticalCard
            icon={Folder}
            decorIcon={Folder}
            title={t.index.binder.title}
            subtitle={t.index.binder.subtitle}
            cta={t.index.binder.cta}
            to="/binder"
          />
          <TacticalCard
            icon={Gamepad2}
            decorIcon={Gamepad2}
            title={t.index.battle.title}
            subtitle={t.index.battle.subtitle}
            cta={t.index.battle.cta}
            to={hasMatch ? '/play' : '/play/new'}
            badge={hasMatch ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1
                               rounded-full bg-secondary text-secondary-foreground">
                {t.index.battle.inProgress}
              </span>
            ) : undefined}
          />
        </div>
      </main>
    </div>
  )
}
