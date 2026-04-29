import { useEffect, useState } from 'react'
import { useBinderStore } from '@/stores/binder-store'
import type { BinderGrid } from '@/stores/binder-store'
import { REGIONS, type RegionKey } from '@/lib/pokemon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useT } from '@/lib/i18n/store'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GRIDS: { label: string; value: BinderGrid }[] = [
  { label: '3×3', value: '3x3' },
  { label: '4×3', value: '4x3' },
  { label: '2×2', value: '2x2' },
  { label: '4×4', value: '4x4' },
  { label: '5×4', value: '5x4' },
]

export function CreateModal({ open, onOpenChange }: Props) {
  const t = useT()
  const isMobile = useIsMobile()
  const [region, setRegion] = useState<RegionKey>('kanto')
  const [nameTouched, setNameTouched] = useState(false)
  const [name, setName] = useState('')
  const [grid, setGrid] = useState<BinderGrid>('3x3')

  useEffect(() => {
    if (open) {
      setRegion('kanto')
      setName('')
      setNameTouched(false)
      setGrid('3x3')
    }
  }, [open])

  const regionLabel = REGIONS.find((r) => r.key === region)?.label ?? region
  const defaultName = t.create.defaultName(regionLabel)
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
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'bg-card border-0 max-h-[85vh] overflow-y-auto p-4'
            : 'bg-card border-0 h-full overflow-y-auto p-4'
        }
      >
        <SheetHeader>
          <SheetTitle className="text-foreground">{t.create.title}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-6">
          {/* Region */}
          <div className="space-y-1.5">
            <Label htmlFor="create-region" className="text-muted-foreground">{t.create.region}</Label>
            <NativeSelect
              id="create-region"
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionKey)}
              className="bg-card border-border text-foreground"
            >
              {REGIONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="create-name" className="text-muted-foreground">{t.create.name}</Label>
            <Input
              id="create-name"
              value={displayName}
              onChange={(e) => { setNameTouched(true); setName(e.target.value) }}
              placeholder={defaultName}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Grid */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">{t.create.grid}</Label>
            <div className="flex gap-2">
              {GRIDS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGrid(g.value)}
                  className={`flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                    grid === g.value
                      ? 'bg-primary text-primary-foreground border-border'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90"
          >
            {t.create.submit}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
