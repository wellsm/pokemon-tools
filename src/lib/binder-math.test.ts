import { describe, it, expect } from 'vitest'
import {
  parseFormat, calculatePosition, totalPages,
  pageCapacity, slotRangeForPage,
} from './binder-math'

describe('parseFormat', () => {
  it('parses 3x3', () => expect(parseFormat('3x3')).toEqual({ cols: 3, rows: 3 }))
  it('parses 4x3', () => expect(parseFormat('4x3')).toEqual({ cols: 4, rows: 3 }))
  it('throws on invalid format', () => expect(() => parseFormat('garbage')).toThrow())
})

describe('totalPages for Kanto (151) on 3x3', () => {
  it('is 17 pages (16 full + 1 with 7)', () => {
    expect(totalPages(151, { cols: 3, rows: 3, back: false })).toBe(17)
  })
})

describe('totalPages for National (1025) on 4x3', () => {
  it('is 86 pages', () => {
    expect(totalPages(1025, { cols: 4, rows: 3, back: false })).toBe(86)
  })
})

describe('calculatePosition is a round-trip with slotRangeForPage', () => {
  it('for slot 50 on 3x3 → page 6 row 2 col 2 → range 45..53 contains 49', () => {
    const config = { cols: 3, rows: 3, back: false }
    const pos = calculatePosition(50, config)
    expect(pos.page).toBe(6)
    const range = slotRangeForPage(pos.page, config)
    expect(50 - 1).toBeGreaterThanOrEqual(range.start)
    expect(50 - 1).toBeLessThanOrEqual(range.end)
  })
})

describe('pageCapacity', () => {
  it('3x3 = 9', () => expect(pageCapacity({ cols: 3, rows: 3, back: false })).toBe(9))
  it('4x3 = 12', () => expect(pageCapacity({ cols: 4, rows: 3, back: false })).toBe(12))
})
