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
        className="flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-lg px-2.5 py-1.5 hover:bg-gray-800/90 transition-colors"
      >
        <span className="text-base">⚡</span>
        <span className="text-[10px] text-gray-400 leading-tight">
          Gerar
        </span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-lg px-2.5 py-1.5">
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
          Energia
        </div>
        <div className="text-gray-400">{ENERGY_LABEL[energy]}</div>
      </div>
    </div>
  )
}
