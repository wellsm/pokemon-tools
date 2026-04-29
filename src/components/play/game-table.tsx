import { useState } from "react";
import { CoinModal } from "@/components/play/coin-modal";
import { EnergyIndicator } from "@/components/play/energy-indicator";
import { FieldSide } from "@/components/play/field-side";
import { type Side, useGameStore } from "@/stores/match-store";
import { useT } from "@/lib/i18n/store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function GameTable() {
  const t = useT();
  const { modules, fieldA, fieldB, endGame } = useGameStore();

  const [coinOpen, setCoinOpen] = useState(false);
  const [coinSide, setCoinSide] = useState<Side>("b");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endSide, setEndSide] = useState<Side>("b");

  // const [historySide, setHistorySide] = useState<Side>("b");
  // const [historyOpen, setHistoryOpen] = useState(false);

  // function toggleHistory(side: Side) {
  //   if (historyOpen && historySide === side) {
  //     setHistoryOpen(false);
  //   } else {
  //     setHistorySide(side);
  //     setHistoryOpen(true);
  //   }
  // }

  function openCoin(side: Side) {
    setCoinSide(side);
    setCoinOpen(true);
  }

  return (
    <div className="flex-1 bg-background flex flex-col h-full">
      {/* Field area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 relative overflow-hidden px-2">
        {modules.board && (
          <div className="rotate-180 flex-1 flex items-start justify-center">
            <FieldSide
              field={fieldA}
              side="a"
              onCoinFlip={modules.coins ? () => openCoin("a") : undefined}
              onEndGame={() => { setEndSide("a"); setShowEndConfirm(true); }}
              //onHistory={() => toggleHistory("a")}
              // historyActive={historyOpen && historySide === "a"}
            />
          </div>
        )}
        {modules.board && (
          <FieldSide
            field={fieldB}
            side="b"
            onCoinFlip={modules.coins ? () => openCoin("b") : undefined}
            onEndGame={() => { setEndSide("b"); setShowEndConfirm(true); }}
            //onHistory={() => toggleHistory("b")}
            // historyActive={historyOpen && historySide === "b"}
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
      {/* <GameHistory open={historyOpen} side={historySide} onOpenChange={setHistoryOpen} /> */}

      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent className={endSide === 'a' ? 'rotate-180' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.play.endGameConfirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.play.endGameConfirm.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.play.endGameConfirm.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={endGame}>
              {t.play.endGameConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
