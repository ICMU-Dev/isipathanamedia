/* global clients */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});


self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  let body = "You have a new update.";
  let title = "ICMU Notification";
  let url = "/admin/feedback";
  let icon = "/icmu-logo.png";
  let badge = "/favicon-96x96.png";

  let options = {
    body,
    icon,
    badge,
    data: { url }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options = {
        ...options,
        ...data,
        body: data.body || body,
        icon: data.icon || icon,
        badge: data.badge || badge,
        data: { url: data.data?.url || data.url || url }
      };
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
