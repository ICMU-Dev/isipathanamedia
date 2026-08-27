/* eslint-env node */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  MockServiceWorkerScope,
  runSuite,
  isDirectExecution,
} from "./test_harness.js";

// Helper to evaluate sw.js source inside MockServiceWorkerScope
function loadServiceWorker(scope) {
  const swPath = path.resolve(process.cwd(), "public/sw.js");
  const swCode = fs.readFileSync(swPath, "utf-8");

  const runner = new Function("self", "caches", "clients", "fetch", "URL", swCode);
  runner(
    scope.self,
    { keys: async () => [], delete: async () => true },
    scope.self.clients,
    async () => {},
    URL,
  );
}

export const testCases = [
  // ==========================================
  // Feature F6: Background Service Worker (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F6_T1_01",
    name: "Service worker public/sw.js registers push event listener via self.addEventListener",
    tier: 1,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      loadServiceWorker(scope);

      const pushHandlers = scope.listeners.get("push");
      assert.ok(pushHandlers && pushHandlers.length > 0, "No 'push' listener found in sw.js");
    },
  },
  {
    id: "F6_T1_02",
    name: "Push event formats title, body, icon, badge, tag, and target URL correctly in showNotification",
    tier: 1,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      loadServiceWorker(scope);

      const payload = {
        title: "💬 New Student Feedback",
        body: "Great job on the website!",
        icon: "/custom-icon.png",
        badge: "/custom-badge.png",
        tag: "icmu-custom-tag",
        data: { url: "/admin/feedback?id=123" },
      };

      await scope.triggerPush(payload);

      assert.strictEqual(scope.notificationsShown.length, 1);
      const notif = scope.notificationsShown[0];
      assert.strictEqual(notif.title, "💬 New Student Feedback");
      assert.strictEqual(notif.options.body, "Great job on the website!");
      assert.strictEqual(notif.options.icon, "/custom-icon.png");
      assert.strictEqual(notif.options.badge, "/custom-badge.png");
      assert.strictEqual(notif.options.tag, "icmu-custom-tag");
      assert.strictEqual(notif.options.data.url, "/admin/feedback?id=123");
    },
  },
  {
    id: "F6_T1_03",
    name: "Service worker public/sw.js registers notificationclick event listener",
    tier: 1,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      loadServiceWorker(scope);

      const clickHandlers = scope.listeners.get("notificationclick");
      assert.ok(clickHandlers && clickHandlers.length > 0, "No 'notificationclick' listener found in sw.js");
    },
  },
  {
    id: "F6_T1_04",
    name: "Notification click event focuses existing open client window matching target URL",
    tier: 1,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope("https://isipathanamedia.online");
      loadServiceWorker(scope);

      const targetUrl = "https://isipathanamedia.online/admin/feedback";
      const existingClient = {
        url: targetUrl,
        focused: false,
        focus: async function () {
          this.focused = true;
          return this;
        },
      };
      scope.openClients.push(existingClient);

      const { closed } = await scope.triggerNotificationClick({ url: "/admin/feedback" });

      assert.strictEqual(closed, true);
      assert.strictEqual(existingClient.focused, true);
    },
  },
  {
    id: "F6_T1_05",
    name: "Notification click event calls clients.openWindow when no matching window exists",
    tier: 1,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope("https://isipathanamedia.online");
      loadServiceWorker(scope);

      const { closed } = await scope.triggerNotificationClick({ url: "/admin/feedback/details" });

      assert.strictEqual(closed, true);
      assert.strictEqual(scope.openClients.length, 1);
      assert.strictEqual(scope.openClients[0].url, "https://isipathanamedia.online/admin/feedback/details");
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F6_T2_06",
    name: "Push event handles missing payload fields using default fallback values",
    tier: 2,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      loadServiceWorker(scope);

      await scope.triggerPush({}); // Empty payload

      assert.strictEqual(scope.notificationsShown.length, 1);
      const notif = scope.notificationsShown[0];
      assert.strictEqual(notif.title, "ICMU Notification");
      assert.strictEqual(notif.options.body, "You have a new update.");
      assert.strictEqual(notif.options.icon, "/icmu-logo.png");
      assert.strictEqual(notif.options.data.url, "/admin/feedback");
    },
  },
  {
    id: "F6_T2_07",
    name: "Push event handles non-JSON raw text payload gracefully",
    tier: 2,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      loadServiceWorker(scope);

      const rawTextEventData = {
        json: () => {
          throw new SyntaxError("Unexpected token");
        },
        text: () => "Raw text notification body content",
      };

      const handlers = scope.listeners.get("push") || [];
      for (const h of handlers) {
        await h({ data: rawTextEventData, waitUntil: (p) => p });
      }

      assert.strictEqual(scope.notificationsShown.length, 1);
      assert.strictEqual(scope.notificationsShown[0].options.body, "Raw text notification body content");
    },
  },
  {
    id: "F6_T2_08",
    name: "Push event handles null event.data without throwing unhandled exceptions",
    tier: 2,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      loadServiceWorker(scope);

      await scope.triggerPush(null);

      assert.strictEqual(scope.notificationsShown.length, 1);
      assert.strictEqual(scope.notificationsShown[0].title, "ICMU Notification");
    },
  },
  {
    id: "F6_T2_09",
    name: "Notification click event navigates an open same-origin window if target URL differs",
    tier: 2,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope("https://isipathanamedia.online");
      loadServiceWorker(scope);

      const sameOriginClient = {
        url: "https://isipathanamedia.online/admin/dashboard",
        focused: false,
        navigatedUrl: null,
        navigate: async function (newUrl) {
          this.navigatedUrl = newUrl;
          this.url = newUrl;
          return this;
        },
        focus: async function () {
          this.focused = true;
          return this;
        },
      };
      scope.openClients.push(sameOriginClient);

      await scope.triggerNotificationClick({ url: "/admin/feedback" });

      assert.strictEqual(sameOriginClient.navigatedUrl, "https://isipathanamedia.online/admin/feedback");
      assert.strictEqual(sameOriginClient.focused, true);
    },
  },
  {
    id: "F6_T2_10",
    name: "Catch errors from showNotification gracefully without failing service worker event",
    tier: 2,
    feature: "F6",
    fn: async () => {
      const scope = new MockServiceWorkerScope();
      scope.self.registration.showNotification = async () => {
        throw new Error("Notification permission revoked by OS");
      };
      loadServiceWorker(scope);

      // Should not throw uncaught error
      await scope.triggerPush({ title: "Test" });
      assert.ok(true, "Handled showNotification failure cleanly");
    },
  },
];

if (isDirectExecution(import.meta.url)) {
  runSuite("r3_service_worker.test.js", testCases).then((res) => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
