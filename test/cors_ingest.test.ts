import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { discoverDeaths } from "../src/lib/git/ingest";

describe("Real Repo Ingestion: fixtures/cors", () => {
  it("ingests expressjs/cors deletions with grounded evidence", async () => {
    const corsPath = path.resolve(process.cwd(), "fixtures", "cors");
    if (!fs.existsSync(corsPath)) {
      console.log("fixtures/cors does not exist, skipping real fixture test");
      return;
    }

    const deaths = await discoverDeaths(corsPath, "cors-demo", { maxDeaths: 10 });
    assert.ok(deaths.length > 0, "Should find deletions in cors");

    const paths = deaths.map((d) => d.path);
    console.log("Discovered deaths in cors:", paths);

    // Verify CONTRIBUTING.md was detected as dead
    const contributing = deaths.find((d) => d.path === "CONTRIBUTING.md");
    assert.ok(contributing, "CONTRIBUTING.md must be detected as dead");
    assert.equal(contributing.died_sha, "7e6f7eeac0c16d9abed2cb84ac4b2891a51fa3dc");
    assert.equal(contributing.last_words, "docs: revamp content (#374)");
    assert.equal(contributing.diff_stat.deletions, 33);
    assert.equal(contributing.authors.includes("Douglas Christopher Wilson"), true);

    // Verify test/cors.js was NOT detected as dead because it was renamed to test/test.js which is live!
    assert.ok(!paths.includes("test/cors.js"), "test/cors.js was renamed to test/test.js and must NOT be marked dead");
  });
});
