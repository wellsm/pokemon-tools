// src/components/play/game-setup.tsx

import { Switch } from "@/components/ui/switch";
import {
  ENERGY_IMAGE,
  ENERGY_LABEL,
  ENERGY_TYPES,
  type EnergyType,
  FORMAT_DEFAULTS,
  type GameFormat,
  MAX_ENERGY_TYPES,
} from "@/game-data";
import { useGameStore } from "@/stores/match-store";
import { useT } from "@/lib/i18n/store";

type GameSetupProps = { onComplete?: () => void }

export function GameSetup({ onComplete }: GameSetupProps = {}) {
  const t = useT();
  const format = useGameStore((s) => s.format);
  const modules = useGameStore((s) => s.modules);
  const energyPool = useGameStore((s) => s.energyPool);
  const setFormat = useGameStore((s) => s.setFormat);
  const setModules = useGameStore((s) => s.setModules);
  const setEnergyPool = useGameStore((s) => s.setEnergyPool);
  const startGame = useGameStore((s) => s.startGame);

  function handleFormatChange(f: GameFormat) {
    setFormat(f);
    if (f === "standard") setEnergyPool([]);
  }

  function toggleEnergy(type: EnergyType) {
    if (energyPool.includes(type)) {
      setEnergyPool(energyPool.filter((e) => e !== type));
    } else if (energyPool.length < MAX_ENERGY_TYPES) {
      setEnergyPool([...energyPool, type]);
    }
  }

  const canStart = !modules.energy || energyPool.length > 0;

  return (
    <div className="py-6 space-y-6">
      {/* Format selector */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {t.play.setup.format}
        </p>
        <div className="flex gap-2">
          {(["standard", "pocket"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => handleFormatChange(f)}
              className={`flex-1 p-3 rounded-xl text-center transition-colors border-2 ${format === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary"
                }`}
            >
              <div className="font-bold text-sm">
                {f === "standard" ? t.play.setup.standard : t.play.setup.pocket}
              </div>
              <div className="text-xs mt-0.5 opacity-70">
                {t.play.setup.benchInfo(FORMAT_DEFAULTS[f].benchSize)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Module toggles */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {t.play.setup.modules}
        </p>
        <div className="space-y-2">
          {[
            { key: "coins" as const, label: t.play.setup.coins.label, desc: t.play.setup.coins.desc },
            { key: "energy" as const, label: t.play.setup.energy.label, desc: t.play.setup.energy.desc },
            { key: "board" as const, label: t.play.setup.board.label, desc: t.play.setup.board.desc },
          ].map((mod) => {
            const isEnergyDisabled =
              mod.key === "energy" && format === "standard";
            return (
              <div
                key={mod.key}
                className={`flex items-center justify-between p-3 rounded-xl bg-card border border-border ${isEnergyDisabled ? "opacity-40" : ""
                  }`}
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {mod.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{mod.desc}</div>
                </div>
                <Switch
                  checked={modules[mod.key]}
                  disabled={isEnergyDisabled}
                  onCheckedChange={(checked: boolean) =>
                    setModules({ ...modules, [mod.key]: checked })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy selection */}
      {modules.energy && format === "pocket" && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {t.play.setup.energiesLabel(energyPool.length, MAX_ENERGY_TYPES)}
          </p>
          <div className="flex flex-wrap gap-2">
            {ENERGY_TYPES.map((type) => {
              const selected = energyPool.includes(type);
              const disabled =
                !selected && energyPool.length >= MAX_ENERGY_TYPES;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => toggleEnergy(type)}
                  disabled={disabled}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border-2 ${selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : disabled
                      ? "border-border bg-card text-muted-foreground opacity-40 cursor-not-allowed"
                      : "border-border bg-card text-muted-foreground hover:border-primary"
                    }`}
                >
                  <img
                    src={ENERGY_IMAGE[type]}
                    alt={ENERGY_LABEL[type]}
                    className="w-5 h-5"
                  />
                  <span>{ENERGY_LABEL[type]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        type="button"
        onClick={onComplete ?? startGame}
        disabled={!canStart}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        {t.play.setup.start}
      </button>
    </div>
  );
}
