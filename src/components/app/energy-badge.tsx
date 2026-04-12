import type { EnergyType } from "@/game-data";
import { ENERGY_COLOR, ENERGY_IMAGE, ENERGY_LABEL } from "@/game-data";
import { cn } from "@/lib/utils";

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

export function EnergyBadge({
  energies,
  size = "sm",
  onRemove,
}: EnergyBadgeProps) {
  const grouped = groupEnergies(energies);

  if (grouped.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap gap-1 items-center justify-center text-center w-full"
    >
      {grouped.map(({ type, count }) => {
        const Tag = onRemove ? "button" : "div";

        return (
          <Tag
            key={type}
            type={onRemove ? "button" : undefined}
            onClick={onRemove ? () => onRemove(type) : undefined}
            className={cn(
              "flex items-center gap-1 sm:border rounded-full sm:p-1",
              onRemove
                ? "hover:opacity-60 transition-opacity cursor-pointer"
                : "",
            )}
            style={{ borderColor: ENERGY_COLOR[type] }}
            title={onRemove ? `Remover 1 ${ENERGY_LABEL[type]}` : undefined}
          >
            {count > 1 && (
              <span
                style={{ color: ENERGY_COLOR[type] }}
                className={cn(
                  size === "sm"
                    ? "text-[9px] sm:text-[10px] font-bold"
                    : "text-sm font-bold",
                )}
              >
                {count}
              </span>
            )}
            <img
              src={ENERGY_IMAGE[type]}
              alt={ENERGY_LABEL[type]}
              className={cn(size === "sm" ? "size-3 sm:size-4" : "size-7")}
            />
          </Tag>
        );
      })}
    </div>
  );
}
