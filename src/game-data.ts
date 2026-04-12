// src/game-data.ts

export const ENERGY_TYPES = [
  'grass', 'fire', 'water', 'lightning',
  'psychic', 'fighting', 'darkness', 'metal',
] as const

export type EnergyType = (typeof ENERGY_TYPES)[number]

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
}

export const ORIENTATION_LABELS: Record<NonNullable<OrientationCondition>, string> = {
  confused: 'Confuso',
  paralyzed: 'Paralisado',
  asleep: 'Dormindo',
}

export const ORIENTATION_ROTATION: Record<NonNullable<OrientationCondition>, string> = {
  confused: 'rotate-180',
  paralyzed: 'rotate-90',
  asleep: '-rotate-90',
}

export const MARKER_LABELS: Record<keyof MarkerConditions, string> = {
  poisoned: 'Envenenado',
  burned: 'Queimado',
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
  grass: 'Planta',
  fire: 'Fogo',
  water: 'Água',
  lightning: 'Elétrica',
  psychic: 'Psíquica',
  fighting: 'Lutador',
  darkness: 'Sombrio',
  metal: 'Metal',
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

export const ENERGY_IMAGE: Record<EnergyType, string> = {
  grass: '/images/grass.png',
  fire: '/images/fire.png',
  water: '/images/water.png',
  lightning: '/images/eletric.png',
  psychic: '/images/psychic.png',
  fighting: '/images/fighting.png',
  darkness: '/images/dark.png',
  metal: '/images/steel.png',
}
