import { useGameStore, type Side } from '@/game-store'
import {
  ENERGY_TYPES, ENERGY_EMOJI, ENERGY_LABEL, ENERGY_COLOR,
  type BoardSlot,
} from '@/game-data'
import { XIcon } from 'lucide-react'

interface SlotPopoverProps {
  slot: BoardSlot
  side: Side
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SlotPopover({ slot, side, label, open, onOpenChange }: SlotPopoverProps) {
  const addDamage = useGameStore((s) => s.addDamage)
  const clearDamage = useGameStore((s) => s.clearDamage)
  const attachEnergy = useGameStore((s) => s.attachEnergy)
  const removeEnergy = useGameStore((s) => s.removeEnergy)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div className={`relative z-10 bg-gray-900/95 border border-gray-700 rounded-2xl p-5 w-[320px] max-w-[90vw] space-y-5 ${side === 'a' ? 'rotate-180' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">{label}</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Damage counter */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Dano</p>
          <div className="flex items-center justify-center gap-2">
            {[-20, -10].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className="w-14 h-10 rounded-lg bg-gray-800 border border-gray-700 text-base font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {amt}
              </button>
            ))}
            <span className="text-3xl font-black text-red-500 w-20 text-center">
              {slot.damage}
            </span>
            {[10, 20].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className="w-14 h-10 rounded-lg bg-gray-800 border border-gray-700 text-base font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Attached energies */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Energias</p>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {slot.energies.map((e, i) => (
              <button
                key={i}
                type="button"
                onClick={() => removeEnergy(side, slot.id, i)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-base hover:opacity-60 transition-opacity"
                style={{ borderColor: ENERGY_COLOR[e], backgroundColor: `${ENERGY_COLOR[e]}20` }}
                title={`Remover ${ENERGY_LABEL[e]}`}
              >
                {ENERGY_EMOJI[e]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ENERGY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => attachEnergy(side, slot.id, type)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>{ENERGY_EMOJI[type]}</span>
                <span>{ENERGY_LABEL[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={() => clearDamage(side, slot.id)}
          className="w-full py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Limpar dano
        </button>
      </div>
    </div>
  )
}
