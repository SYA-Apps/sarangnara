/* 사랑나라 서비스워커 — 오프라인 캐시
   게임을 고칠 때마다 아래 VER 숫자를 1 올리면 새 버전이 반영됩니다. */
const VER = 'sarangnara-v9';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './fonts/Gaegu-Regular.woff2',
  './fonts/GothicA1-Regular.woff2',
  './fonts/GothicA1-SemiBold.woff2',
  './fonts/GothicA1-ExtraBold.woff2'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VER).then(c => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 캐시 우선 — 오프라인에서도 바로 뜸. 동시에 뒤에서 새 버전을 받아둠 */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VER).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
