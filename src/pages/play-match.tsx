import { Navigate } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { GameTable } from '@/components/play/game-table'
import { MatchSettingsDrawer } from '@/components/play/match-settings-drawer'
import { useMatchStore } from '@/stores/match-store'
import { useT } from '@/lib/i18n/store'

export function PlayMatchPage() {
  const t = useT()
  const { active, opponentName } = useMatchStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!active) {
    return <Navigate to="/play" replace />
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header
        back={{ to: '/play' }}
        title={opponentName ? `${t.play.match.opponentPrefix} ${opponentName}` : t.play.match.defaultTitle}
        actions={
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label={t.play.match.settingsLabel}
            className="p-2 rounded-md hover:bg-card"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-muted-foreground" />
          </button>
        }
      />
      <div className="flex-1 min-h-0">
        <GameTable />
      </div>
      <MatchSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
