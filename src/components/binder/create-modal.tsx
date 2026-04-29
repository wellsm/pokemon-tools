import { useState } from 'react'
import { useBinderStore } from '@/stores/binder-store'
import type { BinderGrid } from '@/stores/binder-store'
import { REGIONS, type RegionKey } from '@/lib/pokemon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props { onClose: () => void }

const GRIDS: { label: string; value: BinderGrid }[] = [
  { label: '3×3', value: '3x3' },
  { label: '4×3', value: '4x3' },
  { label: '2×2', value: '2x2' },
  { label: '4×4', value: '4x4' },
]

export function CreateModal({ onClose }: Props) {
  const [region, setRegion] = useState<RegionKey>('kanto')
  const [nameTouched, setNameTouched] = useState(false)
  const [name, setName] = useState('')
  const [grid, setGrid] = useState<BinderGrid>('3x3')

  const regionLabel = REGIONS.find((r) => r.key === region)?.label ?? region
  const defaultName = `Pokédex – ${regionLabel}`
  const displayName = nameTouched ? name : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalName = (nameTouched ? name.trim() : '') || defaultName
    useBinderStore.getState().createBinder({
      name: finalName,
      region,
      grid,
      coverPokemonId: undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-outline-variant">
        <form onSubmit={handleSubmit}>
          <div className="px-5 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-on-surface">New binder</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <Label className="text-on-surface-variant">Region</Label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 snap-x">
                {REGIONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRegion(r.key)}
                    className={`snap-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      region === r.key
                        ? 'bg-primary-container text-on-primary-container border-outline'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="create-name" className="text-on-surface-variant">Name</Label>
              <Input
                id="create-name"
                value={displayName}
                onChange={(e) => { setNameTouched(true); setName(e.target.value) }}
                placeholder={defaultName}
                className="bg-surface-container border-outline-variant text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Grid */}
            <div className="space-y-1.5">
              <Label className="text-on-surface-variant">Grid</Label>
              <div className="flex gap-2">
                {GRIDS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGrid(g.value)}
                    className={`flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                      grid === g.value
                        ? 'bg-primary-container text-on-primary-container border-outline'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <Button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm bg-primary-container text-on-primary-container hover:opacity-90"
            >
              Create binder
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
