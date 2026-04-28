import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

// ── Export / Import helpers ──────────────────────────────────

export function exportData() {
  const { folders } = useBinderStore.getState()
  const blob = new Blob([JSON.stringify(folders, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `pokedex-tcg-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isValidFolder(f: unknown): f is Folder {
  if (typeof f !== 'object' || f === null) return false
  const obj = f as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.cols === 'number' &&
    typeof obj.rows === 'number' &&
    typeof obj.totalSlots === 'number' &&
    (obj.mode === 'pokedex' || obj.mode === 'free') &&
    Array.isArray(obj.slots)
  )
}

export function validateImport(json: unknown): Folder[] | null {
  if (!Array.isArray(json)) return null
  if (!json.every(isValidFolder)) return null
  return json as Folder[]
}

export interface SlotEntry {
  slotIndex: number
  pokemonId: number
  collected: boolean
}

export interface Folder {
  id: string
  name: string
  coverImage?: string  // base64
  cols: number
  rows: number
  back: boolean
  mode: 'pokedex' | 'free'
  totalSlots: number   // pokedex=1025, free=user-defined
  slots: SlotEntry[]
  createdAt: number
}

interface BinderStore {
  folders: Folder[]
  addFolder: (data: Omit<Folder, 'id' | 'slots' | 'createdAt'>) => void
  updateFolder: (id: string, data: Partial<Omit<Folder, 'id' | 'slots' | 'createdAt'>>) => void
  removeFolder: (id: string) => void
  toggleCollected: (folderId: string, slotIndex: number, pokemonId: number) => void
  assignSlot: (folderId: string, slotIndex: number, pokemonId: number) => void
  removeSlot: (folderId: string, slotIndex: number) => void
  importFolders: (folders: Folder[], mode: 'replace' | 'merge') => void
}

export const useBinderStore = create<BinderStore>()(
  persist(
    (set) => ({
      folders: [],

      addFolder: (data) =>
        set((s) => ({
          folders: [
            ...s.folders,
            { ...data, id: nanoid(), slots: [], createdAt: Date.now() },
          ],
        })),

      updateFolder: (id, data) =>
        set((s) => ({
          folders: s.folders.map((f) => (f.id !== id ? f : { ...f, ...data })),
        })),

      removeFolder: (id) =>
        set((s) => ({ folders: s.folders.filter((f) => f.id !== id) })),

      toggleCollected: (folderId, slotIndex, pokemonId) =>
        set((s) => ({
          folders: s.folders.map((f) => {
            if (f.id !== folderId) return f
            const existing = f.slots.find((sl) => sl.slotIndex === slotIndex)
            if (existing) {
              return {
                ...f,
                slots: f.slots.map((sl) =>
                  sl.slotIndex === slotIndex
                    ? { ...sl, collected: !sl.collected }
                    : sl
                ),
              }
            }
            return {
              ...f,
              slots: [...f.slots, { slotIndex, pokemonId, collected: true }],
            }
          }),
        })),

      assignSlot: (folderId, slotIndex, pokemonId) =>
        set((s) => ({
          folders: s.folders.map((f) => {
            if (f.id !== folderId) return f
            const withoutSlot = f.slots.filter((sl) => sl.slotIndex !== slotIndex)
            return {
              ...f,
              slots: [...withoutSlot, { slotIndex, pokemonId, collected: false }],
            }
          }),
        })),

      removeSlot: (folderId, slotIndex) =>
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id !== folderId
              ? f
              : { ...f, slots: f.slots.filter((sl) => sl.slotIndex !== slotIndex) }
          ),
        })),

      importFolders: (folders, mode) =>
        set((s) => ({
          folders: mode === 'replace' ? folders : [...s.folders, ...folders],
        })),
    }),
    { name: 'pokedex-tcg-store' }
  )
)
