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

export function GameSetup() {
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
    <div className="px-4 py-6 space-y-6">
      {/* Format selector */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Format
        </p>
        <div className="flex gap-2">
          {(["standard", "pocket"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => handleFormatChange(f)}
              className={`flex-1 p-3 rounded-xl text-center transition-colors border-2 ${format === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
            >
              <div className="font-bold text-sm">
                {f === "standard" ? "Standard" : "Pocket"}
              </div>
              <div className="text-xs mt-0.5 opacity-70">
                1 active + {FORMAT_DEFAULTS[f].benchSize} bench
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Module toggles */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Modules
        </p>
        <div className="space-y-2">
          {[
            {
              key: "coins" as const,
              label: "🪙 Coins",
              desc: "Flip 1 or more coins",
            },
            {
              key: "energy" as const,
              label: "⚡ Energy Generator",
              desc: "1 energy/turn (Pocket)",
            },
            {
              key: "board" as const,
              label: "🎯 Damage Board",
              desc: "Counters per slot",
            },
          ].map((mod) => {
            const isEnergyDisabled =
              mod.key === "energy" && format === "standard";
            return (
              <div
                key={mod.key}
                className={`flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 ${isEnergyDisabled ? "opacity-40" : ""
                  }`}
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {mod.label}
                  </div>
                  <div className="text-xs text-gray-400">{mod.desc}</div>
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
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Energies ({energyPool.length}/{MAX_ENERGY_TYPES})
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
                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
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
        onClick={startGame}
        disabled={!canStart}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        Start Game
      </button>
    </div>
  );
}
