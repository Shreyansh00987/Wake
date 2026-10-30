import path from "node:path";
import crypto from "node:crypto";
import { DeathRecord, HauntingRecord, ScanProgress } from "@/types";
import { runRipgrep, RgMatch } from "./ripgrep";

const GENERIC_TOKENS = new Set([
  "default",
  "index",
  "main",
  "data",
  "test",
  "tests",
  "file",
  "props",
  "state",
  "type",
  "item",
  "list",
  "name",
  "value",
  "config",
  "result",
  "options",
  "params",
  "error",
  "helper",
  "utils",
  "build",
  "setup",
  "start",
  "node",
  "true",
  "false",
  "null",
  "undefined",
]);

export function extractSearchTokens(death: DeathRecord): {
  exactFilename: string;
  stem: string;
  symbols: string[];
} {
  const parsed = path.posix.parse(death.path);
  const exactFilename = parsed.base;
  const stem = parsed.name;

  const symbolsSet = new Set<string>();

  // Extract from final deletion diff and first snippet
  const combinedText = `${death.final_diff || ""}\n${death.first_version_snippet || ""}`;

  // Regex for JS/TS exports: export const/function/class/type/interface/enum FOO
  const exportRegex =
    /(?:export\s+(?:default\s+)?(?:const|let|var|function\*?|class|type|interface|enum)\s+|exports\.([A-Za-z0-9_$]+)\s*=\s*)([A-Za-z0-9_$]+)/g;

  let match: RegExpExecArray | null;
  while ((match = exportRegex.exec(combinedText)) !== null) {
    const sym = match[1] || match[2];
    if (sym && sym.length >= 4 && !GENERIC_TOKENS.has(sym.toLowerCase())) {
      symbolsSet.add(sym);
    }
  }

  return {
    exactFilename,
    stem: stem.length >= 4 && !GENERIC_TOKENS.has(stem.toLowerCase()) ? stem : "",
    symbols: Array.from(symbolsSet).slice(0, 5), // up to 5 distinctive symbols
  };
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function detectHauntingsForDeath(
  repoPath: string,
  death: DeathRecord
): Promise<HauntingRecord[]> {
  const { exactFilename, stem, symbols } = extractSearchTokens(death);
  const hauntings: HauntingRecord[] = [];
  const seenKey = new Set<string>();

  function addMatch(
    match: RgMatch,
    deadSymbol: string,
    reason: string,
    confidence: number
  ) {
    // Avoid self-references (matches inside git history or same path)
    if (match.file === death.path) return;

    const key = `${match.file}:${match.line}:${deadSymbol}`;
    if (seenKey.has(key)) return;
    seenKey.add(key);

    const id = crypto
      .createHash("sha256")
      .update(`${death.id}:${match.file}:${match.line}:${deadSymbol}`)
      .digest("hex")
      .substring(0, 16);

    hauntings.push({
      id,
      repo_id: death.repo_id,
      death_id: death.id,
      dead_path: death.path,
      dead_symbol: deadSymbol,
      file: match.file,
      line: match.line,
      snippet: match.snippet,
      reason,
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  // 1. Search for exact filename (e.g. CONTRIBUTING.md, mocha.opts, legacy_auth.ts)
  if (exactFilename && exactFilename.length >= 4) {
    const filenamePattern = `\\b${escapeRegex(exactFilename)}\\b`;
    const matches = await runRipgrep(filenamePattern, { cwd: repoPath, maxMatches: 25 });

    for (const m of matches) {
      const lower = m.snippet.toLowerCase();
      let reason = `References deleted file "${exactFilename}"`;
      let confidence = 0.9;

      if (lower.includes("import ") || lower.includes("require(") || lower.includes("from ")) {
        reason = `Surviving import or module requirement of deleted file "${exactFilename}"`;
        confidence = 1.0;
      } else if (m.file.toLowerCase().includes("readme") || m.file.endsWith(".md")) {
        reason = `Surviving link or reference in active documentation "${m.file}"`;
        confidence = 0.95;
      } else if (m.file.toLowerCase().includes("package.json") || m.file.includes("config")) {
        reason = `Surviving configuration or script entry in "${m.file}"`;
        confidence = 0.95;
      }

      addMatch(m, exactFilename, reason, confidence);
    }
  }

  // 2. Search for stem in imports if distinct from exact filename (e.g. require('./legacy_auth'))
  if (stem && stem !== exactFilename) {
    const importPattern = `['"][^'"]*\\/${escapeRegex(stem)}['"]`;
    const matches = await runRipgrep(importPattern, { cwd: repoPath, maxMatches: 15 });

    for (const m of matches) {
      addMatch(
        m,
        stem,
        `Dangling import path resolving to deleted module "${death.path}"`,
        0.85
      );
    }
  }

  // 3. Search for distinctive exported symbols
  for (const sym of symbols) {
    const symPattern = `\\b${escapeRegex(sym)}\\b`;
    const matches = await runRipgrep(symPattern, { cwd: repoPath, maxMatches: 15 });

    for (const m of matches) {
      let confidence = 0.65;
      let reason = `References symbol "${sym}" defined in deleted ${death.path}`;

      if (m.snippet.includes("import ") || m.snippet.includes("require(")) {
        confidence = 0.85;
        reason = `Imports dead symbol "${sym}" from deleted ${death.path}`;
      }

      addMatch(m, sym, reason, confidence);
    }
  }

  // Sort by confidence descending
  return hauntings.sort((a, b) => b.confidence - a.confidence);
}

export async function detectAllHauntings(
  repoPath: string,
  deaths: DeathRecord[],
  onProgress?: (p: ScanProgress) => void
): Promise<HauntingRecord[]> {
  const allHauntings: HauntingRecord[] = [];
  const total = deaths.length;

  for (let i = 0; i < deaths.length; i++) {
    const death = deaths[i];
    onProgress?.({
      stage: "detecting_hauntings",
      message: `Detecting ghosts for ${death.path} (${i + 1}/${total})`,
      current: i + 1,
      total,
      record: death,
    });

    const hits = await detectHauntingsForDeath(repoPath, death);
    allHauntings.push(...hits);
  }

  return allHauntings;
}
