// Network-first, cache fallback: always fresh online, still opens offline.
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open('v1').then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
