/* 사랑나라 서비스워커 — 오프라인 캐시
   게임을 고칠 때마다 아래 VER 숫자를 1 올리면 새 버전이 반영됩니다. */
const VER = 'sarangnara-v26';
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

/* 게임 본체(HTML)는 네트워크 우선 — 온라인이면 새로고침 한 번에 최신본이 뜸.
   폰트·아이콘 등 안 바뀌는 파일은 캐시 우선 — 빠르고 데이터도 아낌.
   둘 다 네트워크가 안 되면 캐시로 폴백해서 오프라인에서도 그대로 돌아감. */
function putCache(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(VER).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isPage = req.mode === 'navigate' ||
                 url.pathname.endsWith('/') ||
                 url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('.json');

  if (isPage) {
    // 네트워크 우선
    e.respondWith(
      fetch(req)
        .then(res => putCache(req, res))
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // 캐시 우선 (+ 뒤에서 조용히 갱신)
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => putCache(req, res)).catch(() => hit);
      return hit || net;
    })
  );
});
