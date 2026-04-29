import { GameSetup } from "@/components/play/game-setup";
import { GameTable } from "@/components/play/game-table";
import { useGameStore } from "@/stores/match-store";

export function Play() {
  const active = useGameStore((s) => s.active);
  const format = useGameStore((s) => s.format);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 flex flex-col">
      <header className="bg-primary border-b border-white/10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="font-black text-xl text-white">Play</h1>
          <p className="text-xs text-white/70">
            {active
              ? `${format === "standard" ? "Standard" : "Pocket"}`
              : "Set up your game"}
          </p>
        </div>
      </header>
      {active ? <GameTable /> : <GameSetup />}
    </div>
  );
}
