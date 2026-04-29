import rawData from '@/data/pokemon.json'

export type Pokemon = {
  id: number
  name: string
  types: string[]
  generation: number
}

export const ALL_POKEMON: Pokemon[] = rawData as Pokemon[]

export const REGIONS = [
  { key: 'national', label: 'National', generations: [1,2,3,4,5,6,7,8,9] },
  { key: 'kanto',    label: 'Kanto',    generations: [1] },
  { key: 'johto',    label: 'Johto',    generations: [2] },
  { key: 'hoenn',    label: 'Hoenn',    generations: [3] },
  { key: 'sinnoh',   label: 'Sinnoh',   generations: [4] },
  { key: 'unova',    label: 'Unova',    generations: [5] },
  { key: 'kalos',    label: 'Kalos',    generations: [6] },
  { key: 'alola',    label: 'Alola',    generations: [7] },
  { key: 'galar',    label: 'Galar',    generations: [8] },
  { key: 'paldea',   label: 'Paldea',   generations: [9] },
] as const

export type RegionKey = typeof REGIONS[number]['key']

const byId = new Map<number, Pokemon>(ALL_POKEMON.map((p) => [p.id, p]))
const byName = new Map<string, Pokemon>(
  ALL_POKEMON.map((p) => [p.name.toLowerCase(), p])
)

export function getPokemonByRegion(region: RegionKey): Pokemon[] {
  const r = REGIONS.find((x) => x.key === region)!
  const set = new Set<number>(r.generations)
  return ALL_POKEMON.filter((p) => set.has(p.generation))
}

export function getPokemon(id: number): Pokemon | undefined {
  return byId.get(id)
}

export function getPokemonByName(name: string): Pokemon | undefined {
  return byName.get(name.toLowerCase())
}

export function getSpriteUrl(id: number, kind: 'official' | 'sprite' = 'official'): string {
  if (kind === 'official') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

/* shared color map (kept from old pokemon-data.ts) */
export const TYPE_COLOR: Record<string, string> = {
  Fire: '#FF6B35', Water: '#4FC3F7', Grass: '#66BB6A', Electric: '#FFCA28',
  Psychic: '#EC407A', Ice: '#80DEEA', Dragon: '#7E57C2', Dark: '#5D4037',
  Fairy: '#F48FB1', Fighting: '#EF5350', Poison: '#AB47BC', Ground: '#BCAAA4',
  Flying: '#90CAF9', Bug: '#9CCC65', Rock: '#8D6E63', Ghost: '#5C6BC0',
  Steel: '#B0BEC5', Normal: '#9E9E9E',
}

export function searchPokemon(query: string, region: RegionKey = 'national'): Pokemon[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const pool = getPokemonByRegion(region)
  const asNum = parseInt(q, 10)
  if (!Number.isNaN(asNum)) {
    const hit = pool.find((p) => p.id === asNum)
    return hit ? [hit] : []
  }
  const exact = pool.find((p) => p.name.toLowerCase() === q)
  if (exact) return [exact]
  return pool.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 12)
}
