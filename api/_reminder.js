// Decide se la sera mandare il promemoria, da quello che l'app ha comunicato l'ultima volta.
// Logica pura (senza rete), provata in _reminder.test.js. I file con "_" davanti non sono indirizzi dell'app.

const DAY_MS = 86_400_000

const parse = (iso) => Date.parse(`${iso}T00:00:00Z`)
export const addDays = (iso, days) => new Date(parse(iso) + days * DAY_MS).toISOString().slice(0, 10)
/** 0 = lunedì … 6 = domenica. */
export const weekdayIndex = (iso) => (new Date(parse(iso)).getUTCDay() + 6) % 7
export const mondayOf = (iso) => addDays(iso, -weekdayIndex(iso))

/** Giorno e ora in Italia, qualunque sia il fuso del server. */
export function romeNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) }
}

/** Dopo tanti giorni senza aprire l'app si smette di avvisare. */
const SILENT_AFTER_DAYS = 10

/**
 * @param state quello che manda l'app: { weekStart, target, nextTarget, doneDates, offDates, freezeUsed, lastDate, streak }
 * @param today giorno in Italia, YYYY-MM-DD
 * @param updatedAt quando l'app ha comunicato lo stato l'ultima volta (millisecondi)
 * @returns null se non c'è da avvisare, altrimenti { title, body }
 */
export function decide(state, today, updatedAt = Date.now()) {
  if (!state) return null
  if ((parse(today) - updatedAt) / DAY_MS > SILENT_AFTER_DAYS) return null

  const sameWeek = state.weekStart === mondayOf(today)
  const target = sameWeek ? state.target : (state.nextTarget ?? state.target)
  const done = sameWeek ? state.doneDates : []
  const freeze = sameWeek && state.freezeUsed
  // Oggi già allenato, oppure oggi ha detto "non riesco": niente avviso.
  if (done.includes(today) || (sameWeek && state.offDates.includes(today))) return null

  const needed = target - done.length - (freeze ? 1 : 0)
  if (needed <= 0) return null
  const daysLeft = 7 - weekdayIndex(today)
  const slack = daysLeft - needed
  // Il giorno dopo un allenamento si riposa, finché c'è margine.
  if (state.lastDate === addDays(today, -1) && slack >= 1) return null

  const n = needed === 1 ? 'Ne manca 1' : `Ne mancano ${needed}`
  const d = daysLeft === 1 ? 'oggi è l’ultimo giorno' : `restano ${daysLeft} giorni`
  const streak = state.streak > 0 ? ` La fiamma è a ${state.streak}.` : ''
  if (slack < 0) return { title: 'Allenamento', body: `${n} e ${d}: l’obiettivo è al limite, ma un allenamento oggi vale lo stesso.` }
  if (slack === 0) return { title: 'Oggi serve', body: `${n} e ${d}: niente margine. Anche la versione mini conta.${streak}` }
  return { title: 'Stasera ti alleni?', body: `${n} questa settimana, ${d}.${streak}` }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const dates = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && DATE.test(x)).slice(0, 7) : [])
const count = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : 0)

/** Tiene dello stato solo i campi previsti, con valori sensati. */
export function cleanState(raw) {
  if (!raw || typeof raw !== 'object' || !DATE.test(raw.weekStart ?? '')) return null
  return {
    weekStart: raw.weekStart,
    target: count(raw.target, 14),
    nextTarget: count(raw.nextTarget, 14),
    doneDates: dates(raw.doneDates),
    offDates: dates(raw.offDates),
    freezeUsed: raw.freezeUsed === true,
    lastDate: typeof raw.lastDate === 'string' && DATE.test(raw.lastDate) ? raw.lastDate : null,
    streak: count(raw.streak, 10_000),
  }
}

/** Servizi di notifica dei browser: non si mandano richieste ad altri indirizzi. */
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/, /\.push\.apple\.com$/]

export function cleanSubscription(raw) {
  try {
    const url = new URL(raw.endpoint)
    if (url.protocol !== 'https:' || !PUSH_HOSTS.some((h) => h.test(url.hostname))) return null
    const { p256dh, auth } = raw.keys
    if (typeof p256dh !== 'string' || typeof auth !== 'string' || p256dh.length > 200 || auth.length > 100) return null
    return { endpoint: url.href, keys: { p256dh, auth } }
  } catch {
    return null
  }
}
