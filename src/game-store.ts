// src/game-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  EnergyType, GameFormat, GameModules, BoardSlot, FieldSide,
} from '@/game-data'
import { FORMAT_DEFAULTS } from '@/game-data'

interface GameState {
  format: GameFormat
  modules: GameModules
  energyPool: EnergyType[]
  active: boolean
  turn: number
  myField: FieldSide
  opponentField: FieldSide
  currentEnergy: EnergyType | null
  opponentEnergy: EnergyType | null

  setFormat: (format: GameFormat) => void
  setModules: (modules: GameModules) => void
  setEnergyPool: (pool: EnergyType[]) => void
  startGame: () => void
  endGame: () => void
  nextTurn: () => void
  generateEnergy: (side: 'my' | 'opponent') => void

  addDamage: (side: 'my' | 'opponent', slotId: string, amount: number) => void
  clearDamage: (side: 'my' | 'opponent', slotId: string) => void
  attachEnergy: (side: 'my' | 'opponent', slotId: string, energy: EnergyType) => void
  removeEnergy: (side: 'my' | 'opponent', slotId: string, index: number) => void
  addSlot: (side: 'my' | 'opponent') => void
  removeSlot: (side: 'my' | 'opponent', slotId: string) => void
  swapSlots: (side: 'my' | 'opponent', fromId: string, toId: string) => void
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

function getField(state: GameState, side: 'my' | 'opponent'): FieldSide {
  return side === 'my' ? state.myField : state.opponentField
}

function fieldKey(side: 'my' | 'opponent'): 'myField' | 'opponentField' {
  return side === 'my' ? 'myField' : 'opponentField'
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
      myField: { slots: [] },
      opponentField: { slots: [] },
      currentEnergy: null,
      opponentEnergy: null,

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
          myField: { slots: createSlots(benchSize) },
          opponentField: { slots: createSlots(benchSize) },
          currentEnergy: null,
          opponentEnergy: null,
        })
      },

      endGame: () =>
        set({
          active: false,
          turn: 0,
          myField: { slots: [] },
          opponentField: { slots: [] },
          currentEnergy: null,
          opponentEnergy: null,
        }),

      nextTurn: () =>
        set((s) => ({
          turn: s.turn + 1,
          currentEnergy: null,
          opponentEnergy: null,
        })),

      generateEnergy: (side) => {
        const { energyPool } = get()
        if (energyPool.length === 0) return
        const energy = energyPool[Math.floor(Math.random() * energyPool.length)]
        set(side === 'my' ? { currentEnergy: energy } : { opponentEnergy: energy })
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
          // Swap position fields (handles active↔bench)
          newSlots[fromIdx] = { ...newSlots[fromIdx], position: toPos }
          newSlots[toIdx] = { ...newSlots[toIdx], position: fromPos }
          // Swap array positions (handles visible ordering)
          ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
          return { [fieldKey(side)]: { slots: newSlots } }
        }),
    }),
    { name: 'pokedex-tcg-game' }
  )
)

export function flipCoins(count: number): boolean[] {
  return Array.from({ length: count }, () => Math.random() >= 0.5)
}
