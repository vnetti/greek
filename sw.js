// Take over right away so a new version (and its push handler) doesn't wait for every tab to close.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Network-first, cache fallback: always fresh online, still opens offline. no-cache: revalidate with the server (ETag) instead of
// trusting GitHub Pages' 10-minute HTTP cache, so a deploy shows up on the next open.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin && url.host !== 'www.gstatic.com') return; // gstatic = Firebase SDK, needed offline
  e.respondWith(
    fetch(e.request, url.origin === location.origin ? { cache: 'no-cache' } : {})
      .then(r => { const copy = r.clone(); caches.open('v1').then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});

// Reminder from scripts/remind.mjs via FCM (data-only message). iOS revokes push if a push shows nothing, so always show.
self.addEventListener('push', e => {
  let d = {};
  try { const p = e.data?.json() ?? {}; d = p.data ?? p.notification ?? {}; } catch {}
  e.waitUntil(self.registration.showNotification(d.title || 'Λέξεις', {
    body: d.body || 'Пора повторить слова', icon: 'icon.png', tag: 'remind'
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(ws => ws[0] ? ws[0].focus() : self.clients.openWindow('./')));
});
