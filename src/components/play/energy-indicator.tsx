import { useGameStore, type Side } from '@/stores/match-store'
import { ENERGY_IMAGE, ENERGY_LABEL } from '@/game-data'

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
        className="flex items-center gap-2 bg-background/90 border border-border rounded-xl px-3 py-2 hover:bg-card/90 transition-colors"
      >
        <span className="text-lg">⚡</span>
        <span className="text-sm text-muted-foreground">Generate</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-background/90 border border-border rounded-xl px-3 py-2">
      <img
        src={ENERGY_IMAGE[energy]}
        alt={ENERGY_LABEL[energy]}
        className="w-8 h-8"
      />
      <div className="text-sm leading-tight">
        <div className="font-semibold text-foreground">
          Energy
        </div>
        <div className="text-muted-foreground">{ENERGY_LABEL[energy]}</div>
      </div>
    </div>
  )
}
