import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBinderStore } from '@/stores/binder-store'
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion, getSpriteUrl, REGIONS } from '@/lib/pokemon'
import { EditFolderDrawer } from './edit-folder-drawer'
import { PencilIcon } from 'lucide-react'

type FolderCardProps = {
  binder: Binder
  onClick: () => void
  onMenu?: () => void
}

export function FolderCard({ binder, onClick, onMenu: _onMenu }: FolderCardProps) {
  const navigate = useNavigate()
  const _deleteBinder = useBinderStore((s) => s.deleteBinder)
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
        className="relative bg-surface-container rounded-xl shadow-sm border border-outline-variant overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        onClick={handleClick}
      >
        {/* Cover image or gradient placeholder */}
        <div className="relative h-48 overflow-hidden flex items-center justify-center">
          {binder.coverPokemonId ? (
            <img
              src={getSpriteUrl(binder.coverPokemonId)}
              alt={binder.name}
              className="w-full h-full object-contain p-6"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-container/30 to-secondary-container/20" />
          )}

          {/* Region badge */}
          <span className="absolute top-2 left-2 text-[9px] font-bold text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container/80 backdrop-blur">
            {regionLabel}
          </span>

          {/* Main chip */}
          {binder.isMain && (
            <span className="absolute top-2 right-10 text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
              MAIN DECK
            </span>
          )}

          {/* Edit button */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
              className="size-8 flex items-center justify-center rounded-full bg-surface-container/80 text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Edit"
            >
              <PencilIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-3 py-2.5">
          <p className="font-bold text-on-surface text-sm truncate leading-tight">{binder.name}</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{regionLabel} · {binder.grid}</p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-on-surface-variant">{owned} / {total}</span>
              <span className="text-[10px] font-bold text-on-surface-variant">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <EditFolderDrawer
        binder={binder}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
