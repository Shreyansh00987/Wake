import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { verifyCitations } from "../src/lib/ai/verify";
import { generateTemplateObituary, inferTemplateCause } from "../src/lib/ai/template";
import { generateObituary } from "../src/lib/ai/obituary";
import { DeathRecord } from "../src/types";

const mockDeath: DeathRecord = {
  id: "death-101",
  repo_id: "repo-1",
  path: "src/old_parser.ts",
  born_sha: "1111111111111111111111111111111111111111",
  born_date: "2024-01-01T00:00:00Z",
  died_sha: "2222222222222222222222222222222222222222",
  died_date: "2024-06-01T00:00:00Z",
  lifespan_days: 152,
  last_words: "refactor: replace legacy parser with tree-sitter AST (#42)",
  diff_stat: { insertions: 0, deletions: 140 },
  authors: ["Alice Developer"],
  commit_history: [
    {
      sha: "2222222222222222222222222222222222222222",
      shortSha: "2222222",
      author: "Alice Developer",
      date: "2024-06-01T00:00:00Z",
      message: "refactor: replace legacy parser with tree-sitter AST (#42)",
    },
    {
      sha: "3333333333333333333333333333333333333333",
      shortSha: "3333333",
      author: "Alice Developer",
      date: "2024-03-01T00:00:00Z",
      message: "fix: parser edge case",
    },
    {
      sha: "1111111111111111111111111111111111111111",
      shortSha: "1111111",
      author: "Alice Developer",
      date: "2024-01-01T00:00:00Z",
      message: "feat: initial parser implementation",
    },
  ],
};

describe("Obituary Pipeline & Citation Verification", () => {
  it("approves valid candidate citing real SHAs from the context pack", () => {
    const candidate = {
      summary: "Removed legacy parser in favor of tree-sitter.",
      cause: "refactor" as const,
      confidence: 0.95,
      cites: ["2222222", "1111111111111111111111111111111111111111"],
    };

    const res = verifyCitations(candidate, mockDeath);
    assert.equal(res.valid, true);
    assert.deepEqual(res.normalizedCites, [
      "2222222222222222222222222222222222222222",
      "1111111111111111111111111111111111111111",
    ]);
  });

  it("STRICTLY REJECTS hallucinated SHAs not in the context pack", () => {
    const candidate = {
      summary: "Removed legacy parser.",
      cause: "refactor" as const,
      confidence: 0.9,
      cites: ["9999999999999999999999999999999999999999"], // Hallucination!
    };

    const res = verifyCitations(candidate, mockDeath);
    assert.equal(res.valid, false);
    assert.ok(res.reason?.includes("was not found in the verified commit history"));
  });

  it("rejects invalid causes and out-of-range confidence", () => {
    const badCause = {
      summary: "Removed legacy parser.",
      cause: "made_up_cause" as any,
      confidence: 0.9,
      cites: ["2222222"],
    };
    assert.equal(verifyCitations(badCause, mockDeath).valid, false);

    const badConfidence = {
      summary: "Removed legacy parser.",
      cause: "refactor" as const,
      confidence: 1.5, // > 1
      cites: ["2222222"],
    };
    assert.equal(verifyCitations(badConfidence, mockDeath).valid, false);
  });

  it("produces deterministic grounded template obituaries", () => {
    assert.equal(inferTemplateCause("refactor: clean up legacy code", "test.ts"), "refactor");
    assert.equal(inferTemplateCause("security: patch CVE-2024-1234", "auth.ts"), "security_fix");
    assert.equal(inferTemplateCause("chore: remove deprecated lodash dependency", "util.ts"), "dependency_removal");
    assert.equal(inferTemplateCause("docs: remove abandoned experiment", "poc.ts"), "abandoned_experiment");

    const template = generateTemplateObituary(mockDeath);
    assert.equal(template.is_template, true);
    assert.equal(template.cause, "refactor");
    assert.equal(template.cites[0], mockDeath.died_sha);
    assert.ok(template.summary.includes("tree-sitter"));
  });

  it("gracefully falls back to template obituary when model is unreachable", async () => {
    // Port 54321 is unreachable
    const res = await generateObituary(mockDeath, { host: "http://127.0.0.1:54321", timeoutMs: 500 });
    assert.equal(res.source, "template_fallback");
    assert.equal(res.obituary.is_template, true);
    assert.equal(res.obituary.cause, "refactor");
    assert.ok(res.rejectionReason);
  });
});
