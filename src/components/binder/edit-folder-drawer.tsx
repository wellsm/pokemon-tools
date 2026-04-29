import { useState } from 'react'
import { useBinderStore } from '@/stores/binder-store'
import type { Binder } from '@/stores/binder-store'
import { getPokemonByRegion, getSpriteUrl } from '@/lib/pokemon'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/store'

interface Props {
  binder: Binder
  open: boolean
  onClose: () => void
}

function EditForm({ binder, onClose }: { binder: Binder; onClose: () => void }) {
  const t = useT()
  const renameBinder = useBinderStore((s) => s.renameBinder)
  const setCover = useBinderStore((s) => s.setCover)
  const deleteBinder = useBinderStore((s) => s.deleteBinder)

  const [name, setName] = useState(binder.name)
  const [coverSearch, setCoverSearch] = useState('')
  const [coverPokemonId, setCoverPokemonId] = useState<number | undefined>(binder.coverPokemonId)
  const [deleteOpen, setDeleteOpen] = useState(false)

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
    onClose()
  }

  const handleDeleteConfirmed = () => {
    deleteBinder(binder.id)
    setDeleteOpen(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-6 pt-2 overflow-y-auto">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">{t.binderEdit.name}</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.binderEdit.namePlaceholder}
          required
          className="bg-card border-border"
        />
      </div>

      {/* Cover Pokemon */}
      <div className="space-y-1.5">
        <Label>{t.binderEdit.cover.label}</Label>
        {coverPokemonId && (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={getSpriteUrl(coverPokemonId)}
              alt={`#${coverPokemonId}`}
              className="w-12 h-12 object-contain rounded-xl border border-border bg-muted"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => { setCoverPokemonId(undefined); setCoverSearch('') }}
            >
              {t.binderEdit.cover.remove}
            </Button>
          </div>
        )}
        <Input
          value={coverSearch}
          onChange={(e) => setCoverSearch(e.target.value)}
          placeholder={t.binderEdit.cover.searchPlaceholder}
          className="bg-card border-border"
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
                    ? 'bg-primary text-primary-foreground border-border'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary'
                  }`}
              >
                <img src={getSpriteUrl(p.id, 'sprite')} alt="" className="w-5 h-5 object-contain" />
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={!name.trim()} className="mt-auto"
        size="lg">
        {t.binderEdit.save}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="text-primary hover:text-primary-foreground hover:bg-primary/20"
        onClick={() => setDeleteOpen(true)}
      >
        {t.binderEdit.delete}
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.binderEdit.deleteConfirm.title(binder.name)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.binderEdit.deleteConfirm.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.binderEdit.deleteConfirm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.binderEdit.deleteConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

export function EditFolderDrawer({ binder, open, onClose }: Props) {
  const t = useT()
  const isMobile = useIsMobile()

  // if (isMobile) {
  //   return (
  //     <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
  //       <DrawerContent className="max-h-[90vh] bg-background">
  //         <DrawerHeader>
  //           <DrawerTitle className="text-foreground">Edit binder</DrawerTitle>
  //         </DrawerHeader>
  //         <EditForm binder={binder} onClose={onClose} />
  //       </DrawerContent>
  //     </Drawer>
  //   )
  // }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={cn("p-0 flex flex-col bg-background", isMobile ? "max-h-[90vh]" : "h-full")}>
        <SheetHeader className="px-4 pt-5 pb-2">
          <SheetTitle className="text-foreground">{t.binderEdit.title}</SheetTitle>
        </SheetHeader>
        <EditForm binder={binder} onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
