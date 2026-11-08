import { describe, expect, it } from 'vitest'

import { PLAN } from '@/data/plan'
import type { Entry, EntryType } from '@/data/types'
import { addDays } from './dates'
import { flameStageFor } from './flame'
import { computeStats } from './streak'

const START = '2026-01-05'
let id = 0
const entry = (day: number, type: EntryType): Entry => ({
  id: `f${id++}`,
  type,
  date: addDays(START, day),
  createdAt: Date.parse(addDays(START, day)) + id,
})
const days = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => entry(from + i, 'workout'))
const stage = (entries: Entry[], today: number) => computeStats(entries, PLAN, START, addDays(START, today)).flameStage

describe('fiamma', () => {
  it('lo stadio segue gli allenamenti di fila', () => {
    expect([0, 1, 2, 3, 9, 10, 23, 24, 36, 80].map(flameStageFor)).toEqual([0, 1, 1, 2, 3, 4, 6, 7, 8, 8])
    expect(stage(days(0, 9), 9)).toBe(4)
  })

  it('se la streak si spezza scende di uno stadio, non torna alla brace', () => {
    const entries = [...days(0, 9), entry(10, 'skip')]
    const stats = computeStats(entries, PLAN, START, addDays(START, 10))
    expect(stats.streak).toBe(0)
    expect(stats.flameStage).toBe(3)
  })

  it('dopo la caduta resta lì finché la streak non supera quello stadio', () => {
    const base = [...days(0, 9), entry(10, 'skip')]
    expect(stage([...base, ...days(11, 12)], 12)).toBe(3)
    expect(stage([...base, ...days(11, 17)], 17)).toBe(3)
    // 10 di fila di nuovo: stadio 4
    expect(stage([...base, ...days(11, 20)], 20)).toBe(4)
  })

  it('più cadute di fila fanno scendere uno stadio alla volta', () => {
    const entries = [...days(0, 9), entry(10, 'skip'), entry(11, 'workout'), entry(12, 'skip')]
    expect(stage(entries, 12)).toBe(2)
  })
})
