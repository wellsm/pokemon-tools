import rawData from './data/pokemon.json'

export interface Pokemon {
  id: number
  name: string
  types: string[]
  generation: number
}

export const ALL_POKEMON: Pokemon[] = rawData as Pokemon[]

const byId = new Map<number, Pokemon>(ALL_POKEMON.map((p) => [p.id, p]))
const byName = new Map<string, Pokemon>(ALL_POKEMON.map((p) => [p.name.toLowerCase(), p]))

export function getPokemonById(id: number): Pokemon | undefined {
  return byId.get(id)
}

export function searchPokemon(query: string): Pokemon[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  // Numeric ID search
  const asNum = parseInt(q)
  if (!isNaN(asNum)) {
    const p = byId.get(asNum)
    return p ? [p] : []
  }

  // Exact name match first
  const exact = byName.get(q)
  if (exact) return [exact]

  // Prefix match
  return ALL_POKEMON.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 12)
}

export const ARTWORK_URL = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

export const TYPE_COLOR: Record<string, string> = {
  Fire: '#FF6B35', Water: '#4FC3F7', Grass: '#66BB6A', Electric: '#FFCA28',
  Psychic: '#EC407A', Ice: '#80DEEA', Dragon: '#7E57C2', Dark: '#5D4037',
  Fairy: '#F48FB1', Fighting: '#EF5350', Poison: '#AB47BC', Ground: '#BCAAA4',
  Flying: '#90CAF9', Bug: '#9CCC65', Rock: '#8D6E63', Ghost: '#5C6BC0',
  Steel: '#B0BEC5', Normal: '#9E9E9E',
}
