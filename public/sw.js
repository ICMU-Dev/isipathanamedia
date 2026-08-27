/* global clients */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});


self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  let body = "New notification";
  let title = "ICMU Update";
  let url = "/";

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      url = data.data?.url || data.url || url;
    } catch (e) {
      body = event.data.text();
    }
  }

  let options = {
    body: body,
    icon: "/web-app-manifest-192x192.png",
    badge: "/favicon-96x96.png",
    data: { url: url }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      // Merge all data (including actions, swapped icons) directly into options
      options = { ...options, ...data, data: { url: data.data?.url || data.url || url } };
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return; // User clicked the "Close" action button
  }

  const targetPath = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Try to find an existing app window on our origin and focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          // Navigate the existing window to the settings page
          if ("navigate" in client) {
            return client.navigate(self.location.origin + targetPath).then((c) => c && c.focus());
          }
          return client.focus();
        }
      }
      // No existing window — open a new one
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + targetPath);
      }
    })
  );
});
