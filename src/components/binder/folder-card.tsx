import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion, getSpriteUrl, REGIONS } from '@/lib/pokemon'
import { EditFolderDrawer } from './edit-folder-drawer'
import { PencilIcon } from 'lucide-react'
import { useT } from '@/lib/i18n/store'

type FolderCardProps = {
  binder: Binder
  onClick: () => void
  onMenu?: () => void
}

export function FolderCard({ binder, onClick, onMenu: _onMenu }: FolderCardProps) {
  const t = useT()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const total = getPokemonByRegion(binder.region).length
  const owned = binder.ownedSlots.length
  const progress = total > 0 ? owned / total : 0

  const regionLabel = REGIONS.find((r) => r.key === binder.region)?.label ?? binder.region

  const handleClick = () => {
    onClick()
    navigate(`/binder/${binder.id}`)
  }

  return (
    <>
      <div
        className="relative bg-card rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] flex sm:flex-col"
        onClick={handleClick}
      >
        {/* Cover image or gradient placeholder */}
        <div className="relative w-28 sm:w-auto h-24 sm:h-48 overflow-hidden flex items-center justify-center shrink-0">
          {binder.coverPokemonId ? (
            <img
              src={getSpriteUrl(binder.coverPokemonId)}
              alt={binder.name}
              className="w-full h-full object-contain p-2 sm:p-6 bg-primary/75"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-container/30 to-secondary-container/20" />
          )}

          {/* Region badge — desktop only (mobile shows it at card level) */}
          <span className="hidden sm:inline-block absolute top-2 left-2 text-[9px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-card/80 backdrop-blur">
            {regionLabel}
          </span>

          {/* Edit button — desktop only */}
          <div className="hidden sm:flex absolute top-2 right-2 gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
              className="size-8 flex items-center justify-center rounded-full bg-card/80 text-foreground hover:bg-muted transition-colors"
              aria-label={t.folderCard.editAria}
            >
              <PencilIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 px-3 py-2.5 sm:pr-3 pr-12">
          <p className="font-bold text-foreground text-sm truncate leading-tight">{binder.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{regionLabel} · {binder.grid}</p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-muted-foreground">{owned} / {total}</span>
              <span className="text-[10px] font-bold text-muted-foreground">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile-only: region badge top-right of card */}
        <span className="sm:hidden absolute top-2 right-2 text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted z-10">
          {regionLabel}
        </span>

        {/* Mobile-only: edit button bottom-right of card */}
        <button
          onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
          className="sm:hidden absolute bottom-2 right-2 size-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label={t.folderCard.editAria}
        >
          <PencilIcon className="size-4" />
        </button>
      </div>

      <EditFolderDrawer
        binder={binder}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
