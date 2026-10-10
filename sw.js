// Network-first, cache fallback: always fresh online, still opens offline.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin && url.host !== 'www.gstatic.com') return; // gstatic = Firebase SDK, needed offline
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open('v1').then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
