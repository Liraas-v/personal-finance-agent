const CACHE_NAME = 'finance-agent-static-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Só cachear assets estáticos — nunca respostas de API (dados financeiros não podem ficar stale)
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return
  if (!url.pathname.startsWith('/_next/static/') && url.pathname !== '/icon.svg') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
    })
  )
})
