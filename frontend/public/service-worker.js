const MESSAGES_CACHE = 'messages-cache-v1';

self.addEventListener('install', event => {
  console.log('🔧 Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activé');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== MESSAGES_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', event => {
  let payload = { title: 'New message', body: 'Contenu par défaut', data: { url: '/' } };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (err) {
    console.error('❌ Erreur parsing push data:', err);
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: payload.data?.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data || {};
  const url = data.url || '/';

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url !== url && 'navigate' in client) {
          return client.navigate(url);
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    !url.origin.includes(self.location.origin)
  ) {
    return;
  }

  if (url.pathname.startsWith('/api/messages')) {
    event.respondWith(
      caches.open(MESSAGES_CACHE).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          console.warn('⚠️ Offline - réponse depuis le cache');
          const cached = await cache.match(event.request);
          return cached || new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
  }
});
