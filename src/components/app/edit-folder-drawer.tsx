import { useRef, useState } from 'react'
import { useBinderStore } from '@/store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { Folder } from '@/store'

interface Props {
  folder: Folder
  open: boolean
  onClose: () => void
}

const PRESETS = [
  { label: '3×3', cols: 3, rows: 3 },
  { label: '4×3', cols: 4, rows: 3 },
  { label: '5×4', cols: 5, rows: 4 },
]

function EditForm({ folder, onClose }: { folder: Folder; onClose: () => void }) {
  const updateFolder = useBinderStore((s) => s.updateFolder)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(folder.name)
  const [cols, setCols] = useState(folder.cols)
  const [rows, setRows] = useState(folder.rows)
  const [back, setBack] = useState(folder.back)
  const [totalSlots, setTotalSlots] = useState(folder.totalSlots)
  const [coverImage, setCoverImage] = useState<string | undefined>(folder.coverImage)
  const [coverPreview, setCoverPreview] = useState<string | undefined>(folder.coverImage)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setCoverImage(result)
      setCoverPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const slots = folder.mode === 'pokedex' ? 1025 : totalSlots
    updateFolder(folder.id, { name: name.trim(), cols, rows, back, totalSlots: slots, coverImage })
    onClose()
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
        />
      </div>

      {/* Layout presets */}
      <div className="space-y-1.5">
        <Label>Grid</Label>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => { setCols(p.cols); setRows(p.rows) }}
              className={`flex-1 py-1.5 rounded-lg text-sm font-bold border-2 transition-colors ${
                cols === p.cols && rows === p.rows
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Back toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="edit-back">Front + Back</Label>
          <p className="text-xs text-muted-foreground mt-0.5">2× slots per sheet</p>
        </div>
        <Switch id="edit-back" checked={back} onCheckedChange={setBack} />
      </div>

      {/* Total slots (free mode only) */}
      {folder.mode === 'free' && (
        <div className="space-y-1.5">
          <Label htmlFor="edit-slots">Total slots</Label>
          <Input
            id="edit-slots"
            type="number"
            min={1}
            max={9999}
            value={totalSlots}
            onChange={(e) => setTotalSlots(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      )}

      {/* Cover image */}
      <div className="space-y-1.5">
        <Label>Cover</Label>
        <div className="flex items-center gap-3">
          {coverPreview ? (
            <img src={coverPreview} className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" alt="cover" />
          ) : (
            <div className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xl flex-shrink-0">🖼</div>
          )}
          <div className="flex flex-col gap-1 flex-1">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              {coverPreview ? 'Change image' : 'Select image'}
            </Button>
            {coverPreview && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                onClick={() => { setCoverImage(undefined); setCoverPreview(undefined) }}>
                Remove cover
              </Button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>
      </div>

      <Button type="submit" disabled={!name.trim()} className="mt-auto">
        Save changes
      </Button>
    </form>
  )
}

export function EditFolderDrawer({ folder, open, onClose }: Props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Edit binder</DrawerTitle>
          </DrawerHeader>
          <EditForm folder={folder} onClose={onClose} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col">
        <SheetHeader className="px-4 pt-5 pb-2">
          <SheetTitle>Edit binder</SheetTitle>
        </SheetHeader>
        <EditForm folder={folder} onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
