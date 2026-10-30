import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { discoverDeaths } from "../src/lib/git/ingest";
import { getDatabase, dbOps, closeDatabase } from "../src/lib/db";

describe("Git Ingestion & Evidence Layer", () => {
  let tempDir: string;
  let repoPath: string;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wake-test-fixture-"));
    repoPath = path.join(tempDir, "test-repo");
    fs.mkdirSync(repoPath, { recursive: true });

    function git(...args: string[]) {
      execFileSync("git", args, { cwd: repoPath, env: { ...process.env, GIT_AUTHOR_NAME: "Ghost Hunter", GIT_AUTHOR_EMAIL: "ghost@wake.local", GIT_COMMITTER_NAME: "Ghost Hunter", GIT_COMMITTER_EMAIL: "ghost@wake.local" } });
    }

    // 1. git init
    git("init", "-b", "main");
    git("config", "user.name", "Ghost Hunter");
    git("config", "user.email", "ghost@wake.local");

    // Commit 1: Initial files
    // File 1: will be deleted (dead_module.ts)
    fs.writeFileSync(path.join(repoPath, "dead_module.ts"), "export const oldFeature = 'sunset';\n");
    // File 2: will be renamed (renamed_src.ts -> renamed_dest.ts)
    fs.writeFileSync(path.join(repoPath, "renamed_src.ts"), "export const survivor = true;\n");
    // File 3: will be deleted and resurrected (phoenix.ts)
    fs.writeFileSync(path.join(repoPath, "phoenix.ts"), "export const phoenix = 'v1';\n");
    // File 4: will stay alive throughout (keeper.ts)
    fs.writeFileSync(path.join(repoPath, "keeper.ts"), "export const keeper = true;\n");
    // File 5: will be renamed then deleted (chain_orig.ts -> chain_dest.ts -> deleted)
    fs.writeFileSync(path.join(repoPath, "chain_orig.ts"), "export const chain = 'legacy';\n");

    git("add", "-A");
    git("commit", "-m", "chore: initial commit with baseline modules");

    // Commit 2: Rename renamed_src.ts -> renamed_dest.ts, and rename chain_orig.ts -> chain_dest.ts
    git("mv", "renamed_src.ts", "renamed_dest.ts");
    git("mv", "chain_orig.ts", "chain_dest.ts");
    git("commit", "-m", "refactor: rename modules for v2 hierarchy");

    // Commit 3: Delete dead_module.ts and delete phoenix.ts
    git("rm", "dead_module.ts");
    git("rm", "phoenix.ts");
    git("commit", "-m", "feat: remove deprecated dead_module and phoenix v1");

    // Commit 4: Delete chain_dest.ts (which was renamed from chain_orig.ts)
    git("rm", "chain_dest.ts");
    git("commit", "-m", "chore: remove chain_dest completely");

    // Commit 5: Resurrect phoenix.ts!
    fs.writeFileSync(path.join(repoPath, "phoenix.ts"), "export const phoenix = 'v2 risen';\n");
    git("add", "phoenix.ts");
    git("commit", "-m", "feat: resurrect phoenix module in v2 format");
  });

  after(() => {
    closeDatabase();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error on windows locks
    }
  });

  it("accurately discovers genuine deleted files while ignoring renames and resurrected files", async () => {
    const deaths = await discoverDeaths(repoPath, "test-repo-01");

    const deadPaths = deaths.map((d) => d.path);

    // Assertions:
    // 1. dead_module.ts MUST be detected as dead
    assert.ok(deadPaths.includes("dead_module.ts"), "dead_module.ts must be detected as dead");

    // 2. chain_dest.ts (renamed from chain_orig.ts then deleted) MUST be detected as dead
    assert.ok(deadPaths.includes("chain_dest.ts"), "chain_dest.ts must be detected as dead");

    // 3. renamed_src.ts MUST NOT be detected as dead (renamed to renamed_dest.ts which is alive)
    assert.ok(!deadPaths.includes("renamed_src.ts"), "renamed_src.ts must NOT be dead (it survived under new name)");
    assert.ok(!deadPaths.includes("renamed_dest.ts"), "renamed_dest.ts must NOT be dead (it is alive)");

    // 4. phoenix.ts MUST NOT be detected as dead (was resurrected and is alive at HEAD)
    assert.ok(!deadPaths.includes("phoenix.ts"), "phoenix.ts must NOT be dead (resurrected)");

    // 5. keeper.ts MUST NOT be detected as dead
    assert.ok(!deadPaths.includes("keeper.ts"), "keeper.ts must NOT be dead");

    assert.equal(deaths.length, 2, "Exactly 2 deaths should be detected (dead_module.ts and chain_dest.ts)");
  });

  it("extracts grounded evidence without hallucination", async () => {
    const deaths = await discoverDeaths(repoPath, "test-repo-01");
    const deadModule = deaths.find((d) => d.path === "dead_module.ts")!;

    assert.ok(deadModule, "dead_module record must exist");
    assert.equal(deadModule.last_words, "feat: remove deprecated dead_module and phoenix v1");
    assert.ok(deadModule.born_sha, "born_sha must exist");
    assert.ok(deadModule.died_sha, "died_sha must exist");
    assert.notEqual(deadModule.born_sha, deadModule.died_sha);
    assert.equal(deadModule.authors[0], "Ghost Hunter");
    assert.ok(deadModule.diff_stat.deletions > 0, "Deletions diffstat should be > 0");
    assert.ok(deadModule.final_diff?.includes("export const oldFeature = 'sunset';"));
  });

  it("persists deaths cleanly in SQLite database", async () => {
    const db = getDatabase(":memory:");
    const deaths = await discoverDeaths(repoPath, "test-repo-01");

    dbOps.upsertRepo(db, {
      id: "test-repo-01",
      name: "Test Repo",
      path: repoPath,
      last_scanned_at: new Date().toISOString(),
      death_count: deaths.length,
      haunting_count: 0,
    });

    for (const death of deaths) {
      dbOps.insertDeath(db, death);
    }

    const fetchedDeaths = dbOps.getDeathsForRepo(db, "test-repo-01");
    assert.equal(fetchedDeaths.length, 2);
    assert.equal(fetchedDeaths[0].repo_id, "test-repo-01");
  });
});
