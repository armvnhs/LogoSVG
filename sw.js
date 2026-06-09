// sw.js
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Installed');
});

self.addEventListener('fetch', (e) => {
    // یک رهگیری ساده برای اینکه مرورگر این سایت را PWA بشناسد
    e.respondWith(
        fetch(e.request).catch(() => {
            return new Response('شما آفلاین هستید.');
        })
    );
});
