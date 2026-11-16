import { decide, romeNow } from './_reminder.js'
import { allDevices, removeDevice, saveDevice, send, storeConfigured } from './_store.js'

// Vercel chiama questo indirizzo una volta al giorno (vercel.json). Per ogni telefono iscritto decide se
// avvisare. Al massimo una notifica al giorno per telefono e mai prima del pomeriggio: chiamarlo a mano
// più volte non fa danni.

const NOT_BEFORE_HOUR = 16

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (!storeConfigured) return res.status(200).json({ configured: false })
    const { date, hour } = romeNow()
    if (hour < NOT_BEFORE_HOUR) return res.status(200).json({ sent: 0, reason: 'presto' })

    let sent = 0
    for (const [id, device] of await allDevices()) {
      if (device.lastSent === date) continue
      const message = decide(device.state, date, device.updatedAt)
      if (!message) continue
      const result = await send(device.subscription, message, req.headers.host)
      if (result === 'gone') await removeDevice(id)
      else if (result === 'ok') {
        await saveDevice(id, { ...device, lastSent: date })
        sent++
      }
    }
    return res.status(200).json({ sent })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'server' })
  }
}
