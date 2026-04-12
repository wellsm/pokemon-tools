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

export interface BoardSlot {
  id: string
  position: 'active' | 'bench'
  damage: number
  energies: EnergyType[]
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
