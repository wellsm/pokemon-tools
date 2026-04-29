import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { searchPokemon, getSpriteUrl, type RegionKey } from '@/lib/pokemon'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/store'

interface Props {
  region: RegionKey
  onSelect: (pokemonId: number) => void
  resultsPosition?: 'top' | 'bottom'
  className?: string
}

export function BinderSearchBar({ region, onSelect, resultsPosition = 'bottom', className }: Props) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const numeric = /\d/.test(query)
    if (!numeric && query.length < 3) return []
    return searchPokemon(query, region)
  }, [query, region])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handlePick = (id: number) => {
    onSelect(id)
    setQuery('')
    setOpen(false)
  }

  const showDropdown = open && query.length > 0
  const dropdownPos = resultsPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={t.search.placeholder}
          className="flex-1 h-8 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false) }}
            aria-label={t.search.clear}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className={cn(
            'absolute left-0 right-0 z-40 bg-card border border-border rounded-xl shadow-xl max-h-72 overflow-y-auto',
            dropdownPos,
          )}
        >
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              {query.length < 3 ? t.search.tooShort : t.search.notFound}
            </p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePick(p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left"
              >
                <img
                  src={getSpriteUrl(p.id, 'official')}
                  alt={p.name}
                  loading="lazy"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate capitalize">{p.name}</p>
                  <p className="text-xs text-muted-foreground">#{String(p.id).padStart(3, '0')}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
