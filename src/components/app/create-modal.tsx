import { useRef, useState } from 'react'
import { useBinderStore } from '@/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

interface Props { onClose: () => void }

const PRESETS = [
  { label: '3×3', cols: 3, rows: 3 },
  { label: '4×3', cols: 4, rows: 3 },
  { label: '5×4', cols: 5, rows: 4 },
]

export function CreateModal({ onClose }: Props) {
  const addFolder = useBinderStore((s) => s.addFolder)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [mode, setMode] = useState<'pokedex' | 'free'>('pokedex')
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)
  const [back, setBack] = useState(false)
  const [totalSlots, setTotalSlots] = useState(100)
  const [coverImage, setCoverImage] = useState<string | undefined>()
  const [coverPreview, setCoverPreview] = useState<string | undefined>()

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
    const slots = mode === 'pokedex' ? 1025 : totalSlots
    addFolder({ name: name.trim(), cols, rows, back, mode, totalSlots: slots, coverImage })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-5 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">New binder</h2>
              <button type="button" onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors text-xl leading-none">×</button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g.: Complete Pokédex"
                required
              />
            </div>

            {/* Mode */}
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['pokedex', 'free'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      mode === m
                        ? m === 'pokedex'
                          ? 'border-red-400 bg-red-50 text-red-600'
                          : 'border-indigo-400 bg-indigo-50 text-indigo-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {m === 'pokedex' ? '🎮 Pokédex' : '📁 Free'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">
                {mode === 'pokedex'
                  ? 'Slots by Pokémon ID (1–1025)'
                  : 'Free slots — you choose the Pokémon for each'}
              </p>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label>Grid</Label>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setCols(p.cols); setRows(p.rows) }}
                    className={`flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                      cols === p.cols && rows === p.rows
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <Label htmlFor="create-back" className="text-sm">Front + Back</Label>
                  <p className="text-[10px] text-muted-foreground">2× slots per sheet</p>
                </div>
                <Switch id="create-back" checked={back} onCheckedChange={setBack} />
              </div>
            </div>

            {/* Total slots (free mode) */}
            {mode === 'free' && (
              <div className="space-y-1.5">
                <Label htmlFor="create-slots">Total slots</Label>
                <Input
                  id="create-slots"
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
              <Label>Cover (optional)</Label>
              <div className="flex items-center gap-3">
                {coverPreview ? (
                  <img src={coverPreview} className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0" alt="cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xl flex-shrink-0">🖼</div>
                )}
                <Button type="button" variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                  {coverPreview ? 'Change image' : 'Select image'}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <Button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 rounded-2xl font-bold text-sm"
              style={{
                background: mode === 'pokedex'
                  ? 'linear-gradient(135deg, #ef4444, #f97316)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              Create binder
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
