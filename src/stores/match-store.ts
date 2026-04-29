import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  EnergyType, GameFormat, GameModules, BoardSlot, FieldSide,
  OrientationCondition,
} from '@/game-data'
import { FORMAT_DEFAULTS } from '@/game-data'

export type Side = 'a' | 'b'

export interface GameAction {
  id: string
  side: Side
  type: 'move' | 'damage' | 'energy' | 'slot' | 'turn' | 'coin' | 'prize'
  /** Plain-text rendered description for the timeline (e.g. "+180 Damage"). */
  summary: string
  /** Legacy alias kept for any old call sites. Same value as summary. */
  description: string
  timestamp: number
}

interface MatchState {
  /* identity */
  matchId: string | null
  startedAt: number | null
  opponentName?: string

  /* runtime (port from game-store) */
  format: GameFormat
  modules: GameModules
  energyPool: EnergyType[]
  active: boolean
  turn: number
  fieldA: FieldSide
  fieldB: FieldSide
  energyA: EnergyType | null
  energyB: EnergyType | null
  prize: { a: number; b: number }
  history: GameAction[]

  /* identity actions */
  startMatch: (input: { opponentName?: string }) => void
  endMatch: () => void

  /* runtime actions (port verbatim from game-store) */
  logAction: (side: Side, type: GameAction['type'], summary: string) => void
  setFormat: (format: GameFormat) => void
  setModules: (modules: GameModules) => void
  setEnergyPool: (pool: EnergyType[]) => void
  startGame: () => void
  endGame: () => void
  nextTurn: () => void
  generateEnergy: (side: Side) => void
  takePrize: (side: Side) => void

  addDamage: (side: Side, slotId: string, amount: number) => void
  clearDamage: (side: Side, slotId: string) => void
  attachEnergy: (side: Side, slotId: string, energy: EnergyType) => void
  removeEnergy: (side: Side, slotId: string, index: number) => void
  removeOneEnergy: (side: Side, slotId: string, energy: EnergyType) => void
  clearEnergies: (side: Side, slotId: string) => void
  addSlot: (side: Side) => void
  removeSlot: (side: Side, slotId: string) => void
  swapSlots: (side: Side, fromId: string, toId: string) => void
  setOrientation: (side: Side, slotId: string, condition: OrientationCondition) => void
  toggleMarker: (side: Side, slotId: string, marker: 'poisoned' | 'burned') => void
  clearConditions: (side: Side, slotId: string) => void
  toggleAbility: (side: Side, slotId: string) => void

  /* History visibility per side (per spec) */
  historyVisibleA: boolean
  historyVisibleB: boolean
  toggleHistoryVisible: (side: Side) => void
}

const defaultMarkers = { poisoned: false, burned: false }

function newSlot(position: 'active' | 'bench'): BoardSlot {
  return {
    id: nanoid(),
    position,
    damage: 0,
    energies: [],
    orientation: null,
    markers: { ...defaultMarkers },
    abilityUsed: false,
  }
}

function createSlots(benchSize: number): BoardSlot[] {
  return [
    newSlot('active'),
    ...Array.from({ length: benchSize }, () => newSlot('bench')),
  ]
}

function getField(state: MatchState, side: Side): FieldSide {
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

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      matchId: null,
      startedAt: null,
      opponentName: undefined,

      format: 'standard',
      modules: initialModules,
      energyPool: [],
      active: false,
      turn: 0,
      fieldA: { slots: [] },
      fieldB: { slots: [] },
      energyA: null,
      energyB: null,
      prize: { a: 6, b: 6 },
      history: [],

      historyVisibleA: false,
      historyVisibleB: false,

      startMatch: ({ opponentName }) => {
        const { format } = get()
        const { benchSize } = FORMAT_DEFAULTS[format]
        set({
          matchId: nanoid(),
          startedAt: Date.now(),
          opponentName,
          active: true,
          turn: 1,
          fieldA: { slots: createSlots(benchSize) },
          fieldB: { slots: createSlots(benchSize) },
          energyA: null,
          energyB: null,
          prize: { a: 6, b: 6 },
          history: [],
        })
      },

      endMatch: () =>
        set({
          matchId: null,
          startedAt: null,
          opponentName: undefined,
          active: false,
          turn: 0,
          fieldA: { slots: [] },
          fieldB: { slots: [] },
          energyA: null,
          energyB: null,
          prize: { a: 6, b: 6 },
          history: [],
        }),

      takePrize: (side) =>
        set((s) => ({
          prize: { ...s.prize, [side]: Math.max(0, s.prize[side] - 1) },
          history: [...s.history, {
            id: nanoid(),
            side,
            type: 'prize' as const,
            summary: `Prize taken (${Math.max(0, s.prize[side] - 1)} left)`,
            description: 'Prize taken',
            timestamp: Date.now(),
          }],
        })),

      logAction: (side, type, summary) =>
        set((s) => ({
          history: [...s.history, {
            id: nanoid(),
            side,
            type,
            summary,
            description: summary,
            timestamp: Date.now(),
          }],
        })),

      setFormat: (format) => {
        const defaults = FORMAT_DEFAULTS[format]
        set({ format, modules: { ...defaults.modules } })
      },
      setModules: (modules) => set({ modules }),
      setEnergyPool: (pool) => set({ energyPool: pool }),

      /** legacy alias of startMatch with no opponent — kept for any direct callers in old setup UI. */
      startGame: () => get().startMatch({}),
      /** legacy alias of endMatch. */
      endGame: () => get().endMatch(),

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
            slots.map((sl) => sl.id === slotId
              ? { ...sl, damage: Math.max(0, sl.damage + amount) }
              : sl)
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
            slots.map((sl) => sl.id === slotId
              ? { ...sl, energies: [...sl.energies, energy] }
              : sl)
          ),
        })),

      removeEnergy: (side, slotId, index) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, energies: sl.energies.filter((_, i) => i !== index) }
              : sl)
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
            ...slots, newSlot('bench'),
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
          const clearConds = {
            orientation: null as OrientationCondition,
            markers: { ...defaultMarkers },
          }
          newSlots[fromIdx] = {
            ...newSlots[fromIdx], position: toPos,
            ...(toPos === 'bench' ? clearConds : {}),
          }
          newSlots[toIdx] = {
            ...newSlots[toIdx], position: fromPos,
            ...(fromPos === 'bench' ? clearConds : {}),
          }
          ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
          const summary = `${fromPos} ↔ ${toPos}`
          return {
            [fieldKey(side)]: { slots: newSlots },
            history: [...s.history, {
              id: nanoid(), side, type: 'move' as const,
              summary, description: summary, timestamp: Date.now(),
            }],
          }
        }),

      setOrientation: (side, slotId, condition) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, orientation: condition } : sl)
          ),
        })),

      toggleMarker: (side, slotId, marker) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, markers: { ...sl.markers, [marker]: !sl.markers[marker] } }
              : sl)
          ),
        })),

      clearConditions: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, orientation: null, markers: { poisoned: false, burned: false } }
              : sl)
          ),
        })),

      toggleAbility: (side, slotId) =>
        set((s) => ({
          [fieldKey(side)]: updateSlots(getField(s, side), (slots) =>
            slots.map((sl) => sl.id === slotId
              ? { ...sl, abilityUsed: !sl.abilityUsed } : sl)
          ),
        })),

      toggleHistoryVisible: (side) =>
        set((s) => side === 'a'
          ? { historyVisibleA: !s.historyVisibleA }
          : { historyVisibleB: !s.historyVisibleB }
        ),
    }),
    {
      name: 'pokemon-tools/match/v1',
      version: 1,
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<MatchState>) }
        function migrateSlots(field: FieldSide): FieldSide {
          return {
            slots: field.slots.map((sl) => ({
              ...sl,
              orientation: sl.orientation ?? null,
              markers: sl.markers ?? { poisoned: false, burned: false },
              abilityUsed: sl.abilityUsed ?? false,
            })),
          }
        }
        if (state.fieldA?.slots?.length) state.fieldA = migrateSlots(state.fieldA)
        if (state.fieldB?.slots?.length) state.fieldB = migrateSlots(state.fieldB)
        // Backfill new fields if absent
        if (state.matchId === undefined) state.matchId = null
        if (state.startedAt === undefined) state.startedAt = null
        if (state.prize === undefined) state.prize = { a: 6, b: 6 }
        if (state.historyVisibleA === undefined) state.historyVisibleA = false
        if (state.historyVisibleB === undefined) state.historyVisibleB = false
        // Backfill summary on history entries
        state.history = (state.history ?? []).map((h: GameAction) => ({
          ...h, summary: h.summary ?? h.description ?? '',
        }))
        return state
      },
    }
  )
)

/** Backwards-compatible alias for legacy code paths. */
export const useGameStore = useMatchStore

export function flipCoins(count: number): boolean[] {
  return Array.from({ length: count }, () => Math.random() >= 0.5)
}
