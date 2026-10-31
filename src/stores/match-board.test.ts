import { describe, it, expect, beforeEach } from 'vitest'
import { MAX_BENCH } from '@/game-data'
import { UNDO_LIMIT, useMatchStore } from './match-store'

const store = () => useMatchStore.getState()
const slotsA = () => store().fieldA.slots
const active = () => slotsA().find((s) => s.position === 'active')!
const bench = () => slotsA().filter((s) => s.position === 'bench')

beforeEach(() => {
  localStorage.clear()
  store().endMatch()
  store().setFormat('standard')
  store().startMatch({})
})

describe('board helpers', () => {
  it('starts Standard with 1 active + 5 bench and an empty undo stack', () => {
    expect(slotsA()).toHaveLength(6)
    expect(bench()).toHaveLength(5)
    expect(store().past).toEqual([])
    expect(active().tool).toBe(false)
  })

  it('resetSlot wipes damage, energy, conditions, ability and tool but keeps id/position', () => {
    const id = active().id
    store().addDamage('a', id, 120)
    store().attachEnergy('a', id, 'fire')
    store().attachEnergy('a', id, 'colorless')
    store().setOrientation('a', id, 'asleep')
    store().toggleMarker('a', id, 'poisoned')
    store().toggleAbility('a', id)
    store().toggleTool('a', id)

    store().resetSlot('a', id)

    expect(active()).toMatchObject({
      id,
      position: 'active',
      damage: 0,
      energies: [],
      orientation: null,
      markers: { poisoned: false, burned: false },
      abilityUsed: false,
      tool: false,
    })
  })

  it('resetAbilities clears every slot on one side only', () => {
    const [b1, b2] = bench()
    store().toggleAbility('a', b1.id)
    store().toggleAbility('a', b2.id)
    const bActive = store().fieldB.slots[0].id
    store().toggleAbility('b', bActive)

    store().resetAbilities('a')

    expect(slotsA().every((s) => !s.abilityUsed)).toBe(true)
    expect(store().fieldB.slots[0].abilityUsed).toBe(true)
  })

  it('applyMarkerDamage adds 10 for poison and 20 for burn', () => {
    const id = active().id
    store().applyMarkerDamage('a', id, 'poisoned')
    store().applyMarkerDamage('a', id, 'burned')
    expect(active().damage).toBe(30)
  })

  it('caps the bench at MAX_BENCH', () => {
    for (let i = 0; i < 10; i++) store().addSlot('a')
    expect(bench()).toHaveLength(MAX_BENCH)
  })

  it('never removes the active slot', () => {
    store().removeSlot('a', active().id)
    expect(active()).toBeDefined()
  })

  it('undo restores the previous board step by step', () => {
    const id = active().id
    store().addDamage('a', id, 50)
    store().attachEnergy('a', id, 'water')
    store().resetSlot('a', id)

    store().undo()
    expect(active().damage).toBe(50)
    expect(active().energies).toEqual(['water'])

    store().undo()
    expect(active().energies).toEqual([])
    expect(active().damage).toBe(50)

    store().undo()
    expect(active().damage).toBe(0)

    store().undo() // empty stack is a no-op
    expect(active().damage).toBe(0)
  })

  it('undo also reverts swaps', () => {
    const activeId = active().id
    const benchId = bench()[0].id
    store().swapSlots('a', activeId, benchId)
    expect(active().id).toBe(benchId)
    store().undo()
    expect(active().id).toBe(activeId)
  })

  it('keeps at most UNDO_LIMIT snapshots', () => {
    const id = active().id
    for (let i = 0; i < UNDO_LIMIT + 10; i++) store().addDamage('a', id, 10)
    expect(store().past).toHaveLength(UNDO_LIMIT)
  })

  it('no-op actions do not push undo entries', () => {
    store().resetAbilities('a')
    store().removeOneEnergy('a', active().id, 'fire')
    expect(store().past).toHaveLength(0)
  })
})
