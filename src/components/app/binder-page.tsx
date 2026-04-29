import { useCallback } from 'react'
import { useBinderStore } from '@/store'
import { PokemonCard } from './pokemon-card'
import { pageCapacity } from '@/lib/binder-math'
import type { Folder } from '@/store'
import { cn } from '@/lib/utils'

interface Props {
  folder: Folder
  pageNumber: number
  highlightedSlotIndex?: number | null
  onEmptySlotClick: (slotIndex: number) => void
  onHighlightClear?: () => void
}

export function BinderPage({ folder, pageNumber, highlightedSlotIndex, onEmptySlotClick, onHighlightClear }: Props) {
  const toggleCollected = useBinderStore((s) => s.toggleCollected)

  const config = { cols: folder.cols, rows: folder.rows, back: folder.back }
  const cap = pageCapacity(config)
  const pageStart = (pageNumber - 1) * cap
  const pageEnd = Math.min(pageStart + cap, folder.totalSlots) - 1

  const slotMap = new Map(folder.slots.map((s) => [s.slotIndex, s]))

  const handleToggle = useCallback(
    (slotIndex: number, pokemonId: number) => {
      if (slotIndex === highlightedSlotIndex) onHighlightClear?.()
      toggleCollected(folder.id, slotIndex, pokemonId)
    },
    [folder.id, toggleCollected, highlightedSlotIndex, onHighlightClear]
  )

  const slotIndexes = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, i) => pageStart + i
  )

  return (
    <div
      className="flex-1 bg-transparent sm:bg-white rounded-2xl sm:shadow-sm sm:border sm:border-gray-100 sm:p-3 h-fit"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${folder.cols}, 1fr)`,
        gap: '8px',
        alignContent: 'start',
      }}
    >
      {slotIndexes.map((slotIndex) => {
        const slotRecord = slotMap.get(slotIndex)
        const pokemonId =
          folder.mode === 'pokedex'
            ? slotIndex + 1
            : (slotRecord?.pokemonId ?? null)

        return (
          <div key={slotIndex} className={cn('relative w-full ', folder.rows === 3 && 'h-44 sm:h-56', folder.rows === 4 && "h-32 sm:h-48")}>
            <PokemonCard
              slotIndex={slotIndex}
              pokemonId={pokemonId}
              collected={slotRecord?.collected ?? false}
              highlighted={slotIndex === highlightedSlotIndex}
              onToggle={() => {
                if (pokemonId !== null) handleToggle(slotIndex, pokemonId)
              }}
              onEmptyClick={() => onEmptySlotClick(slotIndex)}
            />
          </div>
        )
      })}
    </div>
  )
}
