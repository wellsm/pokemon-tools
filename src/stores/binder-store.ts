import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { RegionKey } from '@/lib/pokemon'

export type BinderGrid = '3x3' | '4x3' | '2x2' | '4x4' | '5x4'

export type Binder = {
  id: string
  name: string
  region: RegionKey
  grid: BinderGrid
  coverPokemonId?: number
  ownedSlots: number[]      // pokemon IDs
  createdAt: number
  updatedAt: number
}

type CreateInput = Pick<Binder, 'name' | 'region' | 'grid'> &
  Partial<Pick<Binder, 'coverPokemonId'>>

interface BinderStore {
  binders: Binder[]
  createBinder: (input: CreateInput) => string
  deleteBinder: (id: string) => void
  renameBinder: (id: string, name: string) => void
  toggleSlotOwned: (id: string, pokemonId: number) => void
  setCover: (id: string, pokemonId: number | undefined) => void
}

const touch = (b: Binder): Binder => ({ ...b, updatedAt: Date.now() })

export const useBinderStore = create<BinderStore>()(
  persist(
    (set) => ({
      binders: [],

      createBinder: (input) => {
        const id = nanoid()
        const now = Date.now()
        set((s) => ({
          binders: [
            ...s.binders,
            { ...input, id, ownedSlots: [], createdAt: now, updatedAt: now },
          ],
        }))
        return id
      },

      deleteBinder: (id) =>
        set((s) => ({ binders: s.binders.filter((b) => b.id !== id) })),

      renameBinder: (id, name) =>
        set((s) => ({
          binders: s.binders.map((b) => (b.id === id ? touch({ ...b, name }) : b)),
        })),

      toggleSlotOwned: (id, pokemonId) =>
        set((s) => ({
          binders: s.binders.map((b) => {
            if (b.id !== id) return b
            const has = b.ownedSlots.includes(pokemonId)
            return touch({
              ...b,
              ownedSlots: has
                ? b.ownedSlots.filter((p) => p !== pokemonId)
                : [...b.ownedSlots, pokemonId],
            })
          }),
        })),

      setCover: (id, pokemonId) =>
        set((s) => ({
          binders: s.binders.map((b) =>
            b.id === id ? touch({ ...b, coverPokemonId: pokemonId }) : b
          ),
        })),
    }),
    {
      name: 'pokemon-tools/binders/v1',
      version: 1,
    }
  )
)

export function getBinderProgress(b: Binder, totalSlots: number) {
  return { owned: b.ownedSlots.length, total: totalSlots }
}
