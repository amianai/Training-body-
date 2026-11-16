// Tipi della logica del promemoria, scritta in JavaScript perché gira anche su Vercel (cartella api).
declare module '*/api/_reminder.js' {
  import type { ReminderState } from '@/lib/reminderState'

  export function decide(state: ReminderState | null, today: string, updatedAt?: number): { title: string; body: string } | null
  export function cleanState(raw: unknown): ReminderState | null
}
