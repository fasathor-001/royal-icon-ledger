import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Take over immediately so new builds are served without waiting for all tabs to close
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// ── Push event ──────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { title = 'Royal-Icon Ledger', body = '', url = '/' } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url },
      requireInteraction: false,
    })
  );
});

// ── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url.startsWith(self.location.origin));
        if (existing) return existing.focus();
        return clients.openWindow(targetUrl);
      })
  );
});
