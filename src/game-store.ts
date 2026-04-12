import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  EnergyType, GameFormat, GameModules, BoardSlot, FieldSide,
} from '@/game-data'
import { FORMAT_DEFAULTS } from '@/game-data'

export type Side = 'a' | 'b'

export interface GameAction {
  id: string
  side: Side
  type: 'move' | 'damage' | 'energy' | 'slot' | 'turn' | 'coin'
  description: string
  timestamp: number
}

interface GameState {
  format: GameFormat
  modules: GameModules
  energyPool: EnergyType[]
  active: boolean
  turn: number
  fieldA: FieldSide
  fieldB: FieldSide
  energyA: EnergyType | null
  energyB: EnergyType | null
  history: GameAction[]

  logAction: (side: Side, type: GameAction['type'], description: string) => void
  setFormat: (format: GameFormat) => void
  setModules: (modules: GameModules) => void
  setEnergyPool: (pool: EnergyType[]) => void
  startGame: () => void
  endGame: () => void
  nextTurn: () => void
  generateEnergy: (side: Side) => void

  addDamage: (side: Side, slotId: string, amount: number) => void
  clearDamage: (side: Side, slotId: string) => void
  attachEnergy: (side: Side, slotId: string, energy: EnergyType) => void
  removeEnergy: (side: Side, slotId: string, index: number) => void
  removeOneEnergy: (side: Side, slotId: string, energy: EnergyType) => void
  clearEnergies: (side: Side, slotId: string) => void
  addSlot: (side: Side) => void
  removeSlot: (side: Side, slotId: string) => void
  swapSlots: (side: Side, fromId: string, toId: string) => void
}

function createSlots(benchSize: number): BoardSlot[] {
  return [
    { id: nanoid(), position: 'active', damage: 0, energies: [] },
    ...Array.from({ length: benchSize }, () => ({
      id: nanoid(),
      position: 'bench' as const,
      damage: 0,
      energies: [],
    })),
  ]
}

function getField(state: GameState, side: Side): FieldSide {
  return side === 'a' ? state.fieldA : state.fieldB
}

function fieldKey(side: Side): 'fieldA' | 'fieldB' {
  return side === 'a' ? 'fieldA' : 'fieldB'
}

function updateSlots(
  field: FieldSide,
  updater: (slots: BoardSlot[]) => BoardSlot[]
): FieldSide {
  return { slots: updater(field.slots) }
}

const initialModules: GameModules = { coins: true, energy: false, board: true }

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      format: 'standard',
      modules: initialModules,
      energyPool: [],
      active: false,
      turn: 0,
      fieldA: { slots: [] },
      fieldB: { slots: [] },
      energyA: null,
      energyB: null,
      history: [],

      logAction: (side, type, description) =>
        set((s) => ({
          history: [...s.history, {
            id: nanoid(),
            side,
            type,
            description,
            timestamp: Date.now(),
          }],
        })),

      setFormat: (format) => {
        const defaults = FORMAT_DEFAULTS[format]
        set({ format, modules: { ...defaults.modules } })
      },

      setModules: (modules) => set({ modules }),

      setEnergyPool: (pool) => set({ energyPool: pool }),

      startGame: () => {
        const { format } = get()
        const { benchSize } = FORMAT_DEFAULTS[format]
        set({
          active: true,
          turn: 1,
          fieldA: { slots: createSlots(benchSize) },
          fieldB: { slots: createSlots(benchSize) },
          energyA: null,
          energyB: null,
          history: [],
        })
      },

      endGame: () =>
        set({
          active: false,
          turn: 0,
          fieldA: { slots: [] },
          fieldB: { slots: [] },
          energyA: null,
          energyB: null,
          history: [],
        }),

      nextTurn: () =>
        set(() => ({
          turn: get().turn + 1,
          energyA: null,
          energyB: null,
        })),

      generateEnergy: (side) => {
        const { energyPool } = get()
        if (energyPool.length === 0) return
        const energy = energyPool[Math.floor(Math.random() * energyPool.length)]
        set(side === 'a' ? { energyA: energy } : { energyB: energy })
      },

      addDamage: (side, slotId, amount) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) =>
              sl.id === slotId
                ? { ...sl, damage: Math.max(0, sl.damage + amount) }
                : sl
            )
          ),
        })),

      clearDamage: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => (sl.id === slotId ? { ...sl, damage: 0 } : sl))
          ),
        })),

      attachEnergy: (side, slotId, energy) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) =>
              sl.id === slotId
                ? { ...sl, energies: [...sl.energies, energy] }
                : sl
            )
          ),
        })),

      removeEnergy: (side, slotId, index) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) =>
              sl.id === slotId
                ? { ...sl, energies: sl.energies.filter((_, i) => i !== index) }
                : sl
            )
          ),
        })),

      removeOneEnergy: (side, slotId, energy) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => {
              if (sl.id !== slotId) return sl
              const idx = sl.energies.indexOf(energy)
              if (idx === -1) return sl
              return { ...sl, energies: sl.energies.filter((_, i) => i !== idx) }
            })
          ),
        })),

      clearEnergies: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => (sl.id === slotId ? { ...sl, energies: [] } : sl))
          ),
        })),

      addSlot: (side) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) => [
            ...slots,
            { id: nanoid(), position: 'bench', damage: 0, energies: [] },
          ]),
        })),

      removeSlot: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.filter((sl) => sl.id !== slotId)
          ),
        })),

      swapSlots: (side, fromId, toId) =>
        set((s) => {
          const field = getField(s, side)
          const fromIdx = field.slots.findIndex((sl) => sl.id === fromId)
          const toIdx = field.slots.findIndex((sl) => sl.id === toId)
          if (fromIdx === -1 || toIdx === -1) return {}
          const newSlots = [...field.slots]
          const fromPos = newSlots[fromIdx].position
          const toPos = newSlots[toIdx].position
          newSlots[fromIdx] = { ...newSlots[fromIdx], position: toPos }
          newSlots[toIdx] = { ...newSlots[toIdx], position: fromPos }
          ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
          const desc = `${fromPos} ↔ ${toPos}`
          return {
            [fieldKey(side)]: { slots: newSlots },
            history: [...s.history, { id: nanoid(), side, type: 'move' as const, description: desc, timestamp: Date.now() }],
          }
        }),
    }),
    { name: 'pokedex-tcg-game' }
  )
)

export function flipCoins(count: number): boolean[] {
  return Array.from({ length: count }, () => Math.random() >= 0.5)
}
