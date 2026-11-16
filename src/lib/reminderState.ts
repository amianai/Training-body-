import type { Entry, Plan } from '@/data/types'
import { addDays, weekDays } from './dates'
import { computeStats, isActivity, weekTarget } from './streak'

/**
 * Quello che il promemoria serale deve sapere: solo la settimana in corso, niente storico.
 * È l'unico dato che esce dal telefono, e solo con il promemoria acceso. La decisione se avvisare
 * la prende il server (api/_reminder.js).
 */
export interface ReminderState {
  weekStart: string
  target: number
  /** Obiettivo della settimana dopo, se l'app non viene aperta prima di lunedì. */
  nextTarget: number
  /** Giorni di questa settimana con un allenamento. */
  doneDates: string[]
  /** Giorni di questa settimana con un freeze o un "non riesco". */
  offDates: string[]
  freezeUsed: boolean
  lastDate: string | null
  streak: number
}

export function reminderState(entries: Entry[], plan: Plan, startDate: string, today: string): ReminderState {
  const stats = computeStats(entries, plan, startDate, today)
  const days = new Set(weekDays(stats.week.start))
  const thisWeek = entries.filter((e) => days.has(e.date))
  const unique = (list: Entry[]) => [...new Set(list.map((e) => e.date))].sort()
  const active = entries.filter(isActivity)
  return {
    weekStart: stats.week.start,
    target: stats.week.target,
    nextTarget: weekTarget(plan, startDate, addDays(stats.week.start, 7)),
    doneDates: unique(thisWeek.filter(isActivity)),
    offDates: unique(thisWeek.filter((e) => e.type === 'skip' || e.type === 'freeze')),
    freezeUsed: stats.week.freezeUsed,
    lastDate: active.reduce<string | null>((max, e) => (max === null || e.date > max ? e.date : max), null),
    streak: stats.streak,
  }
}
