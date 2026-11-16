import type { ReminderState } from './reminderState'

/*
 * Promemoria serale: una notifica vera, anche con l'app chiusa. La manda un piccolo servizio su Vercel
 * (cartella api) a cui l'app comunica solo lo stato della settimana in corso.
 */

const API = '/api/push'
const DEVICE_KEY = 'allenamento-telefono'
const SENT_KEY = 'allenamento-promemoria-inviato'

/** Nella pagina di prova su claude.ai non c'è il service worker, quindi niente notifiche. */
export const pushSupported =
  import.meta.env.MODE !== 'artifact' &&
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  typeof window !== 'undefined' &&
  'PushManager' in window &&
  'Notification' in window

export type PushResult = 'ok' | 'unsupported' | 'denied' | 'not-configured' | 'not-subscribed' | 'error'

/** Nome casuale di questo telefono per il server: non dice niente di chi lo usa. */
function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

async function post(body: Record<string, unknown>): Promise<PushResult> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: deviceId(), ...body }),
  })
  if (res.ok) return 'ok'
  return res.status === 404 ? 'not-subscribed' : 'error'
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error('timeout')), ms))])
}

/** Chiede il permesso, iscrive il telefono alle notifiche e lo comunica al server. */
export async function enableReminders(state: ReminderState): Promise<PushResult> {
  if (!pushSupported) return 'unsupported'
  try {
    const info = (await (await fetch(API)).json()) as { configured: boolean; publicKey?: string }
    if (!info.configured || !info.publicKey) return 'not-configured'
    if ((await Notification.requestPermission()) !== 'granted') return 'denied'

    const registration = await withTimeout(navigator.serviceWorker.ready, 8000)
    const options = { userVisibleOnly: true, applicationServerKey: info.publicKey }
    let subscription: PushSubscription
    try {
      subscription = await registration.pushManager.subscribe(options)
    } catch {
      // iscrizione vecchia con un'altra chiave: si rifà
      await (await registration.pushManager.getSubscription())?.unsubscribe()
      subscription = await registration.pushManager.subscribe(options)
    }
    const result = await post({ action: 'subscribe', subscription: subscription.toJSON(), state })
    if (result === 'ok') rememberSent(state)
    return result
  } catch {
    return 'error'
  }
}

export async function disableReminders(): Promise<void> {
  localStorage.removeItem(SENT_KEY)
  try {
    await post({ action: 'unsubscribe' })
    if (pushSupported) await (await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription())?.unsubscribe()
  } catch {
    // senza rete il server smette comunque dopo qualche giorno senza notizie
  }
}

export async function sendTestReminder(): Promise<PushResult> {
  try {
    return await post({ action: 'test' })
  } catch {
    return 'error'
  }
}

const stamp = (state: ReminderState) => `${new Date().toDateString()} ${JSON.stringify(state)}`
const rememberSent = (state: ReminderState) => localStorage.setItem(SENT_KEY, stamp(state))

/** Aggiorna il server quando la settimana cambia (e comunque una volta al giorno, aprendo l'app). */
export async function syncReminderState(state: ReminderState): Promise<PushResult> {
  if (localStorage.getItem(SENT_KEY) === stamp(state)) return 'ok'
  try {
    const result = await post({ action: 'state', state })
    if (result === 'ok') rememberSent(state)
    return result
  } catch {
    return 'error'
  }
}
