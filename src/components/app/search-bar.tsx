import { useEffect, useRef, useState } from 'react'
import { searchPokemon, ARTWORK_URL, TYPE_COLOR } from '@/pokemon-data'
import type { Pokemon } from '@/pokemon-data'

interface Props {
  onSelect: (pokemon: Pokemon) => void
  placeholder?: string
}

export function SearchBar({ onSelect, placeholder = '3 letters or number...' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Pokemon[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lettersOnly = !/\d/.test(query)
    if (lettersOnly && query.length < 3) { setResults([]); setOpen(false); return }
    setResults(searchPokemon(query))
    setOpen(query.length > 0)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (p: Pokemon) => {
    onSelect(p)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative hidden md:block w-56 lg:w-72">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
        <span className="text-gray-400 text-xs">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="text-gray-400 hover:text-gray-600 text-sm leading-none"
          >×</button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Not found</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
              >
                <img src={ARTWORK_URL(p.id)} alt={p.name} className="w-8 h-8 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-400">#{String(p.id).padStart(3, '0')}</span>
                    {p.types.map((t) => (
                      <span
                        key={t}
                        className="text-[8px] font-bold text-white px-1 py-px rounded-full"
                        style={{ background: TYPE_COLOR[t] ?? '#9E9E9E' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
