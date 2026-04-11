// src/components/app/energy-indicator.tsx
import { useGameStore } from '@/game-store'
import { ENERGY_EMOJI, ENERGY_LABEL, ENERGY_COLOR, type EnergyType } from '@/game-data'

interface EnergyIndicatorProps {
  side: 'my' | 'opponent'
}

export function EnergyIndicator({ side }: EnergyIndicatorProps) {
  const energy = useGameStore((s) =>
    side === 'my' ? s.currentEnergy : s.opponentEnergy
  )
  const generateEnergy = useGameStore((s) => s.generateEnergy)

  const positionClass = side === 'my'
    ? 'bottom-16 md:bottom-3 right-3'
    : 'top-12 left-3'

  if (!energy) {
    return (
      <button
        onClick={() => generateEnergy(side)}
        className={`absolute z-10 ${positionClass} flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-lg px-2.5 py-1.5 hover:bg-gray-800/90 transition-colors`}
      >
        <span className="text-base">⚡</span>
        <span className="text-[10px] text-gray-400 leading-tight">
          Gerar
        </span>
      </button>
    )
  }

  return (
    <div
      className={`absolute z-10 ${positionClass} flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-lg px-2.5 py-1.5`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
        style={{
          background: `linear-gradient(135deg, ${ENERGY_COLOR[energy]}, ${ENERGY_COLOR[energy]}88)`,
          boxShadow: `0 0 8px ${ENERGY_COLOR[energy]}40`,
        }}
      >
        {ENERGY_EMOJI[energy]}
      </div>
      <div className="text-[10px] leading-tight">
        <div className="font-semibold" style={{ color: ENERGY_COLOR[energy] }}>
          {side === 'my' ? 'Próxima' : 'Próxima'}
        </div>
        <div className="text-gray-400">{ENERGY_LABEL[energy]}</div>
      </div>
    </div>
  )
}
