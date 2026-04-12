import { useState, useCallback } from 'react'
import { flipCoins } from '@/game-store'
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react'

interface CoinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoinModal({ open, onOpenChange }: CoinModalProps) {
  const [count, setCount] = useState(1)
  const [results, setResults] = useState<boolean[] | null>(null)
  const [flipping, setFlipping] = useState(false)

  const handleFlip = useCallback(() => {
    setFlipping(true)
    setResults(null)
    setTimeout(() => {
      setResults(flipCoins(count))
      setFlipping(false)
    }, 1000)
  }, [count])

  const heads = results?.filter(Boolean).length ?? 0
  const tails = (results?.length ?? 0) - heads

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — semi-transparent to see the field behind */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal content */}
      <div className="relative z-10 bg-gray-900/95 border border-gray-700 rounded-2xl p-5 w-[280px] max-w-[90vw] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-base">🪙 Moedas</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-gray-400">Quantidade:</span>
          <button
            type="button"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <MinusIcon className="size-3" />
          </button>
          <span className="text-xl font-bold text-white w-6 text-center">{count}</span>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="size-3" />
          </button>
        </div>

        {/* Coin display */}
        <div className="flex justify-center gap-3 flex-wrap py-2">
          {Array.from({ length: count }, (_, i) => {
            const result = results?.[i]
            const isHeads = result === true
            return (
              <div
                key={i}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shadow-lg ${
                  flipping ? 'coin-flipping' : ''
                } ${
                  result == null
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black/40'
                    : isHeads
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                      : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                }`}
                style={{ perspective: '600px' }}
              >
                {result == null ? '?' : isHeads ? 'C' : 'K'}
              </div>
            )
          })}
        </div>

        {/* Results summary */}
        {results && (
          <div className="text-center text-sm bg-gray-800/80 rounded-xl py-2 px-3">
            <span className="text-green-400 font-semibold">{heads} Cara</span>
            {' · '}
            <span className="text-red-400 font-semibold">{tails} Coroa</span>
          </div>
        )}

        {/* Flip button */}
        <button
          type="button"
          onClick={handleFlip}
          disabled={flipping}
          className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {results ? 'Jogar Novamente' : 'Jogar!'}
        </button>
      </div>
    </div>
  )
}
