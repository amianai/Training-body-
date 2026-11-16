import { useState } from 'react'
import { BellRing } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PLAN } from '@/data/plan'
import { useToday } from '@/lib/hooks'
import { disableReminders, enableReminders, pushSupported, sendTestReminder, type PushResult } from '@/lib/push'
import { reminderState } from '@/lib/reminderState'
import { useAppStore } from '@/store/useAppStore'

const PROBLEM: Partial<Record<PushResult, string>> = {
  unsupported: 'Qui le notifiche non sono disponibili: funzionano nell’app installata da Chrome.',
  denied: 'Le notifiche sono bloccate: attivale per questa app nelle impostazioni del telefono, poi riprova.',
  'not-configured': 'Il servizio delle notifiche non è ancora pronto: manca il database su Vercel.',
  'not-subscribed': 'Il servizio non riconosce più questo telefono: spegni e riaccendi il promemoria.',
  error: 'Non riesco a parlare con il servizio delle notifiche. Controlla internet e riprova.',
}

/** Promemoria serale: interruttore, cosa aspettarsi e notifica di prova. */
export function ReminderSettings() {
  const on = useAppStore((s) => s.settings.reminders)
  const setSetting = useAppStore((s) => s.setSetting)
  const entries = useAppStore((s) => s.entries)
  const startDate = useAppStore((s) => s.startDate)
  const today = useToday()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const toggle = async (next: boolean) => {
    setBusy(true)
    setMessage(null)
    if (next) {
      const result = await enableReminders(reminderState(entries, PLAN, startDate, today))
      setSetting('reminders', result === 'ok')
      setMessage(result === 'ok' ? 'Promemoria attivo. Prova la notifica qui sotto.' : (PROBLEM[result] ?? null))
    } else {
      setSetting('reminders', false)
      await disableReminders()
    }
    setBusy(false)
  }

  const test = async () => {
    setBusy(true)
    const result = await sendTestReminder()
    setMessage(result === 'ok' ? 'Inviata: arriva tra qualche secondo.' : (PROBLEM[result] ?? null))
    setBusy(false)
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase">Promemoria</h2>
      <label className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div>
          <p className="font-semibold">Promemoria serale</p>
          <p className="text-sm text-muted-foreground">
            Una notifica tra le 17 e le 18, solo se quel giorno non ti sei allenato e te ne mancano ancora nella
            settimana. Il giorno dopo un allenamento non disturba, finché c'è margine.
          </p>
        </div>
        <Switch checked={on} disabled={busy || !pushSupported} onCheckedChange={(v) => void toggle(v)} />
      </label>
      {!pushSupported && <p className="px-1 text-sm text-muted-foreground">{PROBLEM.unsupported}</p>}
      {on && (
        <Button size="lg" variant="outline" disabled={busy} onClick={() => void test()}>
          <BellRing /> Manda una notifica di prova
        </Button>
      )}
      {message && <p className="px-1 text-sm text-accent">{message}</p>}
      <p className="px-1 text-sm text-muted-foreground">
        Con il promemoria acceso l'app comunica al servizio solo i giorni di questa settimana in cui ti sei allenato.
      </p>
    </section>
  )
}
