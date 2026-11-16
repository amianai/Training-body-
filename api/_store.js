import { generateVAPIDKeys, sendNotification } from 'web-push'

// Memoria del promemoria: un database Redis di Upstash collegato al progetto da Vercel (Storage).
// Ci stanno le chiavi per firmare le notifiche e, per ogni telefono, dove mandarle e lo stato della settimana.

// Vercel sceglie il nome delle variabili in base al prefisso dato al collegamento (KV, STORAGE, UPSTASH_REDIS…):
// si cerca per finale del nome, così funziona con qualsiasi prefisso.
function findEnv(pattern, env = process.env) {
  const name = Object.keys(env).sort().find((key) => pattern.test(key) && !/READ_ONLY/.test(key) && env[key])
  return name ? env[name] : undefined
}
const url = findEnv(/(^|_)REST(_API)?_URL$/)
const token = findEnv(/(^|_)REST(_API)?_TOKEN$/)
export const storeConfigured = Boolean(url && token)

const KEYS = 'allenamento:vapid'
const DEVICES = 'allenamento:devices'
export const MAX_DEVICES = 20

async function redis(...command) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(`Redis: ${json.error ?? res.status}`)
  return json.result
}

/** Chiavi delle notifiche: create da sole la prima volta, la privata non esce mai da qui. */
export async function vapidKeys() {
  let saved = await redis('GET', KEYS)
  if (!saved) {
    await redis('SET', KEYS, JSON.stringify(generateVAPIDKeys()), 'NX')
    saved = await redis('GET', KEYS)
  }
  return JSON.parse(saved)
}

export async function getDevice(id) {
  const raw = await redis('HGET', DEVICES, id)
  return raw ? JSON.parse(raw) : null
}

export const deviceCount = () => redis('HLEN', DEVICES)
export const saveDevice = (id, device) => redis('HSET', DEVICES, id, JSON.stringify(device))
export const removeDevice = (id) => redis('HDEL', DEVICES, id)

export async function allDevices() {
  const flat = (await redis('HGETALL', DEVICES)) ?? []
  const out = []
  for (let i = 0; i < flat.length; i += 2) out.push([flat[i], JSON.parse(flat[i + 1])])
  return out
}

/** Manda una notifica. Torna 'ok', 'gone' (il telefono non la vuole più) oppure 'error'. */
export async function send(subscription, payload, host) {
  const { publicKey, privateKey } = await vapidKeys()
  try {
    await sendNotification(subscription, JSON.stringify(payload), {
      vapidDetails: { subject: `https://${host}`, publicKey, privateKey },
      TTL: 3 * 3600,
    })
    return 'ok'
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) return 'gone'
    console.error('Notifica non inviata', error.statusCode, error.body ?? error.message)
    return 'error'
  }
}
