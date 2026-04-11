// src/components/app/coin-modal.tsx
import { useState, useCallback } from 'react'
import { flipCoins } from '@/game-store'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer'
import { MinusIcon, PlusIcon } from 'lucide-react'

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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>🪙 Jogar Moedas</DrawerTitle>
          <DrawerDescription>Selecione a quantidade e jogue</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {/* Quantity selector */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500">Quantidade:</span>
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <MinusIcon className="size-4" />
            </button>
            <span className="text-2xl font-bold w-8 text-center">{count}</span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          {/* Coin display */}
          <div className="flex justify-center gap-3 flex-wrap py-4">
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
            <div className="text-center text-sm bg-gray-50 rounded-xl py-2.5 px-4">
              <span className="text-green-600 font-semibold">{heads} Cara</span>
              {' · '}
              <span className="text-red-500 font-semibold">{tails} Coroa</span>
            </div>
          )}

          {/* Flip button */}
          <button
            onClick={handleFlip}
            disabled={flipping}
            className="w-full py-3 rounded-2xl bg-amber-500 text-black font-bold text-base hover:bg-amber-400 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {results ? 'Jogar Novamente' : 'Jogar!'}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
