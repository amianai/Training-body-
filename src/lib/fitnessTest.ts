import { getExercise } from '@/data/exercises'
import type { Entry } from '@/data/types'
import { addDays, diffDays, mondayOf } from './dates'

/*
 * Test di forma: alla settimana 1 della scheda e poi ogni 4 (5, 9, 13…), cioè quando la scheda sale di
 * livello. Prende il posto di un allenamento e conta come allenamento. Se in quella settimana non lo fai,
 * resta il prossimo finché non lo fai.
 */

export const TEST_EVERY_WEEKS = 4

/** Le prove, nell'ordine in cui si fanno, con il nome corto per i riquadri dei risultati. */
export const TEST_EXERCISES = ['f1', 'f14', 'f8', 'e13'] as const
const SHORT_NAME: Record<(typeof TEST_EXERCISES)[number], string> = {
  f1: 'Flessioni',
  f14: 'Rematore',
  f8: 'Plank',
  e13: 'Sedia al muro',
}

export function isTestWeek(weekNumber: number): boolean {
  return (weekNumber - 1) % TEST_EVERY_WEEKS === 0
}

/** Prima settimana di test dopo quella in corso. */
export function nextTestWeek(weekNumber: number): number {
  return weekNumber + TEST_EVERY_WEEKS - ((weekNumber - 1) % TEST_EVERY_WEEKS)
}

/** Il test tocca se dall'inizio dell'ultima settimana di test non ne hai fatto uno. */
export function isTestDue(entries: Entry[], startDate: string, today: string): boolean {
  const planWeek = mondayOf(startDate)
  const weekNumber = Math.max(0, diffDays(planWeek, mondayOf(today)) / 7) + 1
  const lastTestWeek = weekNumber - ((weekNumber - 1) % TEST_EVERY_WEEKS)
  const since = addDays(planWeek, (lastTestWeek - 1) * 7)
  return !entries.some((e) => e.type === 'test' && e.date >= since)
}

/** Test fatti, dal più vecchio. */
export function testHistory(entries: Entry[]): Entry[] {
  return entries.filter((e) => e.type === 'test' && e.test).sort((a, b) => a.date.localeCompare(b.date))
}

export interface TestRow {
  exerciseId: string
  name: string
  unit: 'rip.' | 's'
  /** Ultimo risultato. */
  value?: number
  /** Differenza dal primo test, quando ce n'è più di uno. */
  change?: number
}

/** Una riga per prova: ultimo risultato e quanto è cambiato dal primo test. */
export function testRows(history: Entry[]): TestRow[] {
  return TEST_EXERCISES.map((id) => {
    const exercise = getExercise(id)
    const values = history.map((e) => e.test?.[id]).filter((v): v is number => v !== undefined)
    return {
      exerciseId: id,
      name: SHORT_NAME[id],
      unit: exercise.kind === 'time' ? 's' : 'rip.',
      value: values.at(-1),
      change: values.length > 1 ? values.at(-1)! - values[0] : undefined,
    }
  })
}
