// src/components/app/field-side.tsx
import { useState } from 'react'
import { useGameStore } from '@/game-store'
import type { FieldSide as FieldSideType } from '@/game-data'
import { BoardSlot } from '@/components/app/board-slot'
import { SlotPopover } from '@/components/app/slot-popover'
import { PlusIcon, MinusIcon } from 'lucide-react'

interface FieldSideProps {
  field: FieldSideType
  side: 'my' | 'opponent'
  label: string
}

export function FieldSide({ field, side, label }: FieldSideProps) {
  const addSlot = useGameStore((s) => s.addSlot)
  const removeSlot = useGameStore((s) => s.removeSlot)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const activeSlot = field.slots.find((s) => s.position === 'active')
  const benchSlots = field.slots.filter((s) => s.position === 'bench')
  const selectedSlot = field.slots.find((s) => s.id === selectedSlotId)

  const labelColor = side === 'my' ? 'text-green-500' : 'text-red-500'

  const isOpponent = side === 'opponent'

  const lastBench = benchSlots[benchSlots.length - 1]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-between w-full px-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold ${labelColor}`}>
          {label}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => addSlot(side)}
            className="text-green-500 bg-green-500/10 rounded px-1.5 py-0.5 text-[10px] hover:bg-green-500/20 transition-colors"
          >
            <PlusIcon className="size-3 inline" /> Slot
          </button>
          {lastBench && (
            <button
              onClick={() => removeSlot(side, lastBench.id)}
              className="text-red-500 bg-red-500/10 rounded px-1.5 py-0.5 text-[10px] hover:bg-red-500/20 transition-colors"
            >
              <MinusIcon className="size-3 inline" /> Slot
            </button>
          )}
        </div>
      </div>

      {isOpponent ? (
        <>
          {/* Bench first for opponent */}
          <div className="flex justify-center gap-1 flex-wrap">
            {benchSlots.map((slot, i) => (
              <BoardSlot
                key={slot.id}
                slot={slot}
                label={`B${i + 1}`}
                variant={side}
                onClick={() => setSelectedSlotId(slot.id)}
              />
            ))}
          </div>
          {/* Active below */}
          {activeSlot && (
            <BoardSlot
              slot={activeSlot}
              label="Ativo"
              variant={side}
              onClick={() => setSelectedSlotId(activeSlot.id)}
            />
          )}
        </>
      ) : (
        <>
          {/* Active first for my side */}
          {activeSlot && (
            <BoardSlot
              slot={activeSlot}
              label="Ativo"
              variant={side}
              onClick={() => setSelectedSlotId(activeSlot.id)}
            />
          )}
          {/* Bench below */}
          <div className="flex justify-center gap-1 flex-wrap">
            {benchSlots.map((slot, i) => (
              <BoardSlot
                key={slot.id}
                slot={slot}
                label={`B${i + 1}`}
                variant={side}
                onClick={() => setSelectedSlotId(slot.id)}
              />
            ))}
          </div>
        </>
      )}

      {selectedSlot && (
        <SlotPopover
          slot={selectedSlot}
          side={side}
          label={selectedSlot.position === 'active' ? 'Ativo' : `Banco`}
          open={!!selectedSlotId}
          onOpenChange={(open) => { if (!open) setSelectedSlotId(null) }}
        />
      )}
    </div>
  )
}
