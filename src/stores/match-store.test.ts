import { describe, it, expect, beforeEach } from 'vitest'
import { useMatchStore } from './match-store'

beforeEach(() => {
  localStorage.clear()
  useMatchStore.getState().endMatch()
})

describe('match-store', () => {
  it('startMatch sets matchId, startedAt, opponentName and activates', () => {
    useMatchStore.getState().startMatch({ opponentName: 'AshK123' })
    const s = useMatchStore.getState()
    expect(s.active).toBe(true)
    expect(s.opponentName).toBe('AshK123')
    expect(typeof s.matchId).toBe('string')
    expect(typeof s.startedAt).toBe('number')
    expect(s.prize).toEqual({ a: 6, b: 6 })
  })

  it('endMatch clears activation and identifying fields', () => {
    useMatchStore.getState().startMatch({})
    useMatchStore.getState().endMatch()
    const s = useMatchStore.getState()
    expect(s.active).toBe(false)
    expect(s.matchId).toBeNull()
    expect(s.opponentName).toBeUndefined()
  })

  it('logAction appends a history entry with summary', () => {
    useMatchStore.getState().startMatch({})
    useMatchStore.getState().logAction('a', 'damage', '+30 Damage')
    const h = useMatchStore.getState().history
    expect(h).toHaveLength(1)
    expect(h[0].summary).toBe('+30 Damage')
    expect(h[0].side).toBe('a')
  })

  it('takePrize decrements until 0', () => {
    useMatchStore.getState().startMatch({})
    useMatchStore.getState().takePrize('a')
    useMatchStore.getState().takePrize('a')
    expect(useMatchStore.getState().prize.a).toBe(4)
    for (let i = 0; i < 10; i++) useMatchStore.getState().takePrize('a')
    expect(useMatchStore.getState().prize.a).toBe(0)
  })
})
