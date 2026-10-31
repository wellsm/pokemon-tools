import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  EnergyType, GameFormat, GameModules, BoardSlot, FieldSide,
  OrientationCondition,
} from '@/game-data'
import { FORMAT_DEFAULTS, MARKER_DAMAGE, MAX_BENCH } from '@/game-data'

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

/** Board state captured before each change so it can be undone. */
export interface Snapshot {
  fieldA: FieldSide
  fieldB: FieldSide
  history: GameAction[]
}

export const UNDO_LIMIT = 50

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
  toggleTool: (side: Side, slotId: string) => void
  /** Knock Out: wipes damage, energies, conditions, ability and tool from a slot. */
  resetSlot: (side: Side, slotId: string) => void
  /** Clears the "ability used" flag on every slot of one side. */
  resetAbilities: (side: Side) => void
  /** Applies the between-turns damage of a poison/burn marker. */
  applyMarkerDamage: (side: Side, slotId: string, marker: 'poisoned' | 'burned') => void

  /* Undo — board snapshots, newest last (not persisted) */
  past: Snapshot[]
  undo: () => void

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
    tool: false,
  }
}

function snapshot(s: MatchState): Snapshot {
  return { fieldA: s.fieldA, fieldB: s.fieldB, history: s.history }
}

/** Partial state that records the current board on the undo stack. */
function withUndo(s: MatchState): Pick<MatchState, 'past'> {
  return { past: [...s.past, snapshot(s)].slice(-UNDO_LIMIT) }
}

function historyEntry(side: Side, type: GameAction['type'], summary: string): GameAction {
  return { id: nanoid(), side, type, summary, description: summary, timestamp: Date.now() }
}

function mapSlot(
  field: FieldSide,
  slotId: string,
  fn: (slot: BoardSlot) => BoardSlot,
): FieldSide {
  return { slots: field.slots.map((sl) => (sl.id === slotId ? fn(sl) : sl)) }
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
          past: [],
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
          past: [],
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
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, damage: Math.max(0, sl.damage + amount),
          })),
        })),

      clearDamage: (side, slotId) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({ ...sl, damage: 0 })),
        })),

      attachEnergy: (side, slotId, energy) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, energies: [...sl.energies, energy],
          })),
        })),

      removeEnergy: (side, slotId, index) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, energies: sl.energies.filter((_, i) => i !== index),
          })),
        })),

      removeOneEnergy: (side, slotId, energy) =>
        set((s) => {
          const slot = getField(s, side).slots.find((sl) => sl.id === slotId)
          const idx = slot?.energies.indexOf(energy) ?? -1
          if (idx === -1) return {}
          return {
            ...withUndo(s),
            [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
              ...sl, energies: sl.energies.filter((_, i) => i !== idx),
            })),
          }
        }),

      clearEnergies: (side, slotId) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({ ...sl, energies: [] })),
        })),

      addSlot: (side) =>
        set((s) => {
          const field = getField(s, side)
          const bench = field.slots.filter((sl) => sl.position === 'bench').length
          if (bench >= MAX_BENCH) return {}
          return {
            ...withUndo(s),
            [fieldKey(side)]: { slots: [...field.slots, newSlot('bench')] },
          }
        }),

      removeSlot: (side, slotId) =>
        set((s) => {
          const field = getField(s, side)
          const slot = field.slots.find((sl) => sl.id === slotId)
          if (!slot || slot.position === 'active') return {}
          return {
            ...withUndo(s),
            [fieldKey(side)]: { slots: field.slots.filter((sl) => sl.id !== slotId) },
          }
        }),

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
          return {
            ...withUndo(s),
            [fieldKey(side)]: { slots: newSlots },
            history: [...s.history, historyEntry(side, 'move', `${fromPos} ↔ ${toPos}`)],
          }
        }),

      setOrientation: (side, slotId, condition) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, orientation: condition,
          })),
        })),

      toggleMarker: (side, slotId, marker) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, markers: { ...sl.markers, [marker]: !sl.markers[marker] },
          })),
        })),

      clearConditions: (side, slotId) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, orientation: null, markers: { ...defaultMarkers },
          })),
        })),

      toggleAbility: (side, slotId) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, abilityUsed: !sl.abilityUsed,
          })),
        })),

      toggleTool: (side, slotId) =>
        set((s) => ({
          ...withUndo(s),
          [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
            ...sl, tool: !sl.tool,
          })),
        })),

      resetSlot: (side, slotId) =>
        set((s) => {
          const slot = getField(s, side).slots.find((sl) => sl.id === slotId)
          if (!slot) return {}
          return {
            ...withUndo(s),
            [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
              ...newSlot(sl.position), id: sl.id,
            })),
            history: [...s.history, historyEntry(side, 'slot', `${slot.position} cleared (KO)`)],
          }
        }),

      resetAbilities: (side) =>
        set((s) => {
          const field = getField(s, side)
          if (!field.slots.some((sl) => sl.abilityUsed)) return {}
          return {
            ...withUndo(s),
            [fieldKey(side)]: {
              slots: field.slots.map((sl) => ({ ...sl, abilityUsed: false })),
            },
          }
        }),

      applyMarkerDamage: (side, slotId, marker) =>
        set((s) => {
          const amount = MARKER_DAMAGE[marker]
          return {
            ...withUndo(s),
            [fieldKey(side)]: mapSlot(getField(s, side), slotId, (sl) => ({
              ...sl, damage: sl.damage + amount,
            })),
            history: [...s.history, historyEntry(side, 'damage', `+${amount} ${marker}`)],
          }
        }),

      past: [],

      undo: () =>
        set((s) => {
          const prev = s.past[s.past.length - 1]
          if (!prev) return {}
          return { ...prev, past: s.past.slice(0, -1) }
        }),

      toggleHistoryVisible: (side) =>
        set((s) => side === 'a'
          ? { historyVisibleA: !s.historyVisibleA }
          : { historyVisibleB: !s.historyVisibleB }
        ),
    }),
    {
      name: 'pokemon-tools/match/v1',
      version: 1,
      // Undo stack lives only in memory.
      partialize: ({ past: _past, ...rest }) => rest,
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<MatchState>), past: [] }
        function migrateSlots(field: FieldSide): FieldSide {
          return {
            slots: field.slots.map((sl) => ({
              ...sl,
              orientation: sl.orientation ?? null,
              markers: sl.markers ?? { poisoned: false, burned: false },
              abilityUsed: sl.abilityUsed ?? false,
              tool: sl.tool ?? false,
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
