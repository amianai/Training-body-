// Parte del service worker che riceve il promemoria e lo mostra come notifica.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data.json()
  } catch {
    // notifica senza testo: si mostra quello di base
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Allenamento', {
      body: data.body || '',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: 'promemoria',
    }),
  )
})

// Toccando la notifica si apre l'app (o si torna a quella già aperta).
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) if ('focus' in client) return client.focus()
      return self.clients.openWindow('/')
    }),
  )
})
