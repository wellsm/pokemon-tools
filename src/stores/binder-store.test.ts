import { describe, it, expect, beforeEach } from 'vitest'
import { useBinderStore } from './binder-store'

beforeEach(() => {
  // Reset persisted state between tests
  localStorage.clear()
  useBinderStore.setState({ binders: [] })
})

describe('binder-store', () => {
  it('createBinder returns a string id and adds an entry', () => {
    const id = useBinderStore.getState().createBinder({
      name: 'Pokédex – Kanto',
      region: 'kanto',
      grid: '3x3',
    })
    expect(typeof id).toBe('string')
    expect(useBinderStore.getState().binders).toHaveLength(1)
    expect(useBinderStore.getState().binders[0].id).toBe(id)
    expect(useBinderStore.getState().binders[0].ownedSlots).toEqual([])
  })

  it('toggleSlotOwned adds then removes a pokemon id', () => {
    const id = useBinderStore.getState().createBinder({
      name: 'X', region: 'kanto', grid: '3x3',
    })
    useBinderStore.getState().toggleSlotOwned(id, 25)
    expect(useBinderStore.getState().binders[0].ownedSlots).toContain(25)
    useBinderStore.getState().toggleSlotOwned(id, 25)
    expect(useBinderStore.getState().binders[0].ownedSlots).not.toContain(25)
  })

  it('setMain enforces single-main', () => {
    const a = useBinderStore.getState().createBinder({ name: 'A', region: 'kanto', grid: '3x3' })
    const b = useBinderStore.getState().createBinder({ name: 'B', region: 'johto', grid: '3x3' })
    useBinderStore.getState().setMain(a)
    expect(useBinderStore.getState().binders.find(x=>x.id===a)?.isMain).toBe(true)
    useBinderStore.getState().setMain(b)
    expect(useBinderStore.getState().binders.find(x=>x.id===a)?.isMain).toBe(false)
    expect(useBinderStore.getState().binders.find(x=>x.id===b)?.isMain).toBe(true)
  })

  it('renameBinder and setCover update fields', () => {
    const id = useBinderStore.getState().createBinder({ name: 'A', region: 'kanto', grid: '3x3' })
    useBinderStore.getState().renameBinder(id, 'Renamed')
    useBinderStore.getState().setCover(id, 6)
    const b = useBinderStore.getState().binders[0]
    expect(b.name).toBe('Renamed')
    expect(b.coverPokemonId).toBe(6)
  })

  it('deleteBinder removes the entry', () => {
    const id = useBinderStore.getState().createBinder({ name: 'A', region: 'kanto', grid: '3x3' })
    useBinderStore.getState().deleteBinder(id)
    expect(useBinderStore.getState().binders).toHaveLength(0)
  })
})
