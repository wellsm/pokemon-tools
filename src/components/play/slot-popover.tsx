import { XIcon } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { EnergyBadge } from "@/components/play/energy-badge";
import {
  type BoardSlot,
  ENERGY_IMAGE,
  ENERGY_LABEL,
  MARKER_DAMAGE,
  SLOT_ENERGY_TYPES,
} from "@/game-data";
import { useT } from "@/lib/i18n/store";
import { type Side, useGameStore } from "@/stores/match-store";

interface SlotPopoverProps {
  slot: BoardSlot;
  side: Side;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ORIENTATIONS = ["confused", "paralyzed", "asleep"] as const;
const MARKERS = ["poisoned", "burned"] as const;
const DAMAGE_STEPS = [10, 20, 50, 100] as const;

const stepButton =
  "h-10 rounded-md bg-muted border border-border text-base font-medium text-foreground hover:opacity-80 transition-colors";
const toggleButton = (active: boolean) =>
  `py-2 rounded-xl text-xs font-medium transition-colors border ${
    active
      ? "bg-primary/20 border-primary text-primary"
      : "bg-card border-border text-muted-foreground"
  }`;
const secondaryButton =
  "flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:opacity-80 transition-colors";

export function SlotPopover({ slot, side, open, onOpenChange }: SlotPopoverProps) {
  const t = useT();
  const b = t.play.board;
  const {
    addDamage,
    clearDamage,
    attachEnergy,
    removeOneEnergy,
    clearEnergies,
    setOrientation,
    toggleMarker,
    clearConditions,
    toggleAbility,
    toggleTool,
    resetSlot,
    applyMarkerDamage,
  } = useGameStore();
  const [custom, setCustom] = useState("");

  if (!open) return null;

  const isActive = slot.position === "active";
  const hasAnyCondition =
    slot.orientation !== null || slot.markers.poisoned || slot.markers.burned;
  const customValue = Number.parseInt(custom, 10);
  const customValid = Number.isFinite(customValue) && customValue > 0;

  function applyCustom(sign: 1 | -1) {
    if (!customValid) return;
    addDamage(side, slot.id, sign * customValue);
    setCustom("");
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col ${side === "a" ? "justify-start pt-14" : "justify-end pb-14"}`}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`relative z-10 mx-auto bg-card border border-border rounded-2xl p-5 w-[340px] max-w-[90vw] max-h-[80vh] overflow-y-auto space-y-5 ${side === "a" ? "rotate-180" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-foreground font-bold text-lg">
            {isActive ? b.active : b.bench}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Damage counter */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            {b.damage}
          </p>
          <p className="text-4xl font-black text-foreground text-center mb-3">
            {slot.damage}
          </p>
          <div className="grid grid-cols-4 gap-1.5 mb-1.5">
            {DAMAGE_STEPS.map((amt) => (
              <button
                key={`+${amt}`}
                type="button"
                onClick={() => addDamage(side, slot.id, amt)}
                className={stepButton}
              >
                +{amt}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {DAMAGE_STEPS.map((amt) => (
              <button
                key={`-${amt}`}
                type="button"
                onClick={() => addDamage(side, slot.id, -amt)}
                className={`${stepButton} text-muted-foreground`}
              >
                −{amt}
              </button>
            ))}
          </div>
          <form
            className="flex gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              applyCustom(1);
            }}
          >
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={10}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={b.customPlaceholder}
              className="flex-1 min-w-0 h-10 rounded-md bg-background border border-border px-3 text-foreground"
            />
            <button
              type="button"
              disabled={!customValid}
              onClick={() => applyCustom(-1)}
              className={`${stepButton} px-3 disabled:opacity-40`}
            >
              {b.customRemove}
            </button>
            <button
              type="submit"
              disabled={!customValid}
              className="h-10 px-3 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40"
            >
              {b.customAdd}
            </button>
          </form>
        </div>

        {/* Conditions — only for active slot */}
        {isActive && (
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              {b.conditions}
            </p>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {ORIENTATIONS.map((cond) => {
                const active = slot.orientation === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setOrientation(side, slot.id, active ? null : cond)}
                    className={toggleButton(active)}
                  >
                    {b.condition[cond]}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MARKERS.map((marker) => (
                <button
                  key={marker}
                  type="button"
                  onClick={() => toggleMarker(side, slot.id, marker)}
                  className={toggleButton(slot.markers[marker])}
                >
                  {b.condition[marker]}
                </button>
              ))}
            </div>
            {(slot.markers.poisoned || slot.markers.burned) && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {MARKERS.filter((m) => slot.markers[m]).map((marker) => (
                  <button
                    key={marker}
                    type="button"
                    onClick={() => applyMarkerDamage(side, slot.id, marker)}
                    className="py-2 rounded-xl text-xs font-bold bg-amber-400/15 border border-amber-400/50 text-amber-500 hover:bg-amber-400/25 transition-colors"
                  >
                    {b.markerDamage(MARKER_DAMAGE[marker], b.condition[marker])}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attached energies */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            {b.energies}
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
            {SLOT_ENERGY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => attachEnergy(side, slot.id, type)}
                className="w-9 h-9 rounded-xl bg-muted text-foreground border border-border p-1 hover:opacity-80 transition-colors"
              >
                <img src={ENERGY_IMAGE[type]} alt={ENERGY_LABEL[type]} className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Ability + Tool */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              toggleAbility(side, slot.id);
              onOpenChange(false);
            }}
            className={`py-3 rounded-xl text-sm font-bold transition-colors border ${
              slot.abilityUsed
                ? "bg-cyan-400/15 border-cyan-400 text-cyan-500"
                : "bg-secondary border-transparent text-secondary-foreground hover:opacity-90"
            }`}
          >
            {slot.abilityUsed ? b.deactivateAbility : b.useAbility}
          </button>
          <button
            type="button"
            onClick={() => toggleTool(side, slot.id)}
            className={`py-3 rounded-xl text-sm font-bold transition-colors border ${
              slot.tool
                ? "bg-emerald-400/15 border-emerald-400 text-emerald-500"
                : "bg-secondary border-transparent text-secondary-foreground hover:opacity-90"
            }`}
          >
            {slot.tool ? b.removeTool : b.attachTool}
          </button>
        </div>

        {/* Clear actions */}
        <div className="flex gap-2 flex-wrap">
          {slot.damage > 0 && (
            <button type="button" onClick={() => clearDamage(side, slot.id)} className={secondaryButton}>
              {b.clearDamage}
            </button>
          )}
          {slot.energies.length > 0 && (
            <button type="button" onClick={() => clearEnergies(side, slot.id)} className={secondaryButton}>
              {b.clearEnergies}
            </button>
          )}
          {hasAnyCondition && (
            <button type="button" onClick={() => clearConditions(side, slot.id)} className={secondaryButton}>
              {b.clearConditions}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            resetSlot(side, slot.id);
            onOpenChange(false);
          }}
          className="w-full py-3 rounded-xl text-sm font-bold bg-destructive/15 border border-destructive/50 text-destructive hover:bg-destructive/25 transition-colors"
        >
          {b.knockOut}
        </button>
      </div>
    </div>,
    document.body,
  );
}
