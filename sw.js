// Service worker del sitio: muestra el aviso cuando el servidor manda un push.
// El push llega vacío; el texto sale de news.json (lo último que cambió en el sitio).
const SITE = self.registration.scope;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => e.waitUntil((async () => {
  let lang = "es";
  try {
    const r = await (await caches.open("prefs")).match("lang");
    if (r && (await r.text()) === "pt") lang = "pt";
  } catch (_) {}
  const i = lang === "pt" ? 1 : 0;
  let body = ["El itinerario se actualizó. Tocá para ver.", "O roteiro foi atualizado. Toque para ver."][i];
  try {
    const n = await (await fetch(SITE + "news.json?t=" + Date.now(), { cache: "no-store" })).json();
    if (n.items && n.items[0]) body = n.items[0][i];
  } catch (_) {}
  try { if (self.navigator.setAppBadge) await self.navigator.setAppBadge(1); } catch (_) {}
  await self.registration.showNotification(["Rumbo a Ceará: novedades", "Rumo ao Ceará: novidades"][i], {
    body,
    icon: SITE + "icon-192.png",
    badge: SITE + "icon-192.png",
    tag: "novedades",
    renotify: true,
    data: { url: SITE },
  });
})()));

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(SITE)) {
        await w.focus();
        try { await w.navigate(SITE); } catch (_) {}
        return;
      }
    }
    await self.clients.openWindow(SITE);
  })());
});
