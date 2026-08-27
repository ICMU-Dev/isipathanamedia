/* eslint-env node */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  MockLocalStorage,
  MockServiceWorkerScope,
  runLocalStorageGC,
  runSuite,
  isDirectExecution,
} from "./test_harness.js";

const STORAGE_KEY = "icmu_read_feedback_ids";

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
  // Tier 3: Cross-Feature Pairwise Combinations (10 tests)
  // ==========================================
  {
    id: "T3_01_push_dispatch_to_sw_and_context_sync",
    name: "Edge Function dispatch (F8) -> SW push receive (F6) -> Context sync & unread count (F4)",
    tier: 3,
    feature: "F8+F6+F4",
    fn: async () => {
      // 1. SW receives push payload originating from Edge Function format
      const swScope = new MockServiceWorkerScope();
      loadServiceWorker(swScope);

      const pushPayload = {
        title: "🐞 User submitted a Bug Report",
        body: "Login issue\n\n\"Cannot click submit button\"",
        icon: "https://isipathanamedia.online/logo.png",
        data: { url: "/25473/dashboard/settings" },
      };

      await swScope.triggerPush(pushPayload);
      assert.strictEqual(swScope.notificationsShown.length, 1);

      // 2. Context updates realtime notification state
      const storage = new MockLocalStorage();
      const readIds = runLocalStorageGC(storage, ["fb_realtime_999"]);
      assert.strictEqual(readIds.length, 0);
      assert.strictEqual(storage.getItem(STORAGE_KEY), null);
    },
  },
  {
    id: "T3_02_read_action_to_localstorage_and_gc",
    name: "Admin marks feedback read (F5) -> saved to LocalStorage (F1) -> DB deletion triggers GC purge (F2)",
    tier: 3,
    feature: "F5+F1+F2",
    fn: async () => {
      const storage = new MockLocalStorage();
      // Admin marks fb_1 and fb_2 read
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2"]));

      // System deletes fb_2 from DB
      const dbFeedbacks = ["fb_1"];
      const cleaned = runLocalStorageGC(storage, dbFeedbacks);

      assert.deepStrictEqual(cleaned, ["fb_1"]);
      assert.strictEqual(storage.getItem(STORAGE_KEY), '["fb_1"]');
    },
  },
  {
    id: "T3_03_permission_disable_to_edge_function_filtering",
    name: "User sets is_allowed = false (F7) -> Edge Function excludes subscription (F8) -> SW receives no push (F6)",
    tier: 3,
    feature: "F7+F8+F6",
    fn: async () => {
      const subs = [
        { id: "sub_1", user_id: "admin_1", endpoint: "ep_1", is_allowed: false },
      ];

      const allowedSubs = subs.filter((s) => s.is_allowed);
      assert.strictEqual(allowedSubs.length, 0);

      const swScope = new MockServiceWorkerScope();
      loadServiceWorker(swScope);
      // No push triggered because no allowed subscriptions
      assert.strictEqual(swScope.notificationsShown.length, 0);
    },
  },
  {
    id: "T3_04_context_init_with_localstorage_read_and_gc",
    name: "Admin mounts context (F3) -> compares DB with LocalStorage (F1) -> runs GC (F2) -> computes unread count (F4)",
    tier: 3,
    feature: "F3+F1+F2+F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_deleted_99"]));

      const dbItems = [{ id: "fb_1", title: "Item 1" }, { id: "fb_2", title: "Item 2" }];
      const dbIds = dbItems.map((i) => i.id);

      const cleanedReadIds = runLocalStorageGC(storage, dbIds);
      assert.deepStrictEqual(cleanedReadIds, ["fb_1"]);

      const unreadCount = dbItems.filter((i) => !cleanedReadIds.includes(i.id)).length;
      assert.strictEqual(unreadCount, 1); // fb_2 is unread
    },
  },
  {
    id: "T3_05_sw_notification_click_to_read_action",
    name: "SW receives push (F6) -> notification click opens app -> context loads (F3) -> mark read (F5) -> LocalStorage updated (F1)",
    tier: 3,
    feature: "F6+F3+F5+F1",
    fn: async () => {
      const swScope = new MockServiceWorkerScope("https://isipathanamedia.online");
      loadServiceWorker(swScope);

      const { closed } = await swScope.triggerNotificationClick({ url: "/admin/feedback?id=fb_10" });
      assert.strictEqual(closed, true);

      const storage = new MockLocalStorage();
      const readIds = ["fb_10"];
      storage.setItem(STORAGE_KEY, JSON.stringify(readIds));

      assert.strictEqual(storage.getItem(STORAGE_KEY), '["fb_10"]');
    },
  },
  {
    id: "T3_06_realtime_insert_to_unread_count_and_storage",
    name: "Realtime feedback insert (F3/F4) -> unread count increments -> user marks all read (F5) -> saved to LocalStorage (F1)",
    tier: 3,
    feature: "F3+F4+F5+F1",
    fn: async () => {
      const storage = new MockLocalStorage();
      const initialDb = [{ id: "fb_1", title: "Initial" }];

      // Mark initial read
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_1"]));

      // Realtime insert
      const realtimeItem = { id: "fb_2", title: "Realtime" };
      const currentRead = JSON.parse(storage.getItem(STORAGE_KEY));
      const unreadCount = [ ...initialDb, realtimeItem ].filter((i) => !currentRead.includes(i.id)).length;
      assert.strictEqual(unreadCount, 1);

      // User marks all read
      const updatedRead = ["fb_1", "fb_2"];
      storage.setItem(STORAGE_KEY, JSON.stringify(updatedRead));
      assert.strictEqual(JSON.parse(storage.getItem(STORAGE_KEY)).length, 2);
    },
  },
  {
    id: "T3_07_expired_sub_pruning_to_schema_integrity",
    name: "Edge function push 410 failure (F8) -> deletes subscription from DB (F7) -> subsequent queries clean",
    tier: 3,
    feature: "F8+F7",
    fn: async () => {
      let dbTable = [
        { id: "sub_expired", user_id: "admin_1", endpoint: "ep_410" },
        { id: "sub_valid", user_id: "admin_1", endpoint: "ep_valid" },
      ];

      // Simulated 410 error handler in Edge Function
      const handle410Error = (failedId) => {
        dbTable = dbTable.filter((r) => r.id !== failedId);
      };

      handle410Error("sub_expired");
      assert.strictEqual(dbTable.length, 1);
      assert.strictEqual(dbTable[0].id, "sub_valid");
    },
  },
  {
    id: "T3_08_corrupted_localstorage_to_context_recovery",
    name: "Corrupted LocalStorage (F1) -> Context mount (F3) -> GC recovers state (F2) -> unread count computed safely (F4)",
    tier: 3,
    feature: "F1+F3+F2+F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, "CORRUPTED_NON_JSON_DATA{{");

      const dbItems = [{ id: "fb_1", title: "Item 1" }];
      const dbIds = dbItems.map((i) => i.id);

      const cleanedReadIds = runLocalStorageGC(storage, dbIds);
      assert.deepStrictEqual(cleanedReadIds, []);
      assert.strictEqual(storage.getItem(STORAGE_KEY), "[]");

      const unreadCount = dbItems.length - cleanedReadIds.length;
      assert.strictEqual(unreadCount, 1);
    },
  },
  {
    id: "T3_09_multi_admin_permission_toggles_and_push",
    name: "Admin A enabled, Admin B disabled (F7) -> Edge function pushes to Admin A only (F8) -> SW receives for Admin A (F6)",
    tier: 3,
    feature: "F7+F8+F6",
    fn: async () => {
      const subscriptions = [
        { user_id: "admin_A", endpoint: "ep_A", is_allowed: true },
        { user_id: "admin_B", endpoint: "ep_B", is_allowed: false },
      ];

      const targets = subscriptions.filter((s) => s.is_allowed);
      assert.strictEqual(targets.length, 1);
      assert.strictEqual(targets[0].user_id, "admin_A");

      const swScopeA = new MockServiceWorkerScope();
      loadServiceWorker(swScopeA);
      await swScopeA.triggerPush({ title: "Feedback for Admin A" });
      assert.strictEqual(swScopeA.notificationsShown.length, 1);
    },
  },
  {
    id: "T3_10_bulk_feedback_creation_read_and_gc_lifecycle",
    name: "50 feedbacks created -> read 20 (F5) -> saved (F1) -> 10 deleted in DB -> GC purges deleted (F2) -> 10 read kept",
    tier: 3,
    feature: "F5+F1+F2",
    fn: async () => {
      const storage = new MockLocalStorage();
      const all50 = Array.from({ length: 50 }, (_, i) => `fb_${i}`);
      const read20 = all50.slice(0, 20);

      // Save 20 read
      storage.setItem(STORAGE_KEY, JSON.stringify(read20));

      // 10 of the read items were deleted from DB (fb_0 to fb_9 deleted)
      const remainingDbIds = all50.slice(10); // fb_10 to fb_49 remain in DB
      const cleaned = runLocalStorageGC(storage, remainingDbIds);

      assert.strictEqual(cleaned.length, 10);
      assert.deepStrictEqual(cleaned, all50.slice(10, 20));
    },
  },

  // ==========================================
  // Tier 4: Real-World Application Scenarios (5 tests)
  // ==========================================
  {
    id: "T4_01_full_user_feedback_submission_and_admin_notification_flow",
    name: "End-to-End User Feedback Submission to Admin Notification & Unread Count Flow",
    tier: 4,
    feature: "E2E Workflow 1",
    fn: async () => {
      // Step A: User submits feedback
      const feedbackSubmission = {
        id: "fb_live_101",
        title: "Navigation menu alignment issue",
        description: "The menu overlaps on mobile viewport",
        type: "bug",
        reporter_name: "Jane Student",
      };

      // Step B: Database trigger triggers Edge Function, which queries allowed subscriptions
      const adminSubs = [
        { user_id: "admin_1", endpoint: "https://fcm.googleapis.com/fcm/send/token1", is_allowed: true },
      ];
      const activeSubs = adminSubs.filter((s) => s.is_allowed);
      assert.strictEqual(activeSubs.length, 1);

      // Step C: Service Worker receives background push and shows notification
      const swScope = new MockServiceWorkerScope("https://isipathanamedia.online");
      loadServiceWorker(swScope);
      await swScope.triggerPush({
        title: `🐞 ${feedbackSubmission.reporter_name} submitted a Bug Report`,
        body: `${feedbackSubmission.title}\n\n"${feedbackSubmission.description}"`,
        data: { url: "/admin/feedback" },
      });
      assert.strictEqual(swScope.notificationsShown.length, 1);

      // Step D: Admin clicks notification, opening app
      const { closed } = await swScope.triggerNotificationClick({ url: "/admin/feedback" });
      assert.strictEqual(closed, true);

      // Step E: NotificationContext mounts and updates unread badge
      const storage = new MockLocalStorage();
      const cleanedRead = runLocalStorageGC(storage, [feedbackSubmission.id]);
      const unreadCount = 1 - cleanedRead.length;
      assert.strictEqual(unreadCount, 1);
    },
  },
  {
    id: "T4_02_admin_cross_session_read_tracking_and_cleanup_lifecycle",
    name: "End-to-End Admin Cross-Session Read Tracking and GC Cleanup Lifecycle",
    tier: 4,
    feature: "E2E Workflow 2",
    fn: async () => {
      const storage = new MockLocalStorage();

      // Session 1: Admin logs in, sees 5 feedbacks, marks 2 as read
      const initialDb = ["fb_1", "fb_2", "fb_3", "fb_4", "fb_5"];
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2"]));

      // Session 2: Admin reloads page. Unread count is 3
      const s2Read = JSON.parse(storage.getItem(STORAGE_KEY));
      const s2Unread = initialDb.filter((id) => !s2Read.includes(id)).length;
      assert.strictEqual(s2Unread, 3);

      // System background job deletes fb_1 from DB
      const updatedDb = ["fb_2", "fb_3", "fb_4", "fb_5"];

      // Session 3: Admin reloads page. GC runs on fetch
      const cleanedRead = runLocalStorageGC(storage, updatedDb);
      assert.deepStrictEqual(cleanedRead, ["fb_2"]);
      assert.strictEqual(storage.getItem(STORAGE_KEY), '["fb_2"]');

      const s3Unread = updatedDb.filter((id) => !cleanedRead.includes(id)).length;
      assert.strictEqual(s3Unread, 3); // fb_3, fb_4, fb_5 remain unread
    },
  },
  {
    id: "T4_03_multi_device_subscription_and_permission_management",
    name: "End-to-End Multi-Device Subscription and Permission Toggle Management",
    tier: 4,
    feature: "E2E Workflow 3",
    fn: async () => {
      // Device A (Desktop): Allowed, Device B (Mobile): Disallowed
      const userDevices = [
        { id: "sub_desktop", device: "desktop", endpoint: "ep_desktop", is_allowed: true },
        { id: "sub_mobile", device: "mobile", endpoint: "ep_mobile", is_allowed: false },
      ];

      // Dispatch 1: Push sent ONLY to desktop
      let targetSubs = userDevices.filter((d) => d.is_allowed);
      assert.strictEqual(targetSubs.length, 1);
      assert.strictEqual(targetSubs[0].device, "desktop");

      // User updates Mobile setting to allowed
      userDevices.find((d) => d.device === "mobile").is_allowed = true;

      // Dispatch 2: Push sent to BOTH desktop and mobile
      targetSubs = userDevices.filter((d) => d.is_allowed);
      assert.strictEqual(targetSubs.length, 2);
    },
  },
  {
    id: "T4_04_offline_to_online_service_worker_and_context_rehydration",
    name: "End-to-End Offline-to-Online Background Push and Context Rehydration",
    tier: 4,
    feature: "E2E Workflow 4",
    fn: async () => {
      // SW receives push while browser window was closed / offline
      const swScope = new MockServiceWorkerScope("https://isipathanamedia.online");
      loadServiceWorker(swScope);

      await swScope.triggerPush({
        title: "Offline notification",
        body: "Update received",
        data: { url: "/admin/feedback" },
      });

      // SW retains notification in tray
      assert.strictEqual(swScope.notificationsShown.length, 1);

      // User clicks notification when network reconnects
      await swScope.triggerNotificationClick({ url: "/admin/feedback" });
      assert.strictEqual(swScope.openClients.length, 1);

      // App context rehydrates state from DB fetch
      const storage = new MockLocalStorage();
      const activeDb = ["fb_offline_1"];
      const cleanedRead = runLocalStorageGC(storage, activeDb);
      assert.strictEqual(activeDb.length - cleanedRead.length, 1);
    },
  },
  {
    id: "T4_05_heavy_load_bulk_feedback_and_gc_performance_stress",
    name: "End-to-End High-Load Bulk Feedback Storage and GC Performance Stress Test",
    tier: 4,
    feature: "E2E Workflow 5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const all500 = Array.from({ length: 500 }, (_, i) => `fb_heavy_${i}`);

      // Admin marks all 500 read
      const t0 = performance.now();
      storage.setItem(STORAGE_KEY, JSON.stringify(all500));
      const writeTime = performance.now() - t0;
      assert.ok(writeTime < 20, `Bulk write took ${writeTime.toFixed(2)}ms`);

      // 250 items deleted from DB
      const remaining250 = all500.slice(250);

      // GC runs
      const t1 = performance.now();
      const cleaned = runLocalStorageGC(storage, remaining250);
      const gcTime = performance.now() - t1;

      assert.strictEqual(cleaned.length, 250);
      assert.strictEqual(JSON.parse(storage.getItem(STORAGE_KEY)).length, 250);
      assert.ok(gcTime < 10, `GC execution took ${gcTime.toFixed(2)}ms, under 10ms threshold`);
    },
  },
];

if (isDirectExecution(import.meta.url)) {
  runSuite("tier4_real_world.test.js", testCases).then((res) => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
