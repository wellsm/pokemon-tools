import { useState } from "react";
import { createPortal } from "react-dom";
import { CoinModal } from "@/components/app/coin-modal";
import { EnergyIndicator } from "@/components/app/energy-indicator";
import { FieldSide } from "@/components/app/field-side";
import { type Side, useGameStore } from "@/game-store";

export function GameTable() {
  const { modules, fieldA, fieldB, endGame } = useGameStore();

  const [coinOpen, setCoinOpen] = useState(false);
  const [coinSide, setCoinSide] = useState<Side>("b");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endSide, setEndSide] = useState<Side>("b");

  function openCoin(side: Side) {
    setCoinSide(side);
    setCoinOpen(true);
  }

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Field area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 relative overflow-hidden px-2">
        {modules.board && (
          <div className="rotate-180 flex-1 flex items-start justify-center">
            <FieldSide
              field={fieldA}
              side="a"
              onCoinFlip={modules.coins ? () => openCoin("a") : undefined}
              onEndGame={() => { setEndSide("a"); setShowEndConfirm(true); }}
            />
          </div>
        )}
        {modules.board && (
          <FieldSide
            field={fieldB}
            side="b"
            onCoinFlip={modules.coins ? () => openCoin("b") : undefined}
            onEndGame={() => { setEndSide("b"); setShowEndConfirm(true); }}
          />
        )}

        {modules.energy && (
          <div className="absolute top-12 left-3 z-10 rotate-180">
            <EnergyIndicator side="a" />
          </div>
        )}

        {modules.energy && (
          <div className="absolute bottom-16 md:bottom-3 right-3 z-10">
            <EnergyIndicator side="b" />
          </div>
        )}
      </div>

      <CoinModal open={coinOpen} side={coinSide} onOpenChange={setCoinOpen} />

      {showEndConfirm && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 ${endSide === 'a' ? 'rotate-180' : ''}`}>
            <p className="font-bold text-white text-lg">Encerrar partida?</p>
            <p className="text-sm text-gray-400">
              Todo o progresso será perdido.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
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
        </div>,
        document.body
      )}
    </div>
  );
}
