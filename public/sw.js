// Service Worker para Canaã Pro PWA
const CACHE_VERSION = 'canaa-pro-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Assets estáticos para cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.log('[SW] Failed to cache some assets:', err);
            });
        })
    );
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('canaa-pro-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Estratégia de fetch: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignorar requisições não HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }

    // Ignorar Firebase/Firestore (sempre buscar da rede)
    if (request.url.includes('firestore.googleapis.com') ||
        request.url.includes('firebase')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Se a resposta é válida, clone e salve no cache dinâmico
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se falhar, tente buscar do cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Fallback para página offline se for navegação
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Mensagem de comunicação com o app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
