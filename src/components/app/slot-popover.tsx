import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { EnergyBadge } from "@/components/app/energy-badge";
import {
  type BoardSlot,
  ENERGY_IMAGE,
  ENERGY_LABEL,
  ENERGY_TYPES,
  ORIENTATION_LABELS,
  MARKER_LABELS,
  CONDITION_COLORS,
} from "@/game-data";
import { type Side, useGameStore } from "@/game-store";

interface SlotPopoverProps {
  slot: BoardSlot;
  side: Side;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ORIENTATIONS = ['confused', 'paralyzed', 'asleep'] as const;
const MARKERS = ['poisoned', 'burned'] as const;

export function SlotPopover({
  slot,
  side,
  label,
  open,
  onOpenChange,
}: SlotPopoverProps) {
  const { addDamage, clearDamage, attachEnergy, removeOneEnergy, clearEnergies, setOrientation, toggleMarker, clearConditions } = useGameStore();

  if (!open) return null;

  const hasAnyCondition = slot.orientation !== null || slot.markers.poisoned || slot.markers.burned;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col ${side === "a" ? "justify-start pt-14" : "justify-end pb-14"}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`relative z-10 mx-auto bg-gray-900/95 border border-gray-700 rounded-2xl p-5 w-[340px] max-w-[90vw] max-h-[80vh] overflow-y-auto space-y-5 ${side === "a" ? "rotate-180" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">{label}</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Damage counter */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Dano
          </p>
          <div className="flex items-center justify-center gap-2">
            {[-20, -10].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className="w-14 h-10 rounded-lg bg-gray-800 border border-gray-700 text-base font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {amt}
              </button>
            ))}
            <span className="text-3xl font-black text-red-500 w-20 text-center">
              {slot.damage}
            </span>
            {[10, 20].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className="w-14 h-10 rounded-lg bg-gray-800 border border-gray-700 text-base font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Condições
          </p>
          {/* Orientation conditions (mutually exclusive) */}
          <div className="flex gap-1.5 mb-2">
            {ORIENTATIONS.map((cond) => {
              const active = slot.orientation === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setOrientation(side, slot.id, active ? null : cond)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors border"
                  style={{
                    borderColor: active ? CONDITION_COLORS[cond] : '#374151',
                    backgroundColor: active ? `${CONDITION_COLORS[cond]}20` : '#1f2937',
                    color: active ? CONDITION_COLORS[cond] : '#9ca3af',
                  }}
                >
                  {ORIENTATION_LABELS[cond]}
                </button>
              );
            })}
          </div>
          {/* Marker conditions (toggleable) */}
          <div className="flex gap-1.5">
            {MARKERS.map((marker) => {
              const active = slot.markers[marker];
              return (
                <button
                  key={marker}
                  type="button"
                  onClick={() => toggleMarker(side, slot.id, marker)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors border"
                  style={{
                    borderColor: active ? CONDITION_COLORS[marker] : '#374151',
                    backgroundColor: active ? `${CONDITION_COLORS[marker]}20` : '#1f2937',
                    color: active ? CONDITION_COLORS[marker] : '#9ca3af',
                  }}
                >
                  {MARKER_LABELS[marker]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attached energies */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Energias
          </p>
          {slot.energies.length > 0 && (
            <div className="mb-3">
              <EnergyBadge
                energies={slot.energies}
                size="md"
                onRemove={(type) => removeOneEnergy(side, slot.id, type)}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {ENERGY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => attachEnergy(side, slot.id, type)}
                className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 p-1 hover:bg-gray-700 transition-colors"
              >
                <img
                  src={ENERGY_IMAGE[type]}
                  alt={ENERGY_LABEL[type]}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => clearDamage(side, slot.id)}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Limpar dano
          </button>
          {slot.energies.length > 0 && (
            <button
              type="button"
              onClick={() => clearEnergies(side, slot.id)}
              className="flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Limpar energias
            </button>
          )}
          {hasAnyCondition && (
            <button
              type="button"
              onClick={() => clearConditions(side, slot.id)}
              className="flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Limpar condições
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
