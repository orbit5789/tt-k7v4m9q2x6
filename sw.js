const prefix = 'my-timetable:' + self.registration.scope + ':';
const cacheName = prefix + 'v2';
const home = new URL('index.html', self.registration.scope).href;
const files = [home, 'manifest.json', 'icon-192.png', 'icon-512.png']
  .map(path => new URL(path, self.registration.scope).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll(files.map(url => new Request(url, { cache: 'reload' })))
  ));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (event.request.method !== 'GET' || !url.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(cacheName).then(async cache =>
      (await cache.match(home)) || fetch(event.request)
    ));
  } else if (files.includes(url)) {
    event.respondWith(caches.open(cacheName).then(async cache =>
      (await cache.match(url)) || fetch(event.request)
    ));
  }
});
