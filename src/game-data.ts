// src/game-data.ts

export const ENERGY_TYPES = [
  'grass', 'fire', 'water', 'lightning',
  'psychic', 'fighting', 'darkness', 'metal',
] as const

/** Basic energy types (used by the Pocket energy generator). */
export type BasicEnergyType = (typeof ENERGY_TYPES)[number]

/**
 * Energy types that can be attached to a slot. `colorless` covers
 * Special Energies and anything that isn't a basic type.
 */
export const SLOT_ENERGY_TYPES = [...ENERGY_TYPES, 'colorless'] as const

export type EnergyType = (typeof SLOT_ENERGY_TYPES)[number]

export type GameFormat = 'standard' | 'pocket'

export interface GameModules {
  coins: boolean
  energy: boolean
  board: boolean
}

// Orientation-based conditions (mutually exclusive)
export type OrientationCondition = 'confused' | 'paralyzed' | 'asleep' | null

// Marker-based conditions (can stack with orientation + each other)
export interface MarkerConditions {
  poisoned: boolean
  burned: boolean
}

export interface BoardSlot {
  id: string
  position: 'active' | 'bench'
  damage: number
  energies: EnergyType[]
  orientation: OrientationCondition
  markers: MarkerConditions
  abilityUsed: boolean
  /** A Pokémon Tool is attached to this Pokémon. */
  tool: boolean
}

export const ORIENTATION_LABELS: Record<NonNullable<OrientationCondition>, string> = {
  confused: 'Confused',
  paralyzed: 'Paralyzed',
  asleep: 'Asleep',
}

export const ORIENTATION_ROTATION: Record<NonNullable<OrientationCondition>, string> = {
  confused: 'rotate-180',
  paralyzed: 'rotate-90',
  asleep: '-rotate-90',
}

export const MARKER_LABELS: Record<keyof MarkerConditions, string> = {
  poisoned: 'Poisoned',
  burned: 'Burned',
}

export const CONDITION_COLORS: Record<string, string> = {
  confused: '#f59e0b',
  paralyzed: '#facc15',
  asleep: '#818cf8',
  poisoned: '#a855f7',
  burned: '#ef4444',
}

export interface FieldSide {
  slots: BoardSlot[]
}

export const ENERGY_LABEL: Record<EnergyType, string> = {
  grass: 'Grass',
  fire: 'Fire',
  water: 'Water',
  lightning: 'Lightning',
  psychic: 'Psychic',
  fighting: 'Fighting',
  darkness: 'Darkness',
  metal: 'Metal',
  colorless: 'Colorless',
}

export const ENERGY_EMOJI: Record<EnergyType, string> = {
  grass: '🌿',
  fire: '🔥',
  water: '💧',
  lightning: '⚡',
  psychic: '🔮',
  fighting: '👊',
  darkness: '🌑',
  metal: '⚙️',
  colorless: '⭐',
}

export const ENERGY_COLOR: Record<EnergyType, string> = {
  grass: '#4ade80',
  fire: '#ef4444',
  water: '#60a5fa',
  lightning: '#facc15',
  psychic: '#c084fc',
  fighting: '#f97316',
  darkness: '#6b7280',
  metal: '#94a3b8',
  colorless: '#d4d4d8',
}

export const FORMAT_DEFAULTS: Record<GameFormat, {
  benchSize: number
  modules: GameModules
}> = {
  standard: {
    benchSize: 5,
    modules: { coins: true, energy: false, board: true },
  },
  pocket: {
    benchSize: 3,
    modules: { coins: true, energy: true, board: true },
  },
}

export const MAX_ENERGY_TYPES = 3 // Pocket allows max 3 types

/** Hard cap for bench slots (Standard is 5; some Stadiums raise it to 8). */
export const MAX_BENCH = 8

/** Damage applied between turns by each marker condition. */
export const MARKER_DAMAGE: Record<keyof MarkerConditions, number> = {
  poisoned: 10,
  burned: 20,
}

export const ENERGY_IMAGE: Record<EnergyType, string> = {
  grass: '/images/grass.png',
  fire: '/images/fire.png',
  water: '/images/water.png',
  lightning: '/images/eletric.png',
  psychic: '/images/psychic.png',
  fighting: '/images/fighting.png',
  darkness: '/images/dark.png',
  metal: '/images/steel.png',
  colorless: '/images/normal.png',
}
