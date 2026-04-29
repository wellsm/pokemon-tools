import { useState } from "react";
import { createPortal } from "react-dom";
import { CoinModal } from "@/components/play/coin-modal";
import { EnergyIndicator } from "@/components/play/energy-indicator";
import { FieldSide } from "@/components/play/field-side";
import { GameHistory } from "@/components/play/game-history";
import { type Side, useGameStore } from "@/stores/match-store";

export function GameTable() {
  const { modules, fieldA, fieldB, endGame } = useGameStore();

  const [coinOpen, setCoinOpen] = useState(false);
  const [coinSide, setCoinSide] = useState<Side>("b");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endSide, setEndSide] = useState<Side>("b");

  const [historySide, setHistorySide] = useState<Side>("b");
  const [historyOpen, setHistoryOpen] = useState(false);

  function toggleHistory(side: Side) {
    if (historyOpen && historySide === side) {
      setHistoryOpen(false);
    } else {
      setHistorySide(side);
      setHistoryOpen(true);
    }
  }

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
              onHistory={() => toggleHistory("a")}
              historyActive={historyOpen && historySide === "a"}
            />
          </div>
        )}
        {modules.board && (
          <FieldSide
            field={fieldB}
            side="b"
            onCoinFlip={modules.coins ? () => openCoin("b") : undefined}
            onEndGame={() => { setEndSide("b"); setShowEndConfirm(true); }}
            onHistory={() => toggleHistory("b")}
            historyActive={historyOpen && historySide === "b"}
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

      <GameHistory open={historyOpen} side={historySide} onOpenChange={setHistoryOpen} />

      {showEndConfirm && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`bg-surface-container border border-outline-variant rounded-2xl p-6 max-w-xs w-full text-center space-y-4 ${endSide === 'a' ? 'rotate-180' : ''}`}>
            <p className="font-bold text-on-surface text-lg">End game?</p>
            <p className="text-sm text-on-surface-variant">
              All progress will be lost.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant text-sm font-medium text-on-surface hover:opacity-80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={endGame}
                className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-sm font-medium hover:opacity-90 transition-colors"
              >
                End
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
