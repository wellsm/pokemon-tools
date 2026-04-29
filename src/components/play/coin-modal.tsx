import { MinusIcon, PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { flipCoins, type Side } from "@/stores/match-store";

interface CoinModalProps {
  open: boolean;
  side: Side;
  onOpenChange: (open: boolean) => void;
}

export function CoinModal({ open, side, onOpenChange }: CoinModalProps) {
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<boolean[] | null>(null);
  const [flipping, setFlipping] = useState(false);

  const handleFlip = useCallback(() => {
    setFlipping(true);
    setResults(null);
    setTimeout(() => {
      setResults(flipCoins(count));
      setFlipping(false);
    }, 1000);
  }, [count]);

  const handleReset = useCallback(() => {
    setResults(null);
    setCount(1);
  }, []);

  const heads = results?.filter(Boolean).length ?? 0;
  const tails = (results?.length ?? 0) - heads;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`relative z-10 bg-surface-container border border-outline-variant rounded-2xl p-6 w-[320px] max-w-[90vw] space-y-5 ${side === "a" ? "rotate-180" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-on-surface font-bold text-lg">🪙 Coins</span>
          <div className="flex items-center gap-2">
            {results && (
              <button
                type="button"
                onClick={handleReset}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="Resetar"
              >
                <RotateCcwIcon className="size-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <XIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-on-surface-variant">Quantity:</span>
          <button
            type="button"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface hover:opacity-80 transition-colors"
          >
            <MinusIcon className="size-4" />
          </button>
          <span className="text-2xl font-bold text-on-surface w-8 text-center">
            {count}
          </span>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface hover:opacity-80 transition-colors"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        {/* Coin display — scrollable */}
        <div className="max-h-68 overflow-y-auto">
          <div className="flex justify-center gap-4 flex-wrap py-3">
            {Array.from({ length: count }, (_, i) => {
              const result = results?.[i];
              const isHeads = result === true;
              return (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black shadow-lg shrink-0 ${flipping ? "coin-flipping" : ""
                    } ${result == null
                      ? "bg-linear-to-br from-amber-400 to-amber-600 text-black/40"
                      : isHeads
                        ? "bg-linear-to-br from-amber-400 to-amber-600 text-black"
                        : "bg-linear-to-br from-gray-400 to-gray-600 text-on-surface"
                    }`}
                  style={{ perspective: "600px" }}
                >
                  {result == null ? <img className="rounded-full" src="/images/coin-heads.png" alt="Heads" /> : isHeads ? <img className="rounded-full" src="/images/coin-heads.png" alt="Heads" /> : <img className="rounded-full" src="/images/coin-tails.jpeg" alt="Tails" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Results summary */}
        {results && (
          <div className="text-center text-base bg-surface-container-high rounded-xl py-2.5 px-4">
            <span className="text-green-400 font-semibold">{heads} Heads</span>
            {" · "}
            <span className="text-primary-container font-semibold">{tails} Tails</span>
          </div>
        )}

        {/* Flip button */}
        <button
          type="button"
          onClick={handleFlip}
          disabled={flipping}
          className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-base hover:bg-amber-400 transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {results ? "Flip Again" : "Flip!"}
        </button>
      </div>
    </div>
  );
}
