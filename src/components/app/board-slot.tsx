import type { BoardSlot as BoardSlotType, EnergyType } from "@/game-data";
import { ENERGY_IMAGE } from "@/game-data";
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

function groupEnergies(energies: EnergyType[]): { type: EnergyType; count: number }[] {
  const map = new Map<EnergyType, number>();
  for (const e of energies) {
    map.set(e, (map.get(e) ?? 0) + 1);
  }
  return Array.from(map, ([type, count]) => ({ type, count }));
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
  const grouped = groupEnergies(slot.energies);

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
        "relative flex flex-col items-center justify-center rounded-md transition-all select-none touch-none cursor-grab active:cursor-grabbing w-18 sm:w-24 md:w-32 h-26 sm:h-36 md:h-42",
        isActive
          ? `border-2 ${borderColor} bg-gray-900`
          : "border border-gray-700 bg-gray-900",
        isDragOver ? "ring-2 ring-amber-400 scale-105" : "",
        isDragging ? "opacity-40 scale-95" : "",
      )}
    >
      <span
        className={cn(
          "leading-none",
          isActive ? `text-xs sm:text-sm ${labelColor}` : "text-[10px] sm:text-xs text-gray-500",
        )}
      >
        {label}
      </span>
      <span className={cn("font-bold mt-0.5", damageColor, isActive ? "text-xl sm:text-2xl" : "text-base sm:text-lg")}>
        {slot.damage}
      </span>

      {/* Energy images — bottom right corner */}
      {grouped.length > 0 && (
        <div className="absolute bottom-1 right-1 flex flex-col gap-0.5 items-end">
          {grouped.map(({ type, count }) => (
            <div key={type} className="flex items-center gap-0.5">
              {count > 1 && (
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-300">{count}</span>
              )}
              <img
                src={ENERGY_IMAGE[type]}
                alt={type}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
