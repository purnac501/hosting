/* piggii's home page - tiny service worker.
   Keeps the site installable and readable offline.
   Runtime caching only, so it works unchanged on project Pages
   URLs (…/REPOSITORY/) and custom domains alike. */
(function () {
  var CACHE = 'piggii-v1';

  self.addEventListener('install', function (e) {
    self.skipWaiting();
  });

  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE; })
              .map(function (k) { return caches.delete(k); })
        );
      }).then(function () { return self.clients.claim(); })
    );
  });

  self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;

    var url = new URL(req.url);
    if (url.origin !== location.origin) return;
    // Never cache the CMS admin area or the OAuth helper.
    if (url.pathname.indexOf('/admin') !== -1) return;

    // Pages: network first, cached copy as fallback (works offline).
    if (req.mode === 'navigate') {
      e.respondWith(
        fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () {
          return caches.match(req);
        })
      );
      return;
    }

    // Static assets: cache first, refresh in the background.
    e.respondWith(
      caches.match(req).then(function (hit) {
        var refresh = fetch(req).then(function (res) {
          if (res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        }).catch(function () { return hit; });
        return hit || refresh;
      })
    );
  });
})();
