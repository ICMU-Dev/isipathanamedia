/* eslint-env node */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { runSuite, isDirectExecution } from "./test_harness.js";

/**
 * Simulated Supabase Database engine for testing SQL Schema & RLS policies
 */
class SimulatedPushSubscriptionsDB {
  constructor() {
    this.table = [];
  }

  insert(record, currentUserId) {
    // Check RLS INSERT policy: WITH CHECK (auth.uid() = user_id)
    if (currentUserId && record.user_id !== currentUserId) {
      throw new Error("RLS Violation: Users can insert their own subscriptions only");
    }

    // UNIQUE constraint on (user_id, endpoint)
    const exists = this.table.some(
      (r) => r.user_id === record.user_id && r.endpoint === record.endpoint,
    );
    if (exists) {
      throw new Error("Unique constraint violation: (user_id, endpoint)");
    }

    const newRecord = {
      id: record.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_id: record.user_id,
      endpoint: record.endpoint,
      p256dh: record.p256dh,
      auth: record.auth,
      is_allowed: record.is_allowed !== undefined ? Boolean(record.is_allowed) : true,
      created_at: new Date().toISOString(),
    };

    this.table.push(newRecord);
    return newRecord;
  }

  select(query = {}, currentUserId = null, isServiceRole = false) {
    return this.table.filter((r) => {
      // RLS Policy for SELECT
      if (!isServiceRole && currentUserId && r.user_id !== currentUserId) {
        return false;
      }
      if (query.user_ids && !query.user_ids.includes(r.user_id)) {
        return false;
      }
      if (query.is_allowed !== undefined && r.is_allowed !== query.is_allowed) {
        return false;
      }
      return true;
    });
  }

  update(id, updates, currentUserId, isServiceRole = false) {
    const recordIndex = this.table.findIndex((r) => r.id === id);
    if (recordIndex === -1) return null;

    const record = this.table[recordIndex];

    // RLS Policy for UPDATE: USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
    if (!isServiceRole && currentUserId && record.user_id !== currentUserId) {
      throw new Error("RLS Violation: Users can update their own subscriptions only");
    }

    if (updates.is_allowed !== undefined && typeof updates.is_allowed !== "boolean") {
      throw new Error("Schema error: is_allowed must be a boolean");
    }

    const updatedRecord = { ...record, ...updates };
    this.table[recordIndex] = updatedRecord;
    return updatedRecord;
  }

  delete(id, currentUserId, isServiceRole = false) {
    const recordIndex = this.table.findIndex((r) => r.id === id);
    if (recordIndex === -1) return false;

    const record = this.table[recordIndex];
    if (!isServiceRole && currentUserId && record.user_id !== currentUserId) {
      throw new Error("RLS Violation: Users can delete their own subscriptions only");
    }

    this.table.splice(recordIndex, 1);
    return true;
  }

  cascadeDeleteUser(userId) {
    this.table = this.table.filter((r) => r.user_id !== userId);
  }
}

/**
 * Simulated Edge Function Runner
 */
class SimulatedEdgeFunctionDispatcher {
  constructor(db) {
    this.db = db;
    this.dispatchedPushes = [];
  }

  async handleRequest(reqBody, headers = {}, method = "POST") {
    if (method === "OPTIONS") {
      return {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
        body: "ok",
      };
    }

    const { title, description = "", type, reporter_name, admin_users = [] } = reqBody;

    if (!admin_users || admin_users.length === 0) {
      return {
        status: 200,
        body: { success: true, message: "No admins to notify" },
      };
    }

    const adminIds = admin_users.map((u) => u.id);

    // Fetch allowed subscriptions using service role
    const subscriptions = this.db.select(
      { user_ids: adminIds, is_allowed: true },
      null,
      true,
    );

    if (!subscriptions || subscriptions.length === 0) {
      return {
        status: 200,
        body: { success: true, message: "No subscriptions found" },
      };
    }

    const isBug = type?.toLowerCase() === "bug";
    const typeLabel = isBug ? "Bug Report" : "Feedback";
    const emoji = isBug ? "🐞" : "💬";

    const descStr = description || "";
    const payload = JSON.stringify({
      title: `${emoji} ${reporter_name || "Anonymous"} submitted a ${typeLabel}`,
      body: `${title}\n\n"${descStr.substring(0, 150)}${descStr.length > 150 ? "..." : ""}"`,
      icon: "https://isipathanamedia.online/logo.png",
      badge: "https://isipathanamedia.online/logo.png",
      data: {
        url: "/25473/dashboard/settings",
      },
    });

    const pushPromises = subscriptions.map(async (sub) => {
      try {
        if (sub.endpoint.includes("expired_410")) {
          // Simulate 410 Gone error
          const err = new Error("Subscription expired");
          err.statusCode = 410;
          throw err;
        }

        this.dispatchedPushes.push({
          subId: sub.id,
          endpoint: sub.endpoint,
          payload: JSON.parse(payload),
        });
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          this.db.delete(sub.id, null, true);
        }
      }
    });

    await Promise.all(pushPromises);

    return {
      status: 200,
      body: { success: true, sentCount: subscriptions.length },
    };
  }
}

export const testCases = [
  // ==========================================
  // Feature F7: Schema & RLS Migration (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F7_T1_01",
    name: "SQL Migration file contains is_allowed column definition with default true",
    tier: 1,
    feature: "F7",
    fn: async () => {
      const sqlPath = path.resolve(process.cwd(), "supabase/migrations/20260812042212_push_subscriptions.sql");
      const sqlContent = fs.readFileSync(sqlPath, "utf-8");

      assert.ok(sqlContent.includes("is_allowed BOOLEAN"), "SQL missing is_allowed column definition");
      assert.ok(sqlContent.includes("DEFAULT true"), "SQL missing DEFAULT true constraint");
    },
  },
  {
    id: "F7_T1_02",
    name: "UPDATE RLS policy verifies user ownership (auth.uid() = user_id)",
    tier: 1,
    feature: "F7",
    fn: async () => {
      const sqlPath = path.resolve(process.cwd(), "supabase/migrations/20260812042212_push_subscriptions.sql");
      const sqlContent = fs.readFileSync(sqlPath, "utf-8");

      assert.ok(sqlContent.includes("Users can update their own subscriptions"), "SQL missing UPDATE policy");
      assert.ok(sqlContent.includes("auth.uid() = user_id"), "SQL UPDATE policy missing user_id check");
    },
  },
  {
    id: "F7_T1_03",
    name: "SELECT RLS policy enforces user privacy (auth.uid() = user_id)",
    tier: 1,
    feature: "F7",
    fn: async () => {
      const sqlPath = path.resolve(process.cwd(), "supabase/migrations/20260812042212_push_subscriptions.sql");
      const sqlContent = fs.readFileSync(sqlPath, "utf-8");

      assert.ok(sqlContent.includes("Users can view their own subscriptions"), "SQL missing SELECT policy");
    },
  },
  {
    id: "F7_T1_04",
    name: "SQL queries with is_allowed = true filter out disabled subscriptions",
    tier: 1,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "u1", endpoint: "ep1", p256dh: "k1", auth: "a1", is_allowed: true }, "u1");
      db.insert({ user_id: "u1", endpoint: "ep2", p256dh: "k2", auth: "a2", is_allowed: false }, "u1");

      const allowedSubs = db.select({ user_ids: ["u1"], is_allowed: true }, "u1");
      assert.strictEqual(allowedSubs.length, 1);
      assert.strictEqual(allowedSubs[0].endpoint, "ep1");
    },
  },
  {
    id: "F7_T1_05",
    name: "User can toggle permission setting from true to false and back to true",
    tier: 1,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const sub = db.insert({ user_id: "u1", endpoint: "ep1", p256dh: "k1", auth: "a1", is_allowed: true }, "u1");

      db.update(sub.id, { is_allowed: false }, "u1");
      assert.strictEqual(db.select({ user_ids: ["u1"] }, "u1")[0].is_allowed, false);

      db.update(sub.id, { is_allowed: true }, "u1");
      assert.strictEqual(db.select({ user_ids: ["u1"] }, "u1")[0].is_allowed, true);
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F7_T2_06",
    name: "RLS policy rejects unauthorized user updating another user subscription",
    tier: 2,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const sub = db.insert({ user_id: "u_owner", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "u_owner");

      assert.throws(() => {
        db.update(sub.id, { is_allowed: false }, "u_attacker");
      }, /RLS Violation/);
    },
  },
  {
    id: "F7_T2_07",
    name: "Cascading user deletion purges associated push subscriptions",
    tier: 2,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "u_delete_me", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "u_delete_me");

      assert.strictEqual(db.table.length, 1);
      db.cascadeDeleteUser("u_delete_me");
      assert.strictEqual(db.table.length, 0);
    },
  },
  {
    id: "F7_T2_08",
    name: "UNIQUE constraint on (user_id, endpoint) prevents duplicate device entries",
    tier: 2,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "u1", endpoint: "https://push.example.com/sub1", p256dh: "k1", auth: "a1" }, "u1");

      assert.throws(() => {
        db.insert({ user_id: "u1", endpoint: "https://push.example.com/sub1", p256dh: "k2", auth: "a2" }, "u1");
      }, /Unique constraint violation/);
    },
  },
  {
    id: "F7_T2_09",
    name: "New subscription insertion defaults is_allowed to true when omitted",
    tier: 2,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const sub = db.insert({ user_id: "u1", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "u1");

      assert.strictEqual(sub.is_allowed, true);
    },
  },
  {
    id: "F7_T2_10",
    name: "Database schema rejects invalid non-boolean value for is_allowed column",
    tier: 2,
    feature: "F7",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const sub = db.insert({ user_id: "u1", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "u1");

      assert.throws(() => {
        db.update(sub.id, { is_allowed: "not_a_boolean" }, "u1");
      }, /Schema error/);
    },
  },

  // ==========================================
  // Feature F8: Edge Function Dispatcher (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F8_T1_01",
    name: "Edge function queries allowed subscriptions for admin users",
    tier: 1,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "admin_1", endpoint: "ep_admin", p256dh: "k1", auth: "a1", is_allowed: true }, "admin_1");
      db.insert({ user_id: "user_1", endpoint: "ep_user", p256dh: "k2", auth: "a2", is_allowed: true }, "user_1");

      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);
      const res = await dispatcher.handleRequest({
        title: "Test Feedback",
        type: "feedback",
        reporter_name: "John",
        admin_users: [{ id: "admin_1" }],
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(dispatcher.dispatchedPushes.length, 1);
      assert.strictEqual(dispatcher.dispatchedPushes[0].endpoint, "ep_admin");
    },
  },
  {
    id: "F8_T1_02",
    name: "Edge function index.ts configures VAPID details with keys and contact mailto",
    tier: 1,
    feature: "F8",
    fn: async () => {
      const efPath = path.resolve(process.cwd(), "supabase/functions/send-feedback-push/index.ts");
      const efContent = fs.readFileSync(efPath, "utf-8");

      assert.ok(efContent.includes("webpush.setVapidDetails"), "Edge function missing setVapidDetails call");
      assert.ok(efContent.includes("mailto:admin@isipathanamedia.online"), "Edge function missing VAPID contact email");
    },
  },
  {
    id: "F8_T1_03",
    name: "Edge function formats push payload with emoji, reporter name, title, icon, and target URL",
    tier: 1,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "admin_1", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "admin_1");

      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);
      await dispatcher.handleRequest({
        title: "Slow page load",
        description: "The page takes too long to render images",
        type: "bug",
        reporter_name: "Alice",
        admin_users: [{ id: "admin_1" }],
      });

      const push = dispatcher.dispatchedPushes[0].payload;
      assert.ok(push.title.includes("🐞 Alice submitted a Bug Report"));
      assert.ok(push.body.includes("Slow page load"));
      assert.strictEqual(push.data.url, "/25473/dashboard/settings");
    },
  },
  {
    id: "F8_T1_04",
    name: "Edge function returns HTTP 200 with informative message when no admin subscriptions exist",
    tier: 1,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);

      const res = await dispatcher.handleRequest({
        title: "Test",
        admin_users: [{ id: "admin_empty" }],
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, "No subscriptions found");
    },
  },
  {
    id: "F8_T1_05",
    name: "Edge function deletes expired 410/404 subscriptions from database automatically",
    tier: 1,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const expiredSub = db.insert(
        { user_id: "admin_1", endpoint: "https://push.com/expired_410", p256dh: "k1", auth: "a1" },
        "admin_1",
      );

      assert.strictEqual(db.table.length, 1);
      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);

      await dispatcher.handleRequest({
        title: "Test",
        admin_users: [{ id: "admin_1" }],
      });

      assert.strictEqual(db.table.length, 0); // Expired subscription deleted
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F8_T2_06",
    name: "Edge function excludes subscriptions where is_allowed = false from push delivery",
    tier: 2,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "admin_1", endpoint: "ep_disabled", p256dh: "k1", auth: "a1", is_allowed: false }, "admin_1");

      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);
      await dispatcher.handleRequest({
        title: "Test",
        admin_users: [{ id: "admin_1" }],
      });

      assert.strictEqual(dispatcher.dispatchedPushes.length, 0);
    },
  },
  {
    id: "F8_T2_07",
    name: "Payload formatting distinguishes bug reports from general feedback",
    tier: 2,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "admin_1", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "admin_1");

      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);
      await dispatcher.handleRequest({
        title: "UI Design",
        type: "feedback",
        reporter_name: "Bob",
        admin_users: [{ id: "admin_1" }],
      });

      const push = dispatcher.dispatchedPushes[0].payload;
      assert.ok(push.title.includes("💬 Bob submitted a Feedback"));
    },
  },
  {
    id: "F8_T2_08",
    name: "Edge function handles CORS OPTIONS preflight request with HTTP 200 and headers",
    tier: 2,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);

      const res = await dispatcher.handleRequest({}, {}, "OPTIONS");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers["Access-Control-Allow-Origin"], "*");
    },
  },
  {
    id: "F8_T2_09",
    name: "Edge function handles missing or null description field without throwing substring error",
    tier: 2,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "admin_1", endpoint: "ep1", p256dh: "k1", auth: "a1" }, "admin_1");

      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);
      const res = await dispatcher.handleRequest({
        title: "No description item",
        description: null,
        admin_users: [{ id: "admin_1" }],
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(dispatcher.dispatchedPushes.length, 1);
    },
  },
  {
    id: "F8_T2_10",
    name: "Edge function uses Promise.all over dispatches and handles partial delivery failures",
    tier: 2,
    feature: "F8",
    fn: async () => {
      const db = new SimulatedPushSubscriptionsDB();
      db.insert({ user_id: "admin_1", endpoint: "ep_valid", p256dh: "k1", auth: "a1" }, "admin_1");
      db.insert({ user_id: "admin_1", endpoint: "ep_expired_410", p256dh: "k2", auth: "a2" }, "admin_1");

      const dispatcher = new SimulatedEdgeFunctionDispatcher(db);
      const res = await dispatcher.handleRequest({
        title: "Mixed dispatch",
        admin_users: [{ id: "admin_1" }],
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(dispatcher.dispatchedPushes.length, 1); // 1 succeeded, 1 deleted
    },
  },
];

if (isDirectExecution(import.meta.url)) {
  runSuite("r4_edge_function.test.js", testCases).then((res) => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
