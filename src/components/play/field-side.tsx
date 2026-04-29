import { ClockIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { BoardSlot } from "@/components/play/board-slot";
import { SlotPopover } from "@/components/play/slot-popover";
import type {
  BoardSlot as BoardSlotType,
  FieldSide as FieldSideType,
} from "@/game-data";
import { ENERGY_LABEL } from "@/game-data";
import { type Side, useGameStore } from "@/stores/match-store";

interface FieldSideProps {
  field: FieldSideType;
  side: Side;
  onCoinFlip?: () => void;
  onEndGame?: () => void;
  onHistory?: () => void;
  historyActive?: boolean;
}

export function FieldSide({
  field,
  side,
  onCoinFlip,
  onEndGame,
  onHistory,
  historyActive,
}: FieldSideProps) {
  const addSlot = useGameStore((s) => s.addSlot);
  const removeSlot = useGameStore((s) => s.removeSlot);
  const swapSlots = useGameStore((s) => s.swapSlots);
  const logAction = useGameStore((s) => s.logAction);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const slotSnapshot = useRef<BoardSlotType | null>(null);
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
  const lastBench = benchSlots[benchSlots.length - 1];

  function renderSlot(slot: (typeof field.slots)[number]) {
    return (
      <BoardSlot
        key={slot.id}
        slot={slot}
        variant={side}
        onClick={() => {
          if (!isDraggingTouch.current) {
            slotSnapshot.current = { ...slot, energies: [...slot.energies] };
            setSelectedSlotId(slot.id);
          }
        }}
        isDragging={dragFromId === slot.id}
        isDragOver={dragOverId === slot.id}
        onDragStart={() => setDragFromId(slot.id)}
        onDragEnd={() => {
          setDragFromId(null);
          setDragOverId(null);
        }}
        onDragOver={() => {
          if (dragFromId && dragFromId !== slot.id) {
            setDragOverId(slot.id);
          }
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
      className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-base shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
    >
      <img src="/images/coin-heads.png" alt="Coin Heads" className="w-full h-full" />
    </button>
  );

  const historyButton = onHistory && (
    <button
      type="button"
      onClick={onHistory}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
        historyActive
          ? "bg-surface-container-high text-on-surface border border-outline"
          : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <ClockIcon className="size-4" />
    </button>
  );

  const endButton = onEndGame && (
    <button
      type="button"
      onClick={onEndGame}
      className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container text-xs font-bold hover:bg-primary-container/30 active:scale-95 transition-all"
    >
      ✕
    </button>
  );

  return (
    <div
      className="flex flex-col items-center gap-1 flex-1 justify-start"
      onTouchMove={handleTouchMove}
    >
      <div className="flex flex-col gap-4 items-center">
        {/* Active + coin button + end button */}
        <div className="relative">
          {activeSlot && renderSlot(activeSlot)}
          {coinButton && (
            <div className="absolute top-1/2 -translate-y-1/2 -right-16">
              {coinButton}
            </div>
          )}
          <div className="absolute top-1/2 -translate-y-1/2 -left-14 flex flex-col gap-1.5">
            {historyButton}
            {endButton}
          </div>
        </div>

        {/* Bench + slot controls */}
        <div className="flex flex-col items-end gap-1 relative">
          <div className="flex gap-1 absolute -top-8 sm:-top-12">
            <button
              type="button"
              onClick={() => addSlot(side)}
              className="text-green-400 bg-green-400/10 rounded-md px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base hover:bg-green-400/20 transition-colors"
            >
              <PlusIcon className="size-3.5 inline" /> Slot
            </button>
            {lastBench && (
              <button
                type="button"
                onClick={() => removeSlot(side, lastBench.id)}
                className="text-red-400 bg-red-400/10 rounded-md px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base hover:bg-red-400/20 transition-colors"
              >
                <MinusIcon className="size-3.5 inline" /> Slot
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2 justify-center">
            {benchSlots.map((slot) => renderSlot(slot))}
          </div>
        </div>
      </div>

      {selectedSlot && (
        <SlotPopover
          slot={selectedSlot}
          side={side}
          label={selectedSlot.position === "active" ? "Active" : "Bench"}
          open={!!selectedSlotId}
          onOpenChange={(open) => {
            if (!open) {
              // Log batched changes on close
              const snap = slotSnapshot.current;
              const current = field.slots.find((s) => s.id === selectedSlotId);
              if (snap && current) {
                const damageDiff = current.damage - snap.damage;
                if (damageDiff !== 0) {
                  logAction(
                    side,
                    "damage",
                    `${damageDiff > 0 ? "+" : ""}${damageDiff} dano → ${current.damage}`,
                  );
                }
                const addedEnergies =
                  current.energies.length - snap.energies.length;
                if (addedEnergies !== 0) {
                  const energyNames = current.energies
                    .map((e) => ENERGY_LABEL[e])
                    .join(", ");
                  logAction(
                    side,
                    "energy",
                    `${addedEnergies > 0 ? "+" : ""}${addedEnergies} energia (${energyNames || "nenhuma"})`,
                  );
                }
              }
              slotSnapshot.current = null;
              setSelectedSlotId(null);
            }
          }}
        />
      )}

    </div>
  );
}
