import { useEffect, useRef, useState } from 'react'
import { searchPokemon, ARTWORK_URL, TYPE_COLOR } from '@/pokemon-data'
import type { Pokemon } from '@/pokemon-data'

interface Props {
  onSelect: (pokemon: Pokemon) => void
  onClose: () => void
  title?: string
}

export function SearchModal({ onSelect, onClose, title = 'Search Pokémon' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Pokemon[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const lettersOnly = !/\d/.test(query)
    if (lettersOnly && query.length < 3) { setResults([]); return }
    setResults(searchPokemon(query))
  }, [query])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors text-xl leading-none">×</button>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="3 letters or number..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto pb-4">
          {!query && (
            <p className="text-center text-gray-400 text-sm py-8">Type to search</p>
          )}
          {query && results.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Not found</p>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors"
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
      </div>
    </div>
  )
}
