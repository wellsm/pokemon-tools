import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBinderStore } from '@/store'
import { totalPages, pageCapacity } from '@/lib/binder-math'
import { BinderPage } from '@/components/app/binder-page'
import { SearchModal } from '@/components/app/search-modal'
import { SearchDrawer } from '@/components/app/search-drawer'
import { SearchBar } from '@/components/app/search-bar'
import { EditFolderDrawer } from '@/components/app/edit-folder-drawer'
import type { Folder } from '@/store'
import type { Pokemon } from '@/pokemon-data'
import { cn } from '@/lib/utils'

interface Props { folder: Folder }

export function BinderView({ folder }: Props) {
  const navigate = useNavigate()
  const assignSlot = useBinderStore((s) => s.assignSlot)

  const config = { cols: folder.cols, rows: folder.rows, back: folder.back }
  const pages = totalPages(folder.totalSlots, config)
  const spreads = Math.ceil(pages / 2)

  const [spread, setSpread] = useState(0)
  const [mobileOffset, setMobileOffset] = useState(0)
  const [navInput, setNavInput] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [slotToAssign, setSlotToAssign] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [highlightedSlotIndex, setHighlightedSlotIndex] = useState<number | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHighlight = useCallback(() => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    setHighlightedSlotIndex(null)
  }, [])

  const leftPage = spread * 2 + 1
  const rightPage = leftPage + 1 <= pages ? leftPage + 1 : null
  const mobilePage = mobileOffset === 1 && rightPage !== null ? rightPage : leftPage

  const goToPage = useCallback((p: number) => {
    const clamped = Math.max(1, Math.min(p, pages))
    setSpread(Math.floor((clamped - 1) / 2))
    setMobileOffset((clamped - 1) % 2)
  }, [pages])

  const desktopGoPrev = () => setSpread((s) => Math.max(0, s - 1))
  const desktopGoNext = () => setSpread((s) => Math.min(s + 1, spreads - 1))

  const mobileGoPrev = () => {
    if (mobileOffset === 1) { setMobileOffset(0) }
    else if (spread > 0) { setSpread((s) => s - 1); setMobileOffset(1) }
  }
  const mobileGoNext = () => {
    if (mobileOffset === 0 && rightPage !== null) { setMobileOffset(1) }
    else if (spread < spreads - 1) { setSpread((s) => s + 1); setMobileOffset(0) }
  }

  const handleNavSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(navInput)
    if (!isNaN(p)) { goToPage(p); setNavInput('') }
  }

  const handleSearchSelect = useCallback((pokemon: Pokemon) => {
    setSearchOpen(false)
    if (folder.mode === 'pokedex') {
      const cap = pageCapacity(config)
      goToPage(Math.floor((pokemon.id - 1) / cap) + 1)
      // Highlight the card for 5 seconds
      clearHighlight()
      const slotIndex = pokemon.id - 1
      setHighlightedSlotIndex(slotIndex)
      highlightTimeoutRef.current = setTimeout(() => setHighlightedSlotIndex(null), 5000)
    }
  }, [folder.mode, config, goToPage, clearHighlight])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlotAssign = useCallback((pokemon: Pokemon) => {
    if (slotToAssign !== null) {
      assignSlot(folder.id, slotToAssign, pokemon.id)
      setSlotToAssign(null)
    }
  }, [slotToAssign, folder.id, assignSlot])

  const handleEmptySlotClick = useCallback((slotIndex: number) => {
    if (folder.mode === 'free') setSlotToAssign(slotIndex)
  }, [folder.mode])

  const collected = folder.slots.filter((s) => s.collected).length

  const navBtnClass = "w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        >←</button>

        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate leading-tight">{folder.name}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {folder.cols}×{folder.rows}{folder.back ? ' · F+V' : ''} ·{' '}
            <span className={folder.mode === 'pokedex' ? 'text-red-500' : 'text-indigo-500'}>
              {folder.mode === 'pokedex' ? 'Pokédex' : 'Free'}
            </span>
            {' · '}{collected}/{folder.totalSlots} ✓
          </p>
        </div>

        {/* Desktop: inline search bar */}
        {folder.mode === 'pokedex' && (
          <SearchBar onSelect={handleSearchSelect} />
        )}

        {/* Edit button */}
        <button
          onClick={() => setEditOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 flex-shrink-0 text-sm"
          aria-label="Edit binder"
        >✏️</button>

        {/* Mobile: search button */}
        {folder.mode === 'pokedex' && (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 flex-shrink-0 md:hidden"
          >🔍</button>
        )}
      </header>

      {/* Pages */}
      <div className="flex-1 overflow-auto p-3 md:p-5">
        <div className={cn("flex gap-4 h-full mx-auto items-center", folder.cols === 5 ? "w-full px-4" : "max-w-5xl")}>
          <div className="flex flex-1 md:hidden">
            <BinderPage folder={folder} pageNumber={mobilePage} highlightedSlotIndex={highlightedSlotIndex} onEmptySlotClick={handleEmptySlotClick} onHighlightClear={clearHighlight} />
          </div>
          <div className="hidden md:flex flex-1">
            <BinderPage folder={folder} pageNumber={leftPage} highlightedSlotIndex={highlightedSlotIndex} onEmptySlotClick={handleEmptySlotClick} onHighlightClear={clearHighlight} />
          </div>
          {rightPage !== null ? (
            <div className="hidden md:flex flex-1">
              <BinderPage folder={folder} pageNumber={rightPage} highlightedSlotIndex={highlightedSlotIndex} onEmptySlotClick={handleEmptySlotClick} onHighlightClear={clearHighlight} />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-gray-100 text-7xl select-none">
              📖
            </div>
          )}
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={mobileGoPrev} disabled={mobilePage <= 1} className={`${navBtnClass} md:hidden`}>‹</button>
          <button onClick={desktopGoPrev} disabled={spread === 0} className={`${navBtnClass} hidden md:flex`}>‹</button>

          <div className="flex-1 text-center text-sm text-gray-600 font-medium">
            <span className="hidden md:inline">{leftPage}{rightPage ? `–${rightPage}` : ''} / {pages}</span>
            <span className="md:hidden">{mobilePage} / {pages}</span>
          </div>

          <button onClick={mobileGoNext} disabled={mobilePage >= pages} className={`${navBtnClass} md:hidden`}>›</button>
          <button onClick={desktopGoNext} disabled={spread >= spreads - 1} className={`${navBtnClass} hidden md:flex`}>›</button>

          <form onSubmit={handleNavSubmit} className="flex items-center gap-1">
            <input
              type="number"
              min={1} max={pages}
              value={navInput}
              onChange={(e) => setNavInput(e.target.value)}
              placeholder="Page"
              className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </form>
        </div>
      </div>

      {/* Mobile: search drawer (pokedex mode) */}
      {folder.mode === 'pokedex' && (
        <SearchDrawer
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelect={handleSearchSelect}
          title="Go to Pokémon"
        />
      )}

      {/* Slot assign modal (free mode) */}
      {slotToAssign !== null && (
        <SearchModal
          onSelect={handleSlotAssign}
          onClose={() => setSlotToAssign(null)}
          title={`Pokémon for slot ${slotToAssign + 1}`}
        />
      )}

      <EditFolderDrawer folder={folder} open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
