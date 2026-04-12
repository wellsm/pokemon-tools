import type { BoardSlot as BoardSlotType } from "@/game-data";
import { ENERGY_COLOR, ENERGY_EMOJI } from "@/game-data";
import type { Side } from "@/game-store";
import { cn } from "@/lib/utils";

interface BoardSlotProps {
  slot: BoardSlotType;
  label: string;
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
  label,
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
  const labelColor = variant === "a" ? "text-blue-400" : "text-red-400";
  const damageColor = slot.damage > 0 ? "text-amber-400" : "text-gray-500";

  return (
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
        "flex flex-col items-center justify-center rounded-md transition-all select-none touch-none cursor-grab active:cursor-grabbing",
        isActive
          ? `w-20 sm:w-32 md:w-36 h-28 sm:h-40 md:h-48 border-2 ${borderColor} bg-gray-900`
          : "w-18 sm:w-24 md:w-32 h-26 sm:h-36 md:h-42 border border-gray-700 bg-gray-900",
        isDragOver ? "ring-2 ring-amber-400 scale-105" : "",
        isDragging ? "opacity-40 scale-95" : "",
      )}
    >
      <span
        className={`text-[8px] leading-none ${isActive ? labelColor : "text-gray-500"}`}
      >
        {label}
      </span>
      <span className={`text-sm font-bold ${damageColor} mt-0.5`}>
        {slot.damage}
      </span>
      {slot.energies.length > 0 && (
        <div className="flex gap-px mt-1 flex-wrap justify-center max-w-full px-0.5">
          {slot.energies.map((e, i) => (
            <span
              key={`${slot.id}-${i}`}
              className="w-2.5 h-2.5 rounded-full border flex items-center justify-center text-[6px] leading-none"
              style={{
                borderColor: ENERGY_COLOR[e],
                backgroundColor: `${ENERGY_COLOR[e]}20`,
              }}
            >
              {ENERGY_EMOJI[e]}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
