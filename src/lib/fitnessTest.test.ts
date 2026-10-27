import { describe, expect, it } from 'vitest'

import { FITNESS_TEST, PLAN } from '@/data/plan'
import type { Entry } from '@/data/types'
import { addDays } from './dates'
import { isTestDue, isTestWeek, nextTestWeek, testHistory, testRows } from './fitnessTest'
import { buildSteps, estimateDurationSec, targetLabel, type WorkStep } from './session'
import { computeStats } from './streak'
import { spokenIntro } from './voiceScript'

// Lunedì della settimana 1 della scheda.
const START = '2026-01-05'
const week = (n: number, day = 0) => addDays(START, (n - 1) * 7 + day)

let id = 0
const test = (date: string, results: Record<string, number> = { f1: 10 }): Entry => ({
  id: `t${id++}`,
  type: 'test',
  date,
  createdAt: Date.parse(date),
  sessionId: 'test',
  test: results,
})

describe('quando tocca il test', () => {
  it('settimane 1, 5, 9, 13…', () => {
    expect([1, 2, 4, 5, 8, 9, 13, 17].map(isTestWeek)).toEqual([true, false, false, true, false, true, true, true])
    expect(nextTestWeek(1)).toBe(5)
    expect(nextTestWeek(4)).toBe(5)
    expect(nextTestWeek(5)).toBe(9)
  })

  it('il primo test tocca subito, poi alla settimana 5', () => {
    expect(isTestDue([], START, week(1, 2))).toBe(true)
    const first = [test(week(1, 2))]
    expect(isTestDue(first, START, week(1, 4))).toBe(false)
    expect(isTestDue(first, START, week(4, 6))).toBe(false)
    expect(isTestDue(first, START, week(5))).toBe(true)
  })

  it('se salti la settimana del test, resta il prossimo finché non lo fai', () => {
    const first = [test(week(1))]
    expect(isTestDue(first, START, week(6, 3))).toBe(true)
    expect(isTestDue([...first, test(week(6, 3))], START, week(7))).toBe(false)
  })

  it('chi inizia a usare l’app più tardi fa subito il primo test', () => {
    expect(isTestDue([], START, week(3, 1))).toBe(true)
  })

  it('il test conta come allenamento per la settimana e la streak', () => {
    const stats = computeStats([test(week(1, 1))], PLAN, START, week(1, 1))
    expect(stats.week.done).toBe(1)
    expect(stats.streak).toBe(1)
    expect(stats.testDue).toBe(false)
  })
})

describe('risultati', () => {
  it('ultimo valore e miglioramento dal primo test', () => {
    const history = testHistory([
      test(week(5), { f1: 13, f8: 50 }),
      test(week(1), { f1: 10, f8: 35, e13: 40 }),
    ])
    const rows = Object.fromEntries(testRows(history).map((r) => [r.exerciseId, r]))
    expect(rows.f1).toMatchObject({ value: 13, change: 3, unit: 'rip.' })
    expect(rows.f8).toMatchObject({ value: 50, change: 15, unit: 's' })
    expect(rows.e13).toMatchObject({ value: 40, change: undefined })
    expect(rows.f14.value).toBeUndefined()
  })
})

describe('sessione del test', () => {
  const steps = buildSteps(FITNESS_TEST)
  const trials = steps.filter((s): s is WorkStep => s.kind === 'work' && s.max === true)

  it('quattro prove "più che puoi", con 2 minuti tra una e l’altra, in circa un quarto d’ora', () => {
    expect(trials.map((s) => s.exercise.id)).toEqual(['f1', 'f14', 'f8', 'e13'])
    expect(targetLabel(trials[0])).toBe('più che puoi')
    const rests = steps.filter((s) => s.kind === 'rest' && s.seconds === 120)
    expect(rests).toHaveLength(3)
    const minutes = estimateDurationSec(steps) / 60
    expect(minutes).toBeGreaterThan(10)
    expect(minutes).toBeLessThan(16)
  })

  it('la voce spiega cosa misura la prova', () => {
    expect(spokenIntro(trials[0], undefined, true, 0).text).toBe(
      'Flessioni. Test: più ripetizioni che puoi, con la forma giusta. Quando la forma cede, fermati e tocca Fatto. Mani sotto le spalle, corpo dritto. Petto quasi a terra, poi spingi. Vai!',
    )
    expect(spokenIntro(trials[2], undefined, true, 0).clips.map((c) => c.id)).toEqual([
      'nome-f8',
      'test-tempo',
      'come-f8',
      'forza-0',
    ])
  })
})
