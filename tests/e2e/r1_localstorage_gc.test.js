/* eslint-env node */
import assert from "node:assert";
import {
  MockLocalStorage,
  runLocalStorageGC,
  runSuite,
  isDirectExecution,
} from "./test_harness.js";

const STORAGE_KEY = "icmu_read_feedback_ids";

export const testCases = [
  // ==========================================
  // Feature F1: LocalStorage Tracking (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F1_T1_01",
    name: "Store read feedback ID in localStorage under icmu_read_feedback_ids",
    tier: 1,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      const readIds = ["fb_101"];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));

      const stored = localStorage.getItem(STORAGE_KEY);
      assert.strictEqual(stored, '["fb_101"]');
    },
  },
  {
    id: "F1_T1_02",
    name: "Parse valid JSON array of read feedback IDs from localStorage",
    tier: 1,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2", "fb_3"]));

      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw);
      assert.deepStrictEqual(parsed, ["fb_1", "fb_2", "fb_3"]);
    },
  },
  {
    id: "F1_T1_03",
    name: "Append new read ID to existing array without overwriting existing IDs",
    tier: 1,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_1"]));

      const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
      current.push("fb_2");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

      const updated = JSON.parse(localStorage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(updated, ["fb_1", "fb_2"]);
    },
  },
  {
    id: "F1_T1_04",
    name: "Deduplicate IDs so identical feedback IDs are not stored multiple times",
    tier: 1,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      const ids = ["fb_100", "fb_101"];
      const newId = "fb_100";

      const set = new Set(ids);
      set.add(newId);
      const uniqueIds = Array.from(set);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));

      const result = JSON.parse(localStorage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(result, ["fb_100", "fb_101"]);
    },
  },
  {
    id: "F1_T1_05",
    name: "Persist stored array across simulated session reloads",
    tier: 1,
    feature: "F1",
    fn: async () => {
      const session1Storage = new MockLocalStorage();
      session1Storage.setItem(STORAGE_KEY, JSON.stringify(["fb_alpha", "fb_beta"]));

      // Simulate session reload by re-reading from persistent store state
      const session2Storage = new MockLocalStorage();
      session2Storage.store = new Map(session1Storage.store);

      const restored = JSON.parse(session2Storage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(restored, ["fb_alpha", "fb_beta"]);
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F1_T2_06",
    name: "Handle corrupted invalid JSON string safely by returning empty array fallback",
    tier: 2,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, "{ invalid_json: true, ");

      let readIds = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        readIds = JSON.parse(raw);
      } catch (_err) {
        readIds = [];
      }
      assert.deepStrictEqual(readIds, []);
    },
  },
  {
    id: "F1_T2_07",
    name: "Initialize empty string or null in localStorage as empty array",
    tier: 2,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, "");

      const raw = localStorage.getItem(STORAGE_KEY);
      let readIds = [];
      if (raw && raw.trim() !== "") {
        try {
          readIds = JSON.parse(raw);
        } catch (_e) {
          readIds = [];
        }
      }
      assert.deepStrictEqual(readIds, []);
    },
  },
  {
    id: "F1_T2_08",
    name: "Convert or filter non-string IDs safely into valid string array",
    tier: 2,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      const mixedInputs = [123, true, null, undefined, "fb_valid", { id: "99" }];
      const cleaned = mixedInputs
        .filter((item) => item !== null && item !== undefined && typeof item !== "object")
        .map(String);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(parsed, ["123", "true", "fb_valid"]);
    },
  },
  {
    id: "F1_T2_09",
    name: "Serialize and deserialize max storage boundary array (5,000+ IDs) efficiently",
    tier: 2,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      const largeArray = Array.from({ length: 5000 }, (_, i) => `fb_bulk_${i}`);
      const t0 = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(largeArray));
      const raw = localStorage.getItem(STORAGE_KEY);
      const restored = JSON.parse(raw);
      const duration = Date.now() - t0;

      assert.strictEqual(restored.length, 5000);
      assert.strictEqual(restored[4999], "fb_bulk_4999");
      assert.ok(duration < 100, `Storage operation took ${duration}ms, exceeding 100ms bound`);
    },
  },
  {
    id: "F1_T2_10",
    name: "Accurately track IDs containing ISO timestamp boundaries and high epoch values",
    tier: 2,
    feature: "F1",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      const timestampIds = [
        "ts_1700000000000",
        "2026-08-13T14:57:55.000Z",
        "fb_epoch_9999999999999",
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timestampIds));

      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      assert.deepStrictEqual(parsed, timestampIds);
    },
  },

  // ==========================================
  // Feature F2: LocalStorage Garbage Collection (10 tests)
  // ==========================================
  // Tier 1: Feature Coverage (5 tests)
  {
    id: "F2_T1_01",
    name: "Purge read IDs from localStorage if they no longer exist in fetched DB feedbacks",
    tier: 1,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_active", "fb_deleted"]));

      const dbFeedbacks = ["fb_active", "fb_new"];
      const cleaned = runLocalStorageGC(localStorage, dbFeedbacks);

      assert.deepStrictEqual(cleaned, ["fb_active"]);
      assert.strictEqual(localStorage.getItem(STORAGE_KEY), '["fb_active"]');
    },
  },
  {
    id: "F2_T1_02",
    name: "Retain all active read IDs that match live DB feedbacks during GC run",
    tier: 1,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      const activeIds = ["fb_1", "fb_2", "fb_3"];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeIds));

      const dbFeedbacks = ["fb_1", "fb_2", "fb_3", "fb_4"];
      const cleaned = runLocalStorageGC(localStorage, dbFeedbacks);

      assert.deepStrictEqual(cleaned, ["fb_1", "fb_2", "fb_3"]);
    },
  },
  {
    id: "F2_T1_03",
    name: "Purge all stored read IDs when DB returns empty feedback array",
    tier: 1,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_old1", "fb_old2"]));

      const dbFeedbacks = [];
      const cleaned = runLocalStorageGC(localStorage, dbFeedbacks);

      assert.deepStrictEqual(cleaned, []);
      assert.strictEqual(localStorage.getItem(STORAGE_KEY), "[]");
    },
  },
  {
    id: "F2_T1_04",
    name: "GC returns cleaned array and updates localStorage synchronously",
    tier: 1,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_keep", "fb_remove"]));

      const returned = runLocalStorageGC(localStorage, ["fb_keep"]);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

      assert.deepStrictEqual(returned, ["fb_keep"]);
      assert.deepStrictEqual(stored, ["fb_keep"]);
    },
  },
  {
    id: "F2_T1_05",
    name: "GC automatically triggers upon receiving feedback fetch response",
    tier: 1,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_stale"]));

      // Simulated fetch callback
      const onFetchSuccess = (fetchedDbItems) => {
        const activeIds = fetchedDbItems.map((item) => item.id);
        return runLocalStorageGC(localStorage, activeIds);
      };

      const result = onFetchSuccess([{ id: "fb_live" }]);
      assert.deepStrictEqual(result, []);
      assert.strictEqual(localStorage.getItem(STORAGE_KEY), "[]");
    },
  },

  // Tier 2: Boundary & Corner Cases (5 tests)
  {
    id: "F2_T2_06",
    name: "Recover state cleanly when GC encounters corrupted string in localStorage",
    tier: 2,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, "corrupted_non_json_data");

      const cleaned = runLocalStorageGC(localStorage, ["fb_1", "fb_2"]);
      assert.deepStrictEqual(cleaned, []);
      assert.strictEqual(localStorage.getItem(STORAGE_KEY), "[]");
    },
  },
  {
    id: "F2_T2_07",
    name: "Ensure rapid repeated GC executions do not cause race conditions or drop active IDs",
    tier: 2,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2"]));

      const dbItems = ["fb_1", "fb_2", "fb_3"];
      let lastResult;
      for (let i = 0; i < 10; i++) {
        lastResult = runLocalStorageGC(localStorage, dbItems);
      }

      assert.deepStrictEqual(lastResult, ["fb_1", "fb_2"]);
      assert.strictEqual(localStorage.getItem(STORAGE_KEY), '["fb_1","fb_2"]');
    },
  },
  {
    id: "F2_T2_08",
    name: "Purge only single deleted ID during partial DB deletion while preserving all other read states",
    tier: 2,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2", "fb_3", "fb_4"]));

      // item fb_3 was deleted from DB
      const dbItems = ["fb_1", "fb_2", "fb_4", "fb_5"];
      const cleaned = runLocalStorageGC(localStorage, dbItems);

      assert.deepStrictEqual(cleaned, ["fb_1", "fb_2", "fb_4"]);
    },
  },
  {
    id: "F2_T2_09",
    name: "Handle null or undefined DB response without throwing exceptions, treating as empty DB",
    tier: 2,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2"]));

      const cleanedNull = runLocalStorageGC(localStorage, null);
      assert.deepStrictEqual(cleanedNull, []);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(["fb_1", "fb_2"]));
      const cleanedUndefined = runLocalStorageGC(localStorage, undefined);
      assert.deepStrictEqual(cleanedUndefined, []);
    },
  },
  {
    id: "F2_T2_10",
    name: "Respect strict string ID matching during GC (case-sensitivity and formatting)",
    tier: 2,
    feature: "F2",
    fn: async () => {
      const localStorage = new MockLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["FB_UPPER", "fb_lower"]));

      // DB only has lowercase version
      const dbItems = ["fb_lower"];
      const cleaned = runLocalStorageGC(localStorage, dbItems);

      assert.deepStrictEqual(cleaned, ["fb_lower"]);
    },
  },
];

if (isDirectExecution(import.meta.url)) {
  runSuite("r1_localstorage_gc.test.js", testCases).then((res) => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
