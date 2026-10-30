import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { detectHauntingsForDeath } from "../src/lib/ghosts/hauntings";
import { generateExorciseDiff } from "../src/lib/ghosts/exorcise";
import { DeathRecord } from "../src/types";

describe("Haunting Detector & Exorcise Diff Generator", () => {
  let tempDir: string;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wake-ghosts-test-"));

    // 1. Create active surviving files that contain ghost references
    // File A: README referencing deleted CONTRIBUTING.md
    fs.writeFileSync(
      path.join(tempDir, "README.md"),
      `# Project Alpha\n\nPlease read our [Guidelines](CONTRIBUTING.md) before submitting a PR.\nHappy hacking!`
    );

    // File B: Active source code importing dead legacy_auth.ts
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, "app.ts"),
      `import { authenticateUser } from "./legacy_auth";\n\nexport function startApp() {\n  authenticateUser();\n}\n`
    );

    // File C: Node modules folder with the same term (MUST be ignored)
    const vendorDir = path.join(tempDir, "node_modules", "some-dep");
    fs.mkdirSync(vendorDir, { recursive: true });
    fs.writeFileSync(
      path.join(vendorDir, "index.js"),
      `// Mentioning CONTRIBUTING.md inside node_modules must never trigger a haunting!\n`
    );

    // File D: Lockfile (MUST be ignored)
    fs.writeFileSync(
      path.join(tempDir, "package-lock.json"),
      `{"name": "legacy_auth", "version": "1.0.0"}\n`
    );
  });

  after(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error on windows locks
    }
  });

  it("detects genuine ghost references in documentation and source imports", async () => {
    const mockDeath: DeathRecord = {
      id: "death-contrib",
      repo_id: "test-repo",
      path: "CONTRIBUTING.md",
      born_sha: "aaaa111",
      born_date: "2023-01-01T00:00:00Z",
      died_sha: "bbbb222",
      died_date: "2024-01-01T00:00:00Z",
      lifespan_days: 365,
      last_words: "docs: delete obsolete contributing guide",
      diff_stat: { insertions: 0, deletions: 50 },
      authors: ["Alice"],
    };

    const hauntings = await detectHauntingsForDeath(tempDir, mockDeath);

    assert.ok(hauntings.length > 0, "Should detect at least one haunting");
    const readmeHaunting = hauntings.find((h) => h.file === "README.md");
    assert.ok(readmeHaunting, "README.md must be detected as haunted");
    assert.equal(readmeHaunting.line, 3);
    assert.ok(readmeHaunting.snippet.includes("CONTRIBUTING.md"));
    assert.ok(readmeHaunting.confidence >= 0.9);

    // Ensure node_modules was ignored
    const nodeModulesHit = hauntings.find((h) => h.file.includes("node_modules"));
    assert.equal(nodeModulesHit, undefined, "node_modules hits must be ignored");
  });

  it("detects dead symbols and module import paths", async () => {
    const mockAuthDeath: DeathRecord = {
      id: "death-auth",
      repo_id: "test-repo",
      path: "src/legacy_auth.ts",
      born_sha: "cccc333",
      born_date: "2023-01-01T00:00:00Z",
      died_sha: "dddd444",
      died_date: "2024-01-01T00:00:00Z",
      lifespan_days: 365,
      last_words: "refactor: drop legacy auth module",
      diff_stat: { insertions: 0, deletions: 80 },
      authors: ["Bob"],
      first_version_snippet: "export function authenticateUser() { return true; }",
      final_diff: "-export function authenticateUser() { return true; }",
    };

    const hauntings = await detectHauntingsForDeath(tempDir, mockAuthDeath);
    assert.ok(hauntings.length > 0, "Should find hauntings for legacy_auth");

    const appHit = hauntings.find((h) => h.file === "src/app.ts");
    assert.ok(appHit, "src/app.ts must be detected as haunted");
    assert.ok(appHit.confidence >= 0.85);

    // Verify lockfile was ignored
    const lockHit = hauntings.find((h) => h.file.includes("package-lock.json"));
    assert.equal(lockHit, undefined, "package-lock.json must be ignored");
  });

  it("generates a clean copy-only unified diff without mutating the target file", () => {
    const mockHaunting = {
      id: "h1",
      repo_id: "test-repo",
      death_id: "death-contrib",
      dead_path: "CONTRIBUTING.md",
      dead_symbol: "CONTRIBUTING.md",
      file: "README.md",
      line: 3,
      snippet: "Please read our [Guidelines](CONTRIBUTING.md) before submitting a PR.",
      reason: "Surviving link in active documentation",
      confidence: 0.95,
    };

    const originalContent = fs.readFileSync(path.join(tempDir, "README.md"), "utf8");

    const diffResult = generateExorciseDiff(tempDir, mockHaunting);
    assert.ok(diffResult, "Diff must be generated");
    assert.ok(diffResult.diff.startsWith("--- a/README.md"));
    assert.ok(diffResult.diff.includes("+++ b/README.md"));
    assert.ok(diffResult.diff.includes("-Please read our [Guidelines](CONTRIBUTING.md) before submitting a PR."));

    // Ensure the original file was NOT modified (read-only guarantee)
    const afterContent = fs.readFileSync(path.join(tempDir, "README.md"), "utf8");
    assert.equal(originalContent, afterContent, "Exorcise MUST be read-only and never mutate files");
  });
});
