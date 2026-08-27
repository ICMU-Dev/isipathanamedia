/* eslint-env node */
import assert from "node:assert";
import { fileURLToPath } from "node:url";

/**
 * Mock LocalStorage implementation conforming to Web Storage API
 */
export class MockLocalStorage {
  constructor() {
    this.store = new Map();
    this.shouldThrowOnSet = false;
  }

  getItem(key) {
    const val = this.store.get(String(key));
    return val !== undefined ? val : null;
  }

  setItem(key, value) {
    if (this.shouldThrowOnSet) {
      throw new Error("QuotaExceededError: DOM Exception 22");
    }
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }

  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  get length() {
    return this.store.size;
  }
}

/**
 * Garbage collection logic matching NotificationContext & LocalStorage specification
 */
export function runLocalStorageGC(localStorage, activeDbFeedbackIds) {
  const STORAGE_KEY = "icmu_read_feedback_ids";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  let readIds = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      readIds = parsed;
    }
  } catch (_e) {
    // Corrupted state: reset storage safely
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  if (!Array.isArray(activeDbFeedbackIds)) {
    activeDbFeedbackIds = [];
  }

  const activeSet = new Set(activeDbFeedbackIds.map(String));
  const cleanedIds = readIds.filter((id) => activeSet.has(String(id)));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedIds));
  return cleanedIds;
}

/**
 * Mock Service Worker Scope matching public/sw.js execution environment
 */
export class MockServiceWorkerScope {
  constructor(origin = "https://isipathanamedia.online") {
    this.origin = origin;
    this.listeners = new Map();
    this.notificationsShown = [];
    this.openClients = [];

    this.self = {
      location: { origin: this.origin },
      addEventListener: (event, handler) => {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
      },
      skipWaiting: () => Promise.resolve(),
      registration: {
        showNotification: async (title, options) => {
          const record = { title, options, closed: false };
          this.notificationsShown.push(record);
          return record;
        },
      },
      clients: {
        claim: () => Promise.resolve(),
        matchAll: async (options = {}) => {
          return this.openClients;
        },
        openWindow: async (url) => {
          const newClient = {
            url,
            focused: true,
            focus: async function () {
              this.focused = true;
              return this;
            },
            navigate: async function (newUrl) {
              this.url = newUrl;
              return this;
            },
          };
          this.openClients.push(newClient);
          return newClient;
        },
      },
    };
  }

  async triggerPush(eventData) {
    const handlers = this.listeners.get("push") || [];
    const event = {
      data: eventData
        ? {
            json: () =>
              typeof eventData === "object"
                ? eventData
                : JSON.parse(eventData),
            text: () =>
              typeof eventData === "string"
                ? eventData
                : JSON.stringify(eventData),
          }
        : null,
      waitUntil: (promise) => promise,
    };

    for (const handler of handlers) {
      await handler(event);
    }
  }

  async triggerNotificationClick(notificationData) {
    const handlers = this.listeners.get("notificationclick") || [];
    let closed = false;
    const event = {
      notification: {
        data: notificationData,
        close: () => {
          closed = true;
        },
      },
      waitUntil: (promise) => promise,
    };

    for (const handler of handlers) {
      await handler(event);
    }
    return { closed };
  }
}

/**
 * Lightweight test suite runner
 */
export async function runSuite(suiteName, testCases) {
  console.log(`\n========================================`);
  console.log(` Running Suite: ${suiteName}`);
  console.log(`========================================`);

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const tc of testCases) {
    const startTime = Date.now();
    try {
      await tc.fn();
      const duration = Date.now() - startTime;
      results.push({
        id: tc.id,
        name: tc.name,
        tier: tc.tier,
        feature: tc.feature,
        status: "PASSED",
        duration,
      });
      passedCount++;
      console.log(`  [PASS] ${tc.id}: ${tc.name} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - startTime;
      results.push({
        id: tc.id,
        name: tc.name,
        tier: tc.tier,
        feature: tc.feature,
        status: "FAILED",
        error: err.message,
        duration,
      });
      failedCount++;
      console.log(`  [FAIL] ${tc.id}: ${tc.name}`);
      console.log(`         Error: ${err.message}`);
    }
  }

  console.log(`\nSummary for ${suiteName}: ${passedCount} Passed, ${failedCount} Failed (Total ${testCases.length})`);
  return {
    suiteName,
    total: testCases.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

export function isDirectExecution(importMetaUrl) {
  if (!process.argv[1]) return false;
  try {
    return process.argv[1] === fileURLToPath(importMetaUrl);
  } catch (_e) {
    return false;
  }
}
