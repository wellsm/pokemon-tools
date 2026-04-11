// src/components/app/slot-popover.tsx
import { useGameStore } from '@/game-store'
import {
  ENERGY_TYPES, ENERGY_EMOJI, ENERGY_LABEL, ENERGY_COLOR,
  type BoardSlot, type EnergyType,
} from '@/game-data'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer'

interface SlotPopoverProps {
  slot: BoardSlot
  side: 'my' | 'opponent'
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SlotPopover({ slot, side, label, open, onOpenChange }: SlotPopoverProps) {
  const addDamage = useGameStore((s) => s.addDamage)
  const clearDamage = useGameStore((s) => s.clearDamage)
  const attachEnergy = useGameStore((s) => s.attachEnergy)
  const removeEnergy = useGameStore((s) => s.removeEnergy)
  const swapToActive = useGameStore((s) => s.swapToActive)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerDescription>
            {side === 'my' ? 'Seu campo' : 'Campo adversário'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {/* Damage counter */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Dano</p>
            <div className="flex items-center justify-center gap-2">
              {[-20, -10].map((amt) => (
                <button
                  key={amt}
                  onClick={() => addDamage(side, slot.id, amt)}
                  className="w-12 h-9 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {amt}
                </button>
              ))}
              <span className="text-2xl font-black text-red-500 w-16 text-center">
                {slot.damage}
              </span>
              {[10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => addDamage(side, slot.id, amt)}
                  className="w-12 h-9 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Attached energies */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Energias atreladas</p>
            <div className="flex flex-wrap gap-2 items-center">
              {slot.energies.map((e, i) => (
                <button
                  key={i}
                  onClick={() => removeEnergy(side, slot.id, i)}
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-sm hover:opacity-60 transition-opacity"
                  style={{ borderColor: ENERGY_COLOR[e], backgroundColor: `${ENERGY_COLOR[e]}20` }}
                  title={`Remover ${ENERGY_LABEL[e]}`}
                >
                  {ENERGY_EMOJI[e]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {ENERGY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { attachEnergy(side, slot.id, type); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span>{ENERGY_EMOJI[type]}</span>
                  <span>{ENERGY_LABEL[type]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { clearDamage(side, slot.id); }}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Limpar dano
            </button>
            {slot.position === 'bench' && (
              <button
                onClick={() => { swapToActive(side, slot.id); onOpenChange(false); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Mover p/ Ativo
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
