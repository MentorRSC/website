self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("app-cache").then(cache =>
      cache.addAll([
        "/",
        "/index.html",
        "/verify.html",
        "/dashboard.html",
        "/app.js"
      ])
    )
  );
});
