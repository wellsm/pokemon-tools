import { MinusIcon, PlusIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { BoardSlot } from "@/components/app/board-slot";
import { SlotPopover } from "@/components/app/slot-popover";
import type { FieldSide as FieldSideType } from "@/game-data";
import { type Side, useGameStore } from "@/game-store";
import { cn } from "@/lib/utils";

interface FieldSideProps {
  field: FieldSideType;
  side: Side;
  onCoinFlip?: () => void;
}

export function FieldSide({ field, side, onCoinFlip }: FieldSideProps) {
  const addSlot = useGameStore((s) => s.addSlot);
  const removeSlot = useGameStore((s) => s.removeSlot);
  const swapSlots = useGameStore((s) => s.swapSlots);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [dragFromId, setDragFromId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const touchDragId = useRef<string | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDraggingTouch = useRef(false);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (dragFromId && dragFromId !== targetId) {
        swapSlots(side, dragFromId, targetId);
      }
      setDragFromId(null);
      setDragOverId(null);
    },
    [dragFromId, side, swapSlots],
  );

  const handleTouchStart = useCallback(
    (slotId: string, e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      touchDragId.current = slotId;
      isDraggingTouch.current = false;
    },
    [],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchDragId.current || !isDraggingTouch.current) {
        touchDragId.current = null;
        touchStartPos.current = null;
        isDraggingTouch.current = false;
        setDragFromId(null);
        setDragOverId(null);
        return;
      }

      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotEl = target?.closest("[data-slot-id]") as HTMLElement | null;
      const targetId = slotEl?.dataset.slotId;

      if (targetId && touchDragId.current !== targetId) {
        swapSlots(side, touchDragId.current, targetId);
      }

      touchDragId.current = null;
      touchStartPos.current = null;
      isDraggingTouch.current = false;
      setDragFromId(null);
      setDragOverId(null);
    },
    [side, swapSlots],
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current || !touchDragId.current) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    if (dx > 8 || dy > 8) {
      isDraggingTouch.current = true;
      setDragFromId(touchDragId.current);

      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotEl = target?.closest("[data-slot-id]") as HTMLElement | null;
      const overId = slotEl?.dataset.slotId ?? null;
      setDragOverId(overId !== touchDragId.current ? overId : null);
    }
  }, []);

  const activeSlot = field.slots.find((s) => s.position === "active");
  const benchSlots = field.slots.filter((s) => s.position === "bench");
  const selectedSlot = field.slots.find((s) => s.id === selectedSlotId);

  const isTop = side === "a";
  const lastBench = benchSlots[benchSlots.length - 1];

  function renderSlot(slot: (typeof field.slots)[number], slotLabel: string) {
    return (
      <BoardSlot
        key={slot.id}
        slot={slot}
        label={slotLabel}
        variant={side}
        onClick={() => {
          if (!isDraggingTouch.current) setSelectedSlotId(slot.id);
        }}
        isDragging={dragFromId === slot.id}
        isDragOver={dragOverId === slot.id}
        onDragStart={() => setDragFromId(slot.id)}
        onDragEnd={() => {
          setDragFromId(null);
          setDragOverId(null);
        }}
        onDragOver={() => {
          if (dragFromId && dragFromId !== slot.id) setDragOverId(slot.id);
        }}
        onDrop={() => handleDrop(slot.id)}
        onTouchStart={(e) => handleTouchStart(slot.id, e)}
        onTouchEnd={handleTouchEnd}
      />
    );
  }

  const coinButton = onCoinFlip && (
    <button
      type="button"
      onClick={onCoinFlip}
      className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-base shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
    >
      🪙
    </button>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 flex-1",
        isTop ? "justify-end" : "justify-start",
      )}
      onTouchMove={handleTouchMove}
    >
      <div className="flex items-center justify-between w-full px-2 absolute">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => addSlot(side)}
            className="text-green-500 bg-green-500/10 rounded px-1.5 py-0.5 text-[10px] hover:bg-green-500/20 transition-colors"
          >
            <PlusIcon className="size-3 inline" /> Slot
          </button>
          {lastBench && (
            <button
              type="button"
              onClick={() => removeSlot(side, lastBench.id)}
              className="text-red-500 bg-red-500/10 rounded px-1.5 py-0.5 text-[10px] hover:bg-red-500/20 transition-colors"
            >
              <MinusIcon className="size-3 inline" /> Slot
            </button>
          )}
        </div>
      </div>

      {isTop ? (
        <div className="flex flex-col gap-4 items-center">
          <div className="grid grid-cols-5 flex-wrap items-center justify-center gap-2">
            {benchSlots.map((slot, i) => renderSlot(slot, `B${i + 1}`))}
          </div>
          {/* Active + coin button row (top side: coin on left, mirrored) */}
          <div className="flex items-center gap-2">
            {coinButton}
            {activeSlot && renderSlot(activeSlot, "Ativo")}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center">
          {/* Active + coin button row (bottom side: coin on right) */}
          <div className="flex items-center gap-2">
            {activeSlot && renderSlot(activeSlot, "Ativo")}
            {coinButton}
          </div>
          <div className="grid grid-cols-5 gap-2 flex-wrap justify-center">
            {benchSlots.map((slot, i) => renderSlot(slot, `B${i + 1}`))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <SlotPopover
          slot={selectedSlot}
          side={side}
          label={selectedSlot.position === "active" ? "Ativo" : "Banco"}
          open={!!selectedSlotId}
          onOpenChange={(open) => {
            if (!open) setSelectedSlotId(null);
          }}
        />
      )}
    </div>
  );
}
