// src/pages/play.tsx
import { useGameStore } from '@/game-store'
import { GameSetup } from '@/components/app/game-setup'

export function Play() {
  const active = useGameStore((s) => s.active)

  if (!active) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16 md:pb-0">
      <p className="text-gray-400">Mesa ativa — em construção</p>
    </div>
  )
}
