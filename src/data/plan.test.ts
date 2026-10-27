import { describe, expect, it } from 'vitest'

import { buildSteps, estimateDurationSec } from '@/lib/session'
import { FIGURES } from './figures'
import { COOLDOWN, PLAN, PRACTICE, getSession } from './plan'

describe('scheda', () => {
  it('ogni sessione delle fasi esiste e ha l\'omino per ogni esercizio', () => {
    for (const phase of PLAN.phases) {
      for (const id of phase.rotation) {
        const session = getSession(id)
        expect(session, id).toBeDefined()
        for (const block of session!.blocks) for (const item of block.items) expect(FIGURES[item.exerciseId], item.exerciseId).toBeDefined()
      }
    }
    for (const block of PRACTICE.blocks) for (const item of block.items) expect(FIGURES[item.exerciseId], item.exerciseId).toBeDefined()
  })

  it('cresce di fase in fase restando sotto i 40 minuti', () => {
    const minutes = (id: string) => Math.round(estimateDurationSec(buildSteps(getSession(id)!)) / 60)
    expect(minutes('a2')).toBeGreaterThan(minutes('a1'))
    expect(minutes('a4')).toBeGreaterThan(minutes('a3'))
    for (const s of PLAN.sessions) expect(minutes(s.id), s.id).toBeLessThan(40)
  })

  it('lo scarico post-giro è breve, si trova per id e ha gli omini', () => {
    expect(getSession('scarico')).toBe(COOLDOWN)
    const minutes = estimateDurationSec(buildSteps(COOLDOWN)) / 60
    expect(minutes).toBeGreaterThan(5)
    expect(minutes).toBeLessThan(10)
    for (const block of COOLDOWN.blocks) for (const item of block.items) expect(FIGURES[item.exerciseId], item.exerciseId).toBeDefined()
  })
})
