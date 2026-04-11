// src/components/app/game-table.tsx
import { useState } from 'react'
import { useGameStore } from '@/game-store'
import { FieldSide } from '@/components/app/field-side'
import { CoinModal } from '@/components/app/coin-modal'
import { EnergyIndicator } from '@/components/app/energy-indicator'
import { XIcon, SkipForwardIcon } from 'lucide-react'

export function GameTable() {
  const format = useGameStore((s) => s.format)
  const modules = useGameStore((s) => s.modules)
  const turn = useGameStore((s) => s.turn)
  const myField = useGameStore((s) => s.myField)
  const opponentField = useGameStore((s) => s.opponentField)
  const endGame = useGameStore((s) => s.endGame)
  const nextTurn = useGameStore((s) => s.nextTurn)

  const [coinOpen, setCoinOpen] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/80">
        <div className="text-gray-400 text-xs">
          {format === 'standard' ? 'Standard' : 'Pocket'} · Turno {turn}
        </div>
        <div className="flex gap-1.5">
          {modules.energy && (
            <button
              onClick={nextTurn}
              className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              <SkipForwardIcon className="size-3" />
              Próximo turno
            </button>
          )}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-xs text-red-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      </div>

      {/* Field area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-1 relative overflow-hidden px-2">
        {/* Opponent field */}
        {modules.board && (
          <FieldSide field={opponentField} side="opponent" label="Adversário" />
        )}

        {/* VS divider */}
        {modules.board && (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-600 text-[10px]">VS</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
        )}

        {/* My field */}
        {modules.board && (
          <FieldSide field={myField} side="my" label="Você" />
        )}

        {/* Energy indicators */}
        {modules.energy && <EnergyIndicator side="opponent" />}
        {modules.energy && <EnergyIndicator side="my" />}

        {/* Coin floating button */}
        {modules.coins && (
          <button
            onClick={() => setCoinOpen(true)}
            className="absolute bottom-16 md:bottom-3 left-3 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
          >
            🪙
          </button>
        )}
      </div>

      {/* Coin modal */}
      <CoinModal open={coinOpen} onOpenChange={setCoinOpen} />

      {/* End game confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center space-y-4">
            <p className="font-bold text-gray-900">Encerrar partida?</p>
            <p className="text-sm text-gray-500">Todo o progresso será perdido.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={endGame}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
