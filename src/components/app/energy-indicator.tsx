import { useGameStore, type Side } from '@/game-store'
import { ENERGY_EMOJI, ENERGY_LABEL, ENERGY_COLOR } from '@/game-data'

interface EnergyIndicatorProps {
  side: Side
}

export function EnergyIndicator({ side }: EnergyIndicatorProps) {
  const energy = useGameStore((s) =>
    side === 'a' ? s.energyA : s.energyB
  )
  const generateEnergy = useGameStore((s) => s.generateEnergy)

  if (!energy) {
    return (
      <button
        onClick={() => generateEnergy(side)}
        className="flex items-center gap-2 bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-800/90 transition-colors"
      >
        <span className="text-lg">⚡</span>
        <span className="text-sm text-gray-400">Gerar</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-base"
        style={{
          background: `linear-gradient(135deg, ${ENERGY_COLOR[energy]}, ${ENERGY_COLOR[energy]}88)`,
          boxShadow: `0 0 8px ${ENERGY_COLOR[energy]}40`,
        }}
      >
        {ENERGY_EMOJI[energy]}
      </div>
      <div className="text-sm leading-tight">
        <div className="font-semibold" style={{ color: ENERGY_COLOR[energy] }}>
          Energia
        </div>
        <div className="text-gray-400">{ENERGY_LABEL[energy]}</div>
      </div>
    </div>
  )
}
