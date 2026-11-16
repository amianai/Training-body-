import { useEffect, useMemo, useState } from 'react'

import { PLAN } from '@/data/plan'
import { useAppStore } from '@/store/useAppStore'
import { todayISO } from './dates'
import { pushSupported, syncReminderState } from './push'
import { reminderState } from './reminderState'
import { computeStats } from './streak'

/** Data di oggi, aggiornata se l'app resta aperta a cavallo della mezzanotte. */
export function useToday(): string {
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const update = () => setToday(todayISO())
    const timer = window.setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return today
}

export function useStats() {
  const entries = useAppStore((s) => s.entries)
  const startDate = useAppStore((s) => s.startDate)
  const today = useToday()
  return useMemo(
    () => ({ today, stats: computeStats(entries, PLAN, startDate, today) }),
    [entries, startDate, today],
  )
}

/** Tiene lo schermo acceso: il telefono è appoggiato lontano mentre ti alleni. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) void sentinel.release()
      } catch {
        // Può fallire se la pagina non è visibile; riproviamo al ritorno.
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release()
    }
  }, [active])
}

/** Con il promemoria acceso, tiene aggiornato il server sullo stato della settimana. */
export function useReminderSync() {
  const reminders = useAppStore((s) => s.settings.reminders)
  const setSetting = useAppStore((s) => s.setSetting)
  const entries = useAppStore((s) => s.entries)
  const startDate = useAppStore((s) => s.startDate)
  const today = useToday()

  useEffect(() => {
    if (!reminders || !pushSupported) return
    const state = reminderState(entries, PLAN, startDate, today)
    // un attimo di attesa: dopo un allenamento arrivano più modifiche di fila
    const timer = window.setTimeout(() => {
      void syncReminderState(state).then((result) => {
        // il server non conosce più questo telefono: l'interruttore torna spento
        if (result === 'not-subscribed') setSetting('reminders', false)
      })
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [reminders, entries, startDate, today, setSetting])
}
