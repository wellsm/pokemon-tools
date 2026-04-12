import { useGameStore } from '@/game-store'
import { GameSetup } from '@/components/app/game-setup'
import { GameTable } from '@/components/app/game-table'

export function Play() {
  const active = useGameStore((s) => s.active)
  const format = useGameStore((s) => s.format)
  const turn = useGameStore((s) => s.turn)

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 flex flex-col">
      <header className="bg-primary border-b border-white/10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="font-black text-xl text-white">Jogar</h1>
          <p className="text-xs text-white/70">
            {active
              ? `${format === 'standard' ? 'Standard' : 'Pocket'} · Turno ${turn}`
              : 'Configure sua partida'}
          </p>
        </div>
      </header>
      {active ? <GameTable /> : <GameSetup />}
    </div>
  )
}
