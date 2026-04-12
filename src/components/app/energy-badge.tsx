import type { EnergyType } from "@/game-data";
import { ENERGY_IMAGE, ENERGY_LABEL } from "@/game-data";

interface EnergyGroup {
  type: EnergyType;
  count: number;
}

export function groupEnergies(energies: EnergyType[]): EnergyGroup[] {
  const map = new Map<EnergyType, number>();
  for (const e of energies) {
    map.set(e, (map.get(e) ?? 0) + 1);
  }
  return Array.from(map, ([type, count]) => ({ type, count }));
}

interface EnergyBadgeProps {
  energies: EnergyType[];
  size?: "sm" | "md";
  onRemove?: (type: EnergyType) => void;
}

export function EnergyBadge({ energies, size = "sm", onRemove }: EnergyBadgeProps) {
  const grouped = groupEnergies(energies);
  if (grouped.length === 0) return null;

  const imgClass = size === "sm" ? "w-4 h-4 sm:w-5 sm:h-5" : "w-7 h-7";
  const countClass = size === "sm"
    ? "text-[9px] sm:text-[10px] font-bold text-gray-300"
    : "text-sm font-bold text-gray-300";

  return (
    <div className={`flex ${size === "sm" ? "flex-col gap-0.5 items-end" : "flex-wrap gap-2 items-center"}`}>
      {grouped.map(({ type, count }) => {
        const Tag = onRemove ? "button" : "div";
        return (
          <Tag
            key={type}
            type={onRemove ? "button" : undefined}
            onClick={onRemove ? () => onRemove(type) : undefined}
            className={`flex items-center gap-1 ${onRemove ? "hover:opacity-60 transition-opacity cursor-pointer" : ""}`}
            title={onRemove ? `Remover 1 ${ENERGY_LABEL[type]}` : undefined}
          >
            {count > 1 && <span className={countClass}>{count}</span>}
            <img src={ENERGY_IMAGE[type]} alt={ENERGY_LABEL[type]} className={imgClass} />
          </Tag>
        );
      })}
    </div>
  );
}
