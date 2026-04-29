import { Header } from '@/components/layout/header'
import { GameSetup } from '@/components/play/game-setup'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/stores/match-store'
import { useState } from 'react'

export function PlaySetupPage() {
  const navigate = useNavigate()
  const startMatch = useMatchStore((s) => s.startMatch)
  const [opponentName, setOpponentName] = useState('')

  function handleStart() {
    startMatch({ opponentName: opponentName.trim() || undefined })
    navigate('/play/match')
  }

  return (
    <div className="min-h-screen">
      <Header back={{ to: '/play' }} title="New Battle" />
      <main className="px-4 max-w-screen-md mx-auto mt-6">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Opponent Name (optional)
          </span>
          <input
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            placeholder="AshK123"
            className="mt-1 w-full px-3 py-2 rounded-md bg-surface-container
                       border border-outline-variant focus:border-primary-container outline-none text-on-surface"
          />
        </label>
        <div className="mt-6">
          <GameSetup onComplete={handleStart} />
        </div>
      </main>
    </div>
  )
}
