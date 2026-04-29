import { Navigate } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { GameTable } from '@/components/play/game-table'
import { MatchSettingsDrawer } from '@/components/play/match-settings-drawer'
import { useMatchStore } from '@/stores/match-store'

export function PlayMatchPage() {
  const active = useMatchStore((s) => s.active)
  const opponentName = useMatchStore((s) => s.opponentName)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!active) return <Navigate to="/play" replace />

  return (
    <div className="min-h-screen">
      <Header
        back={{ to: '/play' }}
        title={opponentName ? `vs ${opponentName}` : 'Match'}
        actions={
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Match settings"
            className="p-2 rounded-md hover:bg-surface-container"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 text-on-surface-variant" />
          </button>
        }
      />
      <GameTable />
      <MatchSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
