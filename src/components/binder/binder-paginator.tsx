import { useState } from 'react'
import { useBinderStore } from '@/stores/binder-store'
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion } from '@/lib/pokemon'
import { parseFormat, totalPages, pageCapacity } from '@/lib/binder-math'
import { BinderSlot } from './binder-slot'

interface Props {
  binder: Binder
}

export function BinderPaginator({ binder }: Props) {
  const [page, setPage] = useState(1)

  const pokemons = getPokemonByRegion(binder.region)
  const { cols, rows } = parseFormat(binder.grid)
  const config = { cols, rows, back: false }
  const cap = pageCapacity(config)
  const pages = totalPages(pokemons.length, config)

  const pageStart = (page - 1) * cap
  const pageEnd = Math.min(pageStart + cap, pokemons.length)
  const pagePokemons = pokemons.slice(pageStart, pageEnd)

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(pages, p + 1))

  return (
    <div className="flex flex-col gap-4">
      {/* Grid */}
      <div
        className="bg-surface-container rounded-xl border border-outline-variant p-3"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '8px',
        }}
      >
        {pagePokemons.map((p) => (
          <BinderSlot
            key={p.id}
            pokemonId={p.id}
            owned={binder.ownedSlots.includes(p.id)}
            onToggle={() => useBinderStore.getState().toggleSlotOwned(binder.id, p.id)}
          />
        ))}
      </div>

      {/* Pagination nav */}
      <div className="flex items-center justify-between bg-surface-container rounded-xl border border-outline-variant px-4 py-2.5">
        <button
          onClick={goPrev}
          disabled={page <= 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          aria-label="Previous page"
        >
          ‹
        </button>

        <span className="text-sm text-on-surface-variant font-medium">
          {page} / {pages}
        </span>

        <button
          onClick={goNext}
          disabled={page >= pages}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  )
}
