/* 사랑나라 서비스워커 — 오프라인 캐시

   VER 은 **캐시 서랍 이름일 뿐**이다. 게임을 고칠 때마다 올리지 않아도 된다
   (2026-08-28 이전에는 손으로 올려야 했다 — 아래 참고).
   - HTML 은 네트워크 우선이라 새로고침 한 번이면 늘 최신이다.
   - 폰트·아이콘 같은 파일은 캐시로 먼저 보여 주고 뒤에서 조용히 새것으로 덮는다.
   - 홈 화면 앱이 새로고침을 안 하는 문제는 index.html 의 '새 버전 자동 반영'이
     맡는다(앱이 다시 보일 때 서버의 Last-Modified 를 확인해 새로고침).

   그래도 올리고 싶을 때: 캐시에 든 것을 전부 버리고 처음부터 받게 하고 싶을 때만
   (예: 캐시가 꼬였다고 의심될 때, FILES 목록을 바꿨을 때). */
const VER = 'sarangnara-v51';
const FILES = [
  './',
  './index.html',
  './privacy.html',
  './licenses.html',
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
