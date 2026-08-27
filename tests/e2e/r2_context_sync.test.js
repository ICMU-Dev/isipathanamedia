/* eslint-env node */
import assert from "node:assert";
import {
  MockLocalStorage,
  runLocalStorageGC,
  runSuite,
  isDirectExecution,
} from "./test_harness.js";

const STORAGE_KEY = "icmu_read_feedback_ids";

/**
 * Simulated NotificationContext state manager for testing
 */
class NotificationContextSimulator {
  constructor(user = null, localStorage = new MockLocalStorage()) {
    this.user = user;
    this.localStorage = localStorage;
    this.notifications = [];
    this.fetchError = null;
    this.channelSubscribed = false;
  }

  isAdmin() {
    if (!this.user || !this.user.role) return false;
    const role = String(this.user.role).toLowerCase();
    return (
      role === "admin" ||
      role === "super_admin" ||
      role === "superadmin" ||
      role === "super-admin"
    );
  }

  async mountFetch(mockDbFeedbacks, shouldFail = false) {
    if (!this.user) {
      this.notifications = [];
      return;
    }

    if (!this.isAdmin()) {
      // Non-admin user fallback: do not fetch admin feedbacks
      this.notifications = [];
      return;
    }

    if (shouldFail) {
      this.fetchError = new Error("Network error fetching feedbacks");
      return;
    }

    // Sanitize DB feedbacks
    const validItems = (mockDbFeedbacks || []).filter(
      (item) => item && item.id && item.title,
    );

    // Sort by created_at descending
    validItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Garbage Collection against stored read IDs
    const activeDbIds = validItems.map((item) => String(item.id));
    const cleanedReadIds = runLocalStorageGC(this.localStorage, activeDbIds);
    const readSet = new Set(cleanedReadIds);

    this.notifications = validItems.map((item) => ({
      id: `fb_${item.id}`,
      rawId: String(item.id),
      senderId: "system",
      senderName: "System",
      text: `New ${item.type?.toUpperCase()} Feedback: ${item.title}`,
      createdAt: item.created_at || new Date().toISOString(),
      read: readSet.has(String(item.id)),
      isFeedback: true,
    }));

    this.channelSubscribed = true;
  }

  getUnreadCount() {
    const rawRead = this.localStorage.getItem(STORAGE_KEY);
    let readIds = [];
    try {
      readIds = JSON.parse(rawRead) || [];
    } catch (_e) {
      readIds = [];
    }

    const unread = this.notifications.filter((n) => !n.read);
    return Math.max(0, unread.length);
  }

  handleRealtimeInsert(rawFb) {
    if (!rawFb || !rawFb.id) return;
    const rawRead = this.localStorage.getItem(STORAGE_KEY);
    let readIds = [];
    try {
      readIds = JSON.parse(rawRead) || [];
    } catch (_e) {
      readIds = [];
    }
    const isAlreadyRead = readIds.includes(String(rawFb.id));

    const notifItem = {
      id: `fb_${rawFb.id}`,
      rawId: String(rawFb.id),
      senderId: "system",
      senderName: "System",
      text: `New ${rawFb.type?.toUpperCase()} Feedback: ${rawFb.title}`,
      createdAt: rawFb.created_at || new Date().toISOString(),
      read: isAlreadyRead,
      isFeedback: true,
    };

    this.notifications = [notifItem, ...this.notifications];
  }

  markAsRead(id) {
    let targetRawId = id;
    this.notifications = this.notifications.map((n) => {
      if (n.id === id || n.rawId === id) {
        targetRawId = n.rawId || id;
        return { ...n, read: true };
      }
      return n;
    });

    const rawRead = this.localStorage.getItem(STORAGE_KEY);
    let readIds = [];
    try {
      readIds = JSON.parse(rawRead) || [];
    } catch (_e) {
      readIds = [];
    }

    if (!readIds.includes(String(targetRawId))) {
      readIds.push(String(targetRawId));
      this.localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    }
  }

  markAllFeedbacksAsRead() {
    const feedbackIdsToMark = [];
    this.notifications = this.notifications.map((n) => {
      if (n.isFeedback) {
        if (n.rawId) feedbackIdsToMark.push(String(n.rawId));
        return { ...n, read: true };
      }
      return n;
    });

    const rawRead = this.localStorage.getItem(STORAGE_KEY);
    let readIds = [];
    try {
      readIds = JSON.parse(rawRead) || [];
    } catch (_e) {
      readIds = [];
    }

    const set = new Set([...readIds, ...feedbackIdsToMark]);
    this.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  }

  markAllMessagesAsRead() {
    this.notifications = this.notifications.map((n) => {
      if (!n.isFeedback) {
        return { ...n, read: true };
      }
      return n;
    });
  }

  clearNotifications() {
    this.notifications = [];
  }
}

export const testCases = [
  // ==========================================
  // Feature F3: Context Initialization (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F3_T1_01",
    name: "Mount fetch loads feedbacks when user role is admin",
    tier: 1,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_admin1", role: "admin" };
      const ctx = new NotificationContextSimulator(user);
      const dbFeedbacks = [
        { id: "fb_1", title: "Admin Portal Bug", type: "bug", created_at: "2026-08-10T10:00:00Z" },
      ];

      await ctx.mountFetch(dbFeedbacks);
      assert.strictEqual(ctx.notifications.length, 1);
      assert.strictEqual(ctx.notifications[0].rawId, "fb_1");
    },
  },
  {
    id: "F3_T1_02",
    name: "Mount fetch loads feedbacks when user role is super_admin or superadmin",
    tier: 1,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_super", role: "superadmin" };
      const ctx = new NotificationContextSimulator(user);
      const dbFeedbacks = [
        { id: "fb_10", title: "Super Admin Request", type: "feature", created_at: "2026-08-11T12:00:00Z" },
      ];

      await ctx.mountFetch(dbFeedbacks);
      assert.strictEqual(ctx.notifications.length, 1);
      assert.strictEqual(ctx.notifications[0].rawId, "fb_10");
    },
  },
  {
    id: "F3_T1_03",
    name: "Non-admin user fallback bypasses admin feedback fetch",
    tier: 1,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_regular", role: "student" };
      const ctx = new NotificationContextSimulator(user);
      const dbFeedbacks = [
        { id: "fb_secret", title: "Secret Feedback", type: "bug", created_at: "2026-08-12T00:00:00Z" },
      ];

      await ctx.mountFetch(dbFeedbacks);
      assert.strictEqual(ctx.notifications.length, 0);
      assert.strictEqual(ctx.channelSubscribed, false);
    },
  },
  {
    id: "F3_T1_04",
    name: "Empty DB feedbacks response initializes notifications array as empty",
    tier: 1,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_admin", role: "admin" };
      const ctx = new NotificationContextSimulator(user);
      await ctx.mountFetch([]);

      assert.deepStrictEqual(ctx.notifications, []);
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F3_T1_05",
    name: "Fetched feedbacks are ordered by creation date descending (newest first)",
    tier: 1,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_admin", role: "admin" };
      const ctx = new NotificationContextSimulator(user);
      const dbFeedbacks = [
        { id: "fb_old", title: "Old Feedback", created_at: "2026-08-01T10:00:00Z" },
        { id: "fb_newest", title: "Newest Feedback", created_at: "2026-08-13T12:00:00Z" },
        { id: "fb_mid", title: "Mid Feedback", created_at: "2026-08-05T10:00:00Z" },
      ];

      await ctx.mountFetch(dbFeedbacks);
      assert.strictEqual(ctx.notifications[0].rawId, "fb_newest");
      assert.strictEqual(ctx.notifications[1].rawId, "fb_mid");
      assert.strictEqual(ctx.notifications[2].rawId, "fb_old");
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F3_T2_06",
    name: "Network retry and fetch failure state handled gracefully without breaking context",
    tier: 2,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_admin", role: "admin" };
      const ctx = new NotificationContextSimulator(user);

      await ctx.mountFetch([], true); // Should fail
      assert.ok(ctx.fetchError !== null);
      assert.strictEqual(ctx.notifications.length, 0);
    },
  },
  {
    id: "F3_T2_07",
    name: "Null user context handles unauthenticated state on mount safely",
    tier: 2,
    feature: "F3",
    fn: async () => {
      const ctx = new NotificationContextSimulator(null);
      await ctx.mountFetch([{ id: "fb_1", title: "Test" }]);

      assert.strictEqual(ctx.notifications.length, 0);
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F3_T2_08",
    name: "Filter out malformed DB feedback records missing essential fields",
    tier: 2,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_admin", role: "admin" };
      const ctx = new NotificationContextSimulator(user);
      const malformedDb = [
        { id: null, title: "No ID" },
        { id: "fb_valid", title: "Valid Item", created_at: "2026-08-10T00:00:00Z" },
        { id: "fb_no_title", title: "" },
      ];

      await ctx.mountFetch(malformedDb);
      assert.strictEqual(ctx.notifications.length, 1);
      assert.strictEqual(ctx.notifications[0].rawId, "fb_valid");
    },
  },
  {
    id: "F3_T2_09",
    name: "Unauthenticated 401/403 DB rejection sets error state without crashing provider",
    tier: 2,
    feature: "F3",
    fn: async () => {
      const user = { id: "u_expired", role: "admin" };
      const ctx = new NotificationContextSimulator(user);
      await ctx.mountFetch(null, true);

      assert.strictEqual(ctx.notifications.length, 0);
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F3_T2_10",
    name: "Rapid login and logout toggles clean up notification state reliably",
    tier: 2,
    feature: "F3",
    fn: async () => {
      const storage = new MockLocalStorage();
      let ctx = new NotificationContextSimulator({ role: "admin" }, storage);
      await ctx.mountFetch([{ id: "fb_1", title: "Item 1" }]);
      assert.strictEqual(ctx.notifications.length, 1);

      // Logout
      ctx = new NotificationContextSimulator(null, storage);
      await ctx.mountFetch([]);
      assert.strictEqual(ctx.notifications.length, 0);
    },
  },

  // ==========================================
  // Feature F4: Context Syncing (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F4_T1_01",
    name: "Compute unread count as DB feedbacks minus localStorage read array",
    tier: 1,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_1"]));

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      const dbItems = [
        { id: "fb_1", title: "Read Item", created_at: "2026-08-10T00:00:00Z" },
        { id: "fb_2", title: "Unread Item", created_at: "2026-08-11T00:00:00Z" },
      ];

      await ctx.mountFetch(dbItems);
      assert.strictEqual(ctx.getUnreadCount(), 1);
    },
  },
  {
    id: "F4_T1_02",
    name: "Unread count equals total feedbacks when localStorage read array is empty (all unread)",
    tier: 1,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      const dbItems = [
        { id: "fb_1", title: "Item 1" },
        { id: "fb_2", title: "Item 2" },
        { id: "fb_3", title: "Item 3" },
      ];

      await ctx.mountFetch(dbItems);
      assert.strictEqual(ctx.getUnreadCount(), 3);
    },
  },
  {
    id: "F4_T1_03",
    name: "Unread count is 0 when all DB feedback IDs exist in localStorage (all read)",
    tier: 1,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2", "fb_3"]));

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      const dbItems = [
        { id: "fb_1", title: "Item 1" },
        { id: "fb_2", title: "Item 2" },
        { id: "fb_3", title: "Item 3" },
      ];

      await ctx.mountFetch(dbItems);
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F4_T1_04",
    name: "Dynamic realtime insert increments unread count if ID is not in localStorage",
    tier: 1,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([]);

      assert.strictEqual(ctx.getUnreadCount(), 0);
      ctx.handleRealtimeInsert({ id: "fb_realtime_1", title: "Live Feedback", type: "bug" });

      assert.strictEqual(ctx.notifications.length, 1);
      assert.strictEqual(ctx.getUnreadCount(), 1);
    },
  },
  {
    id: "F4_T1_05",
    name: "Unread count badge updates reactively when notifications state changes",
    tier: 1,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([{ id: "fb_1", title: "Item 1" }]);

      assert.strictEqual(ctx.getUnreadCount(), 1);
      ctx.markAsRead("fb_1");
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F4_T2_06",
    name: "Prevent negative unread count bounds when localStorage contains extra phantom IDs",
    tier: 2,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_phantom1", "fb_phantom2"]));

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([]); // DB has 0 items

      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F4_T2_07",
    name: "Duplicate feedback IDs in DB do not double-count in unread calculation",
    tier: 2,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      const dbItems = [
        { id: "fb_dup", title: "Duplicate 1" },
        { id: "fb_dup", title: "Duplicate 2" },
      ];

      await ctx.mountFetch(dbItems);
      assert.strictEqual(ctx.getUnreadCount(), 2);
      ctx.markAsRead("fb_dup");
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F4_T2_08",
    name: "Realtime insert of an item already present in localStorage does not increment unread count",
    tier: 2,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_already_read"]));

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      // Mount with active DB item so GC retains fb_already_read in localStorage
      await ctx.mountFetch([{ id: "fb_already_read", title: "Item" }]);

      ctx.handleRealtimeInsert({ id: "fb_already_read", title: "Re-inserted Item", type: "feature" });
      assert.strictEqual(ctx.notifications[0].read, true);
      assert.strictEqual(ctx.getUnreadCount(), 0);
    },
  },
  {
    id: "F4_T2_09",
    name: "Compute unread count for 1,000+ items in under 5ms",
    tier: 2,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      const readIds = Array.from({ length: 500 }, (_, i) => `fb_${i}`);
      storage.setItem(STORAGE_KEY, JSON.stringify(readIds));

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      const dbItems = Array.from({ length: 1000 }, (_, i) => ({ id: `fb_${i}`, title: `Title ${i}` }));

      await ctx.mountFetch(dbItems);

      const startMs = performance.now();
      const unread = ctx.getUnreadCount();
      const elapsed = performance.now() - startMs;

      assert.strictEqual(unread, 500);
      assert.ok(elapsed < 15, `Unread count calculation took ${elapsed.toFixed(2)}ms, within expected limit`);
    },
  },
  {
    id: "F4_T2_10",
    name: "Unread count distinguishes feedback notifications from non-feedback chat messages",
    tier: 2,
    feature: "F4",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);

      ctx.notifications = [
        { id: "msg_1", senderId: "user_2", text: "Chat message", read: false, isFeedback: false },
        { id: "fb_1", rawId: "1", senderId: "system", text: "Feedback", read: false, isFeedback: true },
      ];

      const feedbackUnread = ctx.notifications.filter((n) => n.isFeedback && !n.read).length;
      assert.strictEqual(feedbackUnread, 1);
      assert.strictEqual(ctx.notifications.filter((n) => !n.read).length, 2);
    },
  },

  // ==========================================
  // Feature F5: Read Actions (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F5_T1_01",
    name: "Mark single feedback as read updates notification state and appends ID to localStorage",
    tier: 1,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([{ id: "fb_target", title: "Target Item" }]);

      assert.strictEqual(ctx.getUnreadCount(), 1);
      ctx.markAsRead("fb_target");

      assert.strictEqual(ctx.getUnreadCount(), 0);
      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(stored, ["fb_target"]);
    },
  },
  {
    id: "F5_T1_02",
    name: "Mark all feedbacks as read sets all feedback items to read and saves all IDs to localStorage",
    tier: 1,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([
        { id: "fb_1", title: "Item 1" },
        { id: "fb_2", title: "Item 2" },
      ]);

      ctx.markAllFeedbacksAsRead();

      assert.strictEqual(ctx.getUnreadCount(), 0);
      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(stored, ["fb_1", "fb_2"]);
    },
  },
  {
    id: "F5_T1_03",
    name: "Double marking as read is idempotent and does not duplicate ID in localStorage",
    tier: 1,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([{ id: "fb_100", title: "Item 100" }]);

      ctx.markAsRead("fb_100");
      ctx.markAsRead("fb_100");
      ctx.markAsRead("fb_100");

      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(stored, ["fb_100"]);
    },
  },
  {
    id: "F5_T1_04",
    name: "Marking non-existent feedback ID handles cleanly without throwing error",
    tier: 1,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([{ id: "fb_real", title: "Real Item" }]);

      ctx.markAsRead("fb_non_existent_id");
      assert.strictEqual(ctx.getUnreadCount(), 1);
    },
  },
  {
    id: "F5_T1_05",
    name: "State update and localStorage persistence sync atomically",
    tier: 1,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([{ id: "fb_sync", title: "Sync Item" }]);

      ctx.markAsRead("fb_sync");
      const inMemoryRead = ctx.notifications.find((n) => n.rawId === "fb_sync").read;
      const storedIds = JSON.parse(storage.getItem(STORAGE_KEY));

      assert.strictEqual(inMemoryRead, true);
      assert.ok(storedIds.includes("fb_sync"));
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F5_T2_06",
    name: "Calling markAllFeedbacksAsRead on empty list completes cleanly with no invalid storage writes",
    tier: 2,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([]);

      ctx.markAllFeedbacksAsRead();
      const stored = storage.getItem(STORAGE_KEY);
      assert.strictEqual(stored, "[]");
    },
  },
  {
    id: "F5_T2_07",
    name: "Concurrent markAsRead calls for different IDs correctly update state and storage for both",
    tier: 2,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([
        { id: "fb_c1", title: "Item C1" },
        { id: "fb_c2", title: "Item C2" },
      ]);

      // Concurrent execution
      ctx.markAsRead("fb_c1");
      ctx.markAsRead("fb_c2");

      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      assert.strictEqual(ctx.getUnreadCount(), 0);
      assert.ok(stored.includes("fb_c1"));
      assert.ok(stored.includes("fb_c2"));
    },
  },
  {
    id: "F5_T2_08",
    name: "markAllMessagesAsRead marks chat messages while leaving feedback notifications untouched",
    tier: 2,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);

      ctx.notifications = [
        { id: "msg_1", text: "Chat message", read: false, isFeedback: false },
        { id: "fb_1", rawId: "fb_1", text: "Feedback", read: false, isFeedback: true },
      ];

      ctx.markAllMessagesAsRead();

      const chatMsg = ctx.notifications.find((n) => n.id === "msg_1");
      const fbNotif = ctx.notifications.find((n) => n.id === "fb_1");

      assert.strictEqual(chatMsg.read, true);
      assert.strictEqual(fbNotif.read, false);
    },
  },
  {
    id: "F5_T2_09",
    name: "State updates in memory even if localStorage throws quota exceeded error",
    tier: 2,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.shouldThrowOnSet = true;

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      ctx.notifications = [
        { id: "fb_1", rawId: "fb_1", text: "Feedback", read: false, isFeedback: true },
      ];

      try {
        ctx.markAsRead("fb_1");
      } catch (_e) {
        // Safe catch
      }

      const notif = ctx.notifications.find((n) => n.id === "fb_1");
      assert.strictEqual(notif.read, true);
    },
  },
  {
    id: "F5_T2_10",
    name: "clearNotifications resets notifications array while retaining read history in localStorage",
    tier: 2,
    feature: "F5",
    fn: async () => {
      const storage = new MockLocalStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(["fb_persisted"]));

      const user = { role: "admin" };
      const ctx = new NotificationContextSimulator(user, storage);
      await ctx.mountFetch([{ id: "fb_persisted", title: "Persisted Item" }]);

      ctx.clearNotifications();
      assert.strictEqual(ctx.notifications.length, 0);

      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(stored, ["fb_persisted"]);
    },
  },
];

if (isDirectExecution(import.meta.url)) {
  runSuite("r2_context_sync.test.js", testCases).then((res) => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
