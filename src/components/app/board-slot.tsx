import { Flame, Skull } from "lucide-react";
import { EnergyBadge } from "@/components/app/energy-badge";
import type { BoardSlot as BoardSlotType } from "@/game-data";
import { CONDITION_COLORS, ORIENTATION_ROTATION } from "@/game-data";
import type { Side } from "@/game-store";
import { cn } from "@/lib/utils";

interface BoardSlotProps {
  slot: BoardSlotType;
  variant: Side;
  onClick: () => void;
  isDragOver?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export function BoardSlot({
  slot,
  variant,
  onClick,
  isDragOver,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchEnd,
}: BoardSlotProps) {
  const isActive = slot.position === "active";
  const borderColor = variant === "a" ? "border-blue-400" : "border-red-400";
  const damageColor = slot.damage > 0 ? "text-amber-400" : "text-gray-500";

  const orientationClass = slot.orientation
    ? ORIENTATION_ROTATION[slot.orientation]
    : "";

  const markers = slot.markers ?? { poisoned: false, burned: false };
  const hasMarkers = markers.poisoned || markers.burned;
  const abilityUsed = slot.abilityUsed ?? false;

  return (
    <div className="relative">
      <button
        type="button"
        draggable
        data-slot-id={slot.id}
        onClick={onClick}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart?.();
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          onDragOver?.(e);
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop?.();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={cn(
          "relative flex flex-col items-center justify-between rounded-md transition-all select-none touch-none cursor-grab active:cursor-grabbing w-18 sm:w-24 md:w-32 h-26 sm:h-36 md:h-42 py-1 bg-card",
          isActive
            ? `border-2 ${borderColor}`
            : "border border-gray-700",
          isDragOver ? "ring-2 ring-amber-400 scale-105" : "",
          isDragging ? "opacity-40 scale-95" : "",
          abilityUsed ? "ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]" : "",
          orientationClass,
        )}
      >
        <div className="flex flex-col">
          <span
            className={cn(
              "font-bold mt-2",
              damageColor,
              isActive ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
            )}
          >
            {slot.damage}
          </span>
        </div>

        {slot.energies.length > 0 && (
          <EnergyBadge energies={slot.energies} size="sm" />
        )}
      </button>

      {/* Condition markers — positioned outside the rotated card */}
      {hasMarkers && (
        <div className="absolute -top-2 -right-2 flex gap-0.5">
          {markers.poisoned && (
            <div
              className="size-5 sm:size-7 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white"
              style={{ backgroundColor: CONDITION_COLORS.poisoned }}
              title="Envenenado"
            >
              <Skull className="size-4" />
            </div>
          )}
          {markers.burned && (
            <div
              className="size-5 sm:size-7 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white"
              style={{ backgroundColor: CONDITION_COLORS.burned }}
              title="Queimado"
            >
              <Flame className="size-4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
