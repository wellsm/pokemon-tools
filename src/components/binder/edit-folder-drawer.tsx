import { useState } from 'react'
import { useBinderStore } from '@/stores/binder-store'
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion, getSpriteUrl } from '@/lib/pokemon'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

interface Props {
  binder: Binder
  open: boolean
  onClose: () => void
}

function EditForm({ binder, onClose }: { binder: Binder; onClose: () => void }) {
  const renameBinder = useBinderStore((s) => s.renameBinder)
  const setCover = useBinderStore((s) => s.setCover)
  const setMain = useBinderStore((s) => s.setMain)
  const deleteBinder = useBinderStore((s) => s.deleteBinder)

  const [name, setName] = useState(binder.name)
  const [isMain, setIsMain] = useState(binder.isMain ?? false)
  const [coverSearch, setCoverSearch] = useState('')
  const [coverPokemonId, setCoverPokemonId] = useState<number | undefined>(binder.coverPokemonId)

  const regionPokemon = getPokemonByRegion(binder.region)
  const filteredPokemon = coverSearch.trim()
    ? regionPokemon.filter((p) =>
        p.name.toLowerCase().includes(coverSearch.toLowerCase()) ||
        String(p.id).includes(coverSearch)
      ).slice(0, 8)
    : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    renameBinder(binder.id, name.trim())
    setCover(binder.id, coverPokemonId)
    if (isMain && !binder.isMain) setMain(binder.id)
    onClose()
  }

  const handleDelete = () => {
    if (confirm(`Delete "${binder.name}"? This cannot be undone.`)) {
      deleteBinder(binder.id)
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-6 pt-2 overflow-y-auto">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Binder name"
          required
          className="bg-surface-container border-outline-variant"
        />
      </div>

      {/* Cover Pokemon */}
      <div className="space-y-1.5">
        <Label>Cover Pokemon (optional)</Label>
        {coverPokemonId && (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={getSpriteUrl(coverPokemonId)}
              alt={`#${coverPokemonId}`}
              className="w-12 h-12 object-contain rounded-xl border border-outline-variant bg-surface-container-high"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-on-surface-variant"
              onClick={() => { setCoverPokemonId(undefined); setCoverSearch('') }}
            >
              Remove cover
            </Button>
          </div>
        )}
        <Input
          value={coverSearch}
          onChange={(e) => setCoverSearch(e.target.value)}
          placeholder="Search by name or #id…"
          className="bg-surface-container border-outline-variant"
        />
        {filteredPokemon.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {filteredPokemon.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setCoverPokemonId(p.id); setCoverSearch('') }}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs border transition-colors
                  ${coverPokemonId === p.id
                    ? 'bg-primary-container text-on-primary-container border-outline'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline'
                  }`}
              >
                <img src={getSpriteUrl(p.id, 'sprite')} alt="" className="w-5 h-5 object-contain" />
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Set as main */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="edit-main">Main Deck</Label>
          <p className="text-xs text-on-surface-variant mt-0.5">Mark as your primary binder</p>
        </div>
        <Switch id="edit-main" checked={isMain} onCheckedChange={setIsMain} />
      </div>

      <Button type="submit" disabled={!name.trim()} className="mt-auto">
        Save changes
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="text-primary-container hover:text-on-primary-container hover:bg-primary-container/20"
        onClick={handleDelete}
      >
        Delete binder
      </Button>
    </form>
  )
}

export function EditFolderDrawer({ binder, open, onClose }: Props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[90vh] bg-surface">
          <DrawerHeader>
            <DrawerTitle className="text-on-surface">Edit binder</DrawerTitle>
          </DrawerHeader>
          <EditForm binder={binder} onClose={onClose} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col bg-surface">
        <SheetHeader className="px-4 pt-5 pb-2">
          <SheetTitle className="text-on-surface">Edit binder</SheetTitle>
        </SheetHeader>
        <EditForm binder={binder} onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
