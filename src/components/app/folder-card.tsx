import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBinderStore } from '@/store'
import { EditFolderDrawer } from './edit-folder-drawer'
import type { Folder } from '@/store'
import { PencilIcon, XIcon } from 'lucide-react'

interface Props { folder: Folder }

export function FolderCard({ folder }: Props) {
  const navigate = useNavigate()
  const removeFolder = useBinderStore((s) => s.removeFolder)
  const [editOpen, setEditOpen] = useState(false)

  const collected = folder.slots.filter((s) => s.collected).length
  const progress = folder.totalSlots > 0 ? collected / folder.totalSlots : 0

  return (
    <>
      <div
        className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        onClick={() => navigate(`/colecao/${folder.id}`)}
      >
        {/* Cover image or gradient placeholder */}
        <div className="relative h-64 overflow-hidden flex items-center justify-center p-12 sm:p-6">
          {folder.coverImage ? (
            <img src={folder.coverImage} alt={folder.name} className="w-full h-full object-contain" />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: folder.mode === 'pokedex'
                  ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            />
          )}

          {/* Mode badge */}
          <span
            className="absolute top-2 left-2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
            style={{
              background: folder.mode === 'pokedex' ? 'rgba(239,68,68,0.85)' : 'rgba(99,102,241,0.85)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {folder.mode === 'pokedex' ? 'Pokédex' : 'Free'}
          </span>

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
              className="size-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors text-xs"
              aria-label="Edit"
            >
              <PencilIcon className="size-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Remove "${folder.name}"?`)) removeFolder(folder.id)
              }}
              className="size-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors text-xs leading-none"
              aria-label="Remove"
            >
              <XIcon className="size-6" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-3 py-2.5">
          <p className="font-bold text-gray-900 text-sm truncate leading-tight">{folder.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {folder.cols}×{folder.rows}{folder.back ? ' · F+V' : ''}
          </p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400">{collected} / {folder.totalSlots}</span>
              <span className="text-[10px] font-bold text-gray-500">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress * 100}%`,
                  background: folder.mode === 'pokedex'
                    ? 'linear-gradient(90deg, #ef4444, #f97316)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <EditFolderDrawer folder={folder} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  )
}
