import { describe, it, expect } from 'vitest'
import {
  REGIONS, getPokemonByRegion, getPokemon, getSpriteUrl,
  type RegionKey,
} from './pokemon'

describe('REGIONS', () => {
  it('includes national + 9 regional entries', () => {
    expect(REGIONS).toHaveLength(10)
    const keys = REGIONS.map((r) => r.key)
    expect(keys).toEqual([
      'national','kanto','johto','hoenn','sinnoh',
      'unova','kalos','alola','galar','paldea',
    ])
  })
})

describe('getPokemonByRegion', () => {
  it.each<[RegionKey, number]>([
    ['kanto', 151],
    ['johto', 100],
    ['hoenn', 135],
    ['sinnoh', 107],
    ['unova', 156],
    ['kalos', 72],
    ['alola', 88],
    ['galar', 96],
    ['paldea', 120],
    ['national', 1025],
  ])('returns %s with %i entries', (region, count) => {
    expect(getPokemonByRegion(region)).toHaveLength(count)
  })

  it('kanto entries have ids 1..151 in order', () => {
    const kanto = getPokemonByRegion('kanto')
    expect(kanto[0].id).toBe(1)
    expect(kanto[150].id).toBe(151)
  })

  it('johto entries have ids 152..251', () => {
    const johto = getPokemonByRegion('johto')
    expect(johto[0].id).toBe(152)
    expect(johto.at(-1)!.id).toBe(251)
  })
})

describe('getPokemon', () => {
  it('returns Bulbasaur for id 1', () => {
    expect(getPokemon(1)?.name).toBe('Bulbasaur')
  })
  it('returns Pikachu for id 25', () => {
    expect(getPokemon(25)?.name).toBe('Pikachu')
  })
  it('returns undefined for unknown id', () => {
    expect(getPokemon(99999)).toBeUndefined()
  })
})

describe('getSpriteUrl', () => {
  it('builds official artwork URL by default', () => {
    expect(getSpriteUrl(1)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
    )
  })
  it('builds sprite URL when requested', () => {
    expect(getSpriteUrl(25, 'sprite')).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    )
  })
})
