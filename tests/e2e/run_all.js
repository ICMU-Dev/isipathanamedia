/* eslint-env node */
import { runSuite } from "./test_harness.js";
import { testCases as r1Tests } from "./r1_localstorage_gc.test.js";
import { testCases as r2Tests } from "./r2_context_sync.test.js";
import { testCases as r3Tests } from "./r3_service_worker.test.js";
import { testCases as r4Tests } from "./r4_edge_function.test.js";
import { testCases as tier4Tests } from "./tier4_real_world.test.js";

async function main() {
  console.log("================================================================");
  console.log(" ICMU Web Feedback Notification & Web Push E2E Test Suite Runner");
  console.log("================================================================\n");

  const suites = [
    { name: "r1_localstorage_gc.test.js", tests: r1Tests },
    { name: "r2_context_sync.test.js", tests: r2Tests },
    { name: "r3_service_worker.test.js", tests: r3Tests },
    { name: "r4_edge_function.test.js", tests: r4Tests },
    { name: "tier4_real_world.test.js", tests: tier4Tests },
  ];

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const featureCounts = {};

  const suiteResults = [];

  for (const suite of suites) {
    const res = await runSuite(suite.name, suite.tests);
    suiteResults.push(res);
    totalTests += res.total;
    totalPassed += res.passed;
    totalFailed += res.failed;

    for (const r of res.results) {
      if (r.tier) tierCounts[r.tier] = (tierCounts[r.tier] || 0) + 1;
      if (r.feature) featureCounts[r.feature] = (featureCounts[r.feature] || 0) + 1;
    }
  }

  console.log("\n================================================================");
  console.log(" MASTER TEST RUNNER SUMMARY REPORT");
  console.log("=================================================================");
  console.log(`Total Test Suites Executed: ${suites.length}`);
  console.log(`Total Test Cases Executed : ${totalTests}`);
  console.log(`Total Passed              : ${totalPassed}`);
  console.log(`Total Failed              : ${totalFailed}`);

  console.log("\n--- Coverage by Tier ---");
  console.log(` Tier 1 (Feature Coverage)       : ${tierCounts[1]} tests (Minimum: 40)`);
  console.log(` Tier 2 (Boundary & Corner Cases): ${tierCounts[2]} tests (Minimum: 40)`);
  console.log(` Tier 3 (Cross-Feature Pairwise) : ${tierCounts[3]} tests (Minimum: 8)`);
  console.log(` Tier 4 (Real-World Scenarios)   : ${tierCounts[4]} tests (Minimum: 5)`);

  console.log("\n--- Coverage by Feature / Requirement ---");
  for (const [feat, count] of Object.entries(featureCounts)) {
    console.log(` ${feat.padEnd(12)} : ${count} tests`);
  }

  // Verification checks
  const MIN_REQUIRED_TESTS = 93;
  if (totalTests < MIN_REQUIRED_TESTS) {
    console.error(`\n[FAIL] Total test count ${totalTests} is below minimum requirement of ${MIN_REQUIRED_TESTS}`);
    process.exit(1);
  }

  if (totalFailed > 0) {
    console.error(`\n[FAIL] Test suite completed with ${totalFailed} failure(s).`);
    process.exit(1);
  }

  console.log(`\n[SUCCESS] ALL ${totalTests} TESTS PASSED CLEANLY! Exiting with code 0.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
