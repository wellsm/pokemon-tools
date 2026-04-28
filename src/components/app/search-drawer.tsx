import { useEffect, useRef, useState } from 'react'
import { searchPokemon, ARTWORK_URL, TYPE_COLOR } from '@/pokemon-data'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { Pokemon } from '@/pokemon-data'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (pokemon: Pokemon) => void
  title?: string
}

export function SearchDrawer({ open, onClose, onSelect, title = 'Search Pokémon' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Pokemon[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const lettersOnly = !/\d/.test(query)
    if (lettersOnly && query.length < 3) { setResults([]); return }
    setResults(searchPokemon(query))
  }, [query])

  const handleSelect = (p: Pokemon) => {
    onSelect(p)
    onClose()
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="md:hidden">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="3 letters or number..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 text-sm leading-none">×</button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto pb-6" style={{ maxHeight: '50vh' }}>
          {!query && (
            <p className="text-center text-gray-400 text-sm py-8">Type to search</p>
          )}
          {query && results.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Not found</p>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <img src={ARTWORK_URL(p.id)} alt={p.name} className="w-10 h-10 object-contain flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400">#{String(p.id).padStart(3, '0')}</span>
                  {p.types.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-bold text-white px-1.5 py-px rounded-full"
                      style={{ background: TYPE_COLOR[t] ?? '#9E9E9E' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
