import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { EnergyBadge } from "@/components/play/energy-badge";
import {
  type BoardSlot,
  ENERGY_IMAGE,
  ENERGY_LABEL,
  ENERGY_TYPES,
  ORIENTATION_LABELS,
  MARKER_LABELS,
} from "@/game-data";
import { type Side, useGameStore } from "@/stores/match-store";

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
  const { addDamage, clearDamage, attachEnergy, removeOneEnergy, clearEnergies, setOrientation, toggleMarker, clearConditions, toggleAbility } = useGameStore();

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
        className={`relative z-10 mx-auto bg-surface-container border border-outline-variant rounded-2xl p-5 w-[340px] max-w-[90vw] max-h-[80vh] overflow-y-auto space-y-5 ${side === "a" ? "rotate-180" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-on-surface font-bold text-lg">{label}</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Damage counter */}
        <div>
          <p className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Damage
          </p>
          <div className="flex items-center justify-center gap-2">
            {[-20, -10].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className="w-14 h-10 rounded-md bg-surface-container-high border border-outline-variant text-base font-medium text-on-surface p-3 hover:opacity-80 transition-colors"
              >
                {amt}
              </button>
            ))}
            <span className="text-3xl font-black text-on-surface w-20 text-center">
              {slot.damage}
            </span>
            {[10, 20].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className="w-14 h-10 rounded-md bg-surface-container-high border border-outline-variant text-base font-medium text-on-surface p-3 hover:opacity-80 transition-colors"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions — only for active slot */}
        {slot.position === 'active' && <div>
          <p className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Conditions
          </p>
          {/* 3×2 grid: orientations row + markers row */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {ORIENTATIONS.map((cond) => {
              const active = slot.orientation === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setOrientation(side, slot.id, active ? null : cond)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors border ${
                    active
                      ? 'bg-primary-container/20 border-primary-container text-primary-container'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {ORIENTATION_LABELS[cond]}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MARKERS.map((marker) => {
              const active = slot.markers[marker];
              return (
                <button
                  key={marker}
                  type="button"
                  onClick={() => toggleMarker(side, slot.id, marker)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors border ${
                    active
                      ? 'bg-primary-container/20 border-primary-container text-primary-container'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {MARKER_LABELS[marker]}
                </button>
              );
            })}
          </div>
        </div>}

        {/* Attached energies */}
        <div>
          <p className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Energies
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
                className="w-9 h-9 rounded-xl bg-surface-container-high text-on-surface border border-outline-variant p-1 hover:opacity-80 transition-colors"
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

        {/* Ability toggle — activates and closes modal */}
        <button
          type="button"
          onClick={() => { toggleAbility(side, slot.id); onOpenChange(false); }}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
            slot.abilityUsed
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-secondary-container text-on-secondary-container hover:opacity-90'
          }`}
        >
          {slot.abilityUsed ? 'Deactivate Ability' : 'Use Ability'}
        </button>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => clearDamage(side, slot.id)}
            className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:opacity-80 transition-colors"
          >
            Clear Damage
          </button>
          {slot.energies.length > 0 && (
            <button
              type="button"
              onClick={() => clearEnergies(side, slot.id)}
              className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:opacity-80 transition-colors"
            >
              Clear energies
            </button>
          )}
          {hasAnyCondition && (
            <button
              type="button"
              onClick={() => clearConditions(side, slot.id)}
              className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:opacity-80 transition-colors"
            >
              Clear conditions
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
