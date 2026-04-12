import { SkipForwardIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { CoinModal } from "@/components/app/coin-modal";
import { EnergyIndicator } from "@/components/app/energy-indicator";
import { FieldSide } from "@/components/app/field-side";
import { useGameStore } from "@/game-store";

export function GameTable() {
  const format = useGameStore((s) => s.format);
  const modules = useGameStore((s) => s.modules);
  const turn = useGameStore((s) => s.turn);
  const fieldA = useGameStore((s) => s.fieldA);
  const fieldB = useGameStore((s) => s.fieldB);
  const endGame = useGameStore((s) => s.endGame);
  const nextTurn = useGameStore((s) => s.nextTurn);

  const [coinOpen, setCoinOpen] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/80">
        <div className="text-gray-400 text-xs">
          {format === "standard" ? "Standard" : "Pocket"} · Turno {turn}
        </div>
        <div className="flex gap-1.5">
          {modules.energy && (
            <button
              type="button"
              onClick={nextTurn}
              className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              <SkipForwardIcon className="size-3" />
              Próximo turno
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowEndConfirm(true)}
            className="text-xs text-red-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      </div>

      {/* Field area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 relative overflow-hidden px-2 h-screen">
        {modules.board && (
          <FieldSide
            field={fieldA}
            side="a"
            onCoinFlip={modules.coins ? () => setCoinOpen(true) : undefined}
          />
        )}
        {modules.board && (
          <FieldSide
            field={fieldB}
            side="b"
            onCoinFlip={modules.coins ? () => setCoinOpen(true) : undefined}
          />
        )}

        {modules.energy && <EnergyIndicator side="a" />}
        {modules.energy && <EnergyIndicator side="b" />}
      </div>

      <CoinModal open={coinOpen} onOpenChange={setCoinOpen} />

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center space-y-4">
            <p className="font-bold text-gray-900">Encerrar partida?</p>
            <p className="text-sm text-gray-500">
              Todo o progresso será perdido.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={endGame}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
