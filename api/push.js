import { cleanState, cleanSubscription } from './_reminder.js'
import { MAX_DEVICES, deviceCount, getDevice, removeDevice, saveDevice, send, storeConfigured, vapidKeys } from './_store.js'

// L'app parla con questo indirizzo per attivare il promemoria, aggiornare lo stato della settimana,
// chiedere una notifica di prova e disattivare.

const DEVICE_ID = /^[a-zA-Z0-9-]{16,64}$/

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (!storeConfigured) return res.status(200).json({ configured: false })
    if (req.method === 'GET') return res.status(200).json({ configured: true, publicKey: (await vapidKeys()).publicKey })
    if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' })

    const { action, deviceId, subscription, state } = req.body ?? {}
    if (typeof deviceId !== 'string' || !DEVICE_ID.test(deviceId)) return res.status(400).json({ error: 'telefono' })
    const existing = await getDevice(deviceId)

    if (action === 'subscribe') {
      const sub = cleanSubscription(subscription)
      if (!sub) return res.status(400).json({ error: 'iscrizione' })
      if (!existing && (await deviceCount()) >= MAX_DEVICES) return res.status(429).json({ error: 'pieno' })
      await saveDevice(deviceId, { ...existing, subscription: sub, state: cleanState(state) ?? existing?.state ?? null, updatedAt: Date.now() })
      return res.status(200).json({ ok: true })
    }
    if (!existing) return res.status(404).json({ error: 'non iscritto' })

    if (action === 'state') {
      const clean = cleanState(state)
      if (!clean) return res.status(400).json({ error: 'stato' })
      await saveDevice(deviceId, { ...existing, state: clean, updatedAt: Date.now() })
      return res.status(200).json({ ok: true })
    }
    if (action === 'test') {
      const result = await send(existing.subscription, { title: 'Promemoria attivo', body: 'Le notifiche funzionano. Ti scrivo la sera, solo quando serve.' }, req.headers.host)
      if (result === 'gone') await removeDevice(deviceId)
      return res.status(result === 'ok' ? 200 : 502).json({ ok: result === 'ok', result })
    }
    if (action === 'unsubscribe') {
      await removeDevice(deviceId)
      return res.status(200).json({ ok: true })
    }
    return res.status(400).json({ error: 'azione' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}
