import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useBinderStore } from '@/stores/binder-store'
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion } from '@/lib/pokemon'
import { parseFormat, totalPages, pageCapacity } from '@/lib/binder-math'
import { BinderSlot } from './binder-slot'
import { BinderSearchBar } from './binder-search-bar'
import { useT } from '@/lib/i18n/store'

interface Props {
  binder: Binder
}

const DESKTOP_QUERY = '(min-width: 1024px)'
const HIGHLIGHT_MS = 5000

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(DESKTOP_QUERY)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  )
}

export function BinderPaginator({ binder }: Props) {
  const t = useT()
  const [page, setPage] = useState(1)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const highlightTimer = useRef<number | null>(null)
  const isDesktop = useIsDesktop()

  const pokemons = getPokemonByRegion(binder.region)
  const { cols, rows } = parseFormat(binder.grid)
  const config = { cols, rows, back: false }
  const cap = pageCapacity(config)
  const pages = totalPages(pokemons.length, config)

  const step = isDesktop ? 2 : 1
  const leftStart = (page - 1) * cap
  const leftEnd = Math.min(leftStart + cap, pokemons.length)
  const leftPokemons = pokemons.slice(leftStart, leftEnd)

  const rightStart = leftStart + cap
  const rightEnd = Math.min(rightStart + cap, pokemons.length)
  const rightPokemons = isDesktop ? pokemons.slice(rightStart, rightEnd) : []

  const goPrev = () => setPage((p) => Math.max(1, p - step))
  const goNext = () => setPage((p) => Math.min(pages, p + step))

  const goToPokemon = (id: number) => {
    const idx = pokemons.findIndex((p) => p.id === id)
    if (idx < 0) return
    const targetPage = Math.floor(idx / cap) + 1
    setPage(targetPage)
    setHighlightedId(id)
    if (highlightTimer.current !== null) {
      clearTimeout(highlightTimer.current)
    }
    highlightTimer.current = window.setTimeout(() => {
      setHighlightedId(null)
      highlightTimer.current = null
    }, HIGHLIGHT_MS)
  }

  useEffect(() => {
    return () => {
      if (highlightTimer.current !== null) clearTimeout(highlightTimer.current)
    }
  }, [])

  const showRight = isDesktop && page < pages
  const rightLabel = showRight ? page + 1 : null
  const pageLabel = rightLabel ? `${page}–${rightLabel}` : `${page}`

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    gap: '8px',
  } as const

  const renderGrid = (slice: typeof pokemons) => (
    <div className="rounded-xl sm:p-3 flex-1 min-h-0 sm:bg-muted" style={gridStyle}>
      {slice.map((p) => (
        <BinderSlot
          key={p.id}
          pokemonId={p.id}
          owned={binder.ownedSlots.includes(p.id)}
          highlighted={p.id === highlightedId}
          onToggle={() => useBinderStore.getState().toggleSlotOwned(binder.id, p.id)}
        />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-row gap-3 flex-1 min-h-0 px-4 pt-3 order-1 lg:order-2">
        {renderGrid(leftPokemons)}
        {isDesktop && (
          showRight
            ? renderGrid(rightPokemons)
            : <div className="rounded-xl flex-1 min-h-0 bg-muted/40 border border-dashed border-border" />
        )}
      </div>

      <div className="px-4 mt-4 order-2 lg:order-1 lg:pt-3">
        <BinderSearchBar
          region={binder.region}
          onSelect={goToPokemon}
          resultsPosition={isDesktop ? 'bottom' : 'top'}
        />
      </div>

      <div className="p-4 order-3">
        <div className="flex items-center justify-between bg-card rounded-xl border border-border px-4 py-2">
          <button
            onClick={goPrev}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
            aria-label={t.pagination.previous}
          >
            ‹
          </button>

          <span className="text-sm text-muted-foreground font-medium">
            {pageLabel} / {pages}
          </span>

          <button
            onClick={goNext}
            disabled={page >= pages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
            aria-label={t.pagination.next}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
