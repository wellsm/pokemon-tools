import { useState, useRef, useCallback } from 'react'
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
  const swapSlots = useGameStore((s) => s.swapSlots)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [dragFromId, setDragFromId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Touch drag state
  const touchDragId = useRef<string | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const isDraggingTouch = useRef(false)

  const handleDrop = useCallback((targetId: string) => {
    if (dragFromId && dragFromId !== targetId) {
      swapSlots(side, dragFromId, targetId)
    }
    setDragFromId(null)
    setDragOverId(null)
  }, [dragFromId, side, swapSlots])

  const handleTouchStart = useCallback((slotId: string, e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    touchDragId.current = slotId
    isDraggingTouch.current = false
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchDragId.current || !isDraggingTouch.current) {
      touchDragId.current = null
      touchStartPos.current = null
      isDraggingTouch.current = false
      setDragFromId(null)
      setDragOverId(null)
      return
    }

    const touch = e.changedTouches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    const slotEl = target?.closest('[data-slot-id]') as HTMLElement | null
    const targetId = slotEl?.dataset.slotId

    if (targetId && touchDragId.current !== targetId) {
      swapSlots(side, touchDragId.current, targetId)
    }

    touchDragId.current = null
    touchStartPos.current = null
    isDraggingTouch.current = false
    setDragFromId(null)
    setDragOverId(null)
  }, [side, swapSlots])

  // Detect touch move to distinguish tap from drag
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current || !touchDragId.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPos.current.x)
    const dy = Math.abs(touch.clientY - touchStartPos.current.y)
    if (dx > 8 || dy > 8) {
      isDraggingTouch.current = true
      setDragFromId(touchDragId.current)

      // Detect what we're over
      const target = document.elementFromPoint(touch.clientX, touch.clientY)
      const slotEl = target?.closest('[data-slot-id]') as HTMLElement | null
      const overId = slotEl?.dataset.slotId ?? null
      setDragOverId(overId !== touchDragId.current ? overId : null)
    }
  }, [])

  const activeSlot = field.slots.find((s) => s.position === 'active')
  const benchSlots = field.slots.filter((s) => s.position === 'bench')
  const selectedSlot = field.slots.find((s) => s.id === selectedSlotId)

  const labelColor = side === 'my' ? 'text-green-500' : 'text-red-500'
  const isOpponent = side === 'opponent'
  const lastBench = benchSlots[benchSlots.length - 1]

  function renderSlot(slot: typeof field.slots[number], slotLabel: string) {
    return (
      <BoardSlot
        key={slot.id}
        slot={slot}
        label={slotLabel}
        variant={side}
        onClick={() => { if (!isDraggingTouch.current) setSelectedSlotId(slot.id) }}
        isDragging={dragFromId === slot.id}
        isDragOver={dragOverId === slot.id}
        onDragStart={() => setDragFromId(slot.id)}
        onDragEnd={() => { setDragFromId(null); setDragOverId(null) }}
        onDragOver={() => { if (dragFromId && dragFromId !== slot.id) setDragOverId(slot.id) }}
        onDrop={() => handleDrop(slot.id)}
        onTouchStart={(e) => handleTouchStart(slot.id, e)}
        onTouchEnd={handleTouchEnd}
      />
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="flex flex-col items-center gap-1"
      onTouchMove={handleTouchMove}
    >
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
          <div className="flex justify-center gap-1 flex-wrap">
            {benchSlots.map((slot, i) => renderSlot(slot, `B${i + 1}`))}
          </div>
          {activeSlot && renderSlot(activeSlot, 'Ativo')}
        </>
      ) : (
        <>
          {activeSlot && renderSlot(activeSlot, 'Ativo')}
          <div className="flex justify-center gap-1 flex-wrap">
            {benchSlots.map((slot, i) => renderSlot(slot, `B${i + 1}`))}
          </div>
        </>
      )}

      {selectedSlot && (
        <SlotPopover
          slot={selectedSlot}
          side={side}
          label={selectedSlot.position === 'active' ? 'Ativo' : 'Banco'}
          open={!!selectedSlotId}
          onOpenChange={(open) => { if (!open) setSelectedSlotId(null) }}
        />
      )}
    </div>
  )
}
