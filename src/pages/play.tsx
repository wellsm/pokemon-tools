// src/pages/play.tsx
import { useGameStore } from '@/game-store'
import { GameSetup } from '@/components/app/game-setup'
import { GameTable } from '@/components/app/game-table'

export function Play() {
  const active = useGameStore((s) => s.active)

  if (active) {
    return <GameTable />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="font-black text-xl text-gray-900">Jogar</h1>
          <p className="text-xs text-gray-400">Configure sua partida</p>
        </div>
      </header>
      <GameSetup />
    </div>
  )
}
