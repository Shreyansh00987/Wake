import crypto from "node:crypto";
import { execGit } from "./exec";
import { extractEvidence } from "./evidence";
import { DeathRecord, ScanProgress } from "@/types";

export interface IngestOptions {
  maxDeaths?: number;
  onProgress?: (progress: ScanProgress) => void;
}

interface RawCommit {
  sha: string;
  timestamp: number;
  author: string;
  subject: string;
  actions: Array<
    | { type: "D"; path: string }
    | { type: "A"; path: string }
    | { type: "M"; path: string }
    | { type: "R"; oldPath: string; newPath: string; score: number }
  >;
}

export async function getLiveFiles(repoPath: string): Promise<Set<string>> {
  try {
    const { stdout } = await execGit(["ls-files"], {
      cwd: repoPath,
      maxBufferBytes: 50 * 1024 * 1024,
    });
    const files = stdout
      .split("\n")
      .map((f) => f.trim().replace(/\\/g, "/"))
      .filter(Boolean);
    return new Set(files);
  } catch (err) {
    throw new Error(
      `Failed to list files in repo at "${repoPath}". Ensure it is a valid git repository.`
    );
  }
}

export async function discoverDeaths(
  repoPath: string,
  repoId: string,
  options?: IngestOptions
): Promise<DeathRecord[]> {
  const maxDeaths = options?.maxDeaths ?? parseInt(process.env.MAX_DEATHS_CAP || "50", 10);
  const onProgress = options?.onProgress;

  onProgress?.({
    stage: "discovering",
    message: "Inspecting live tree and git history with rename tracking...",
    current: 0,
    total: 0,
  });

  // 1. Identify all currently surviving files
  const liveFiles = await getLiveFiles(repoPath);

  // 2. Read git history with -M rename detection
  const { stdout: logOutput } = await execGit(
    [
      "log",
      "-M",
      "--name-status",
      "--format=---WAKE_COMMIT---%n%H%n%at%n%an%n%s",
      "HEAD",
    ],
    {
      cwd: repoPath,
      maxBufferBytes: 100 * 1024 * 1024,
    }
  );

  // Parse raw commits
  const rawCommits: RawCommit[] = [];
  const commitBlocks = logOutput.split("---WAKE_COMMIT---\n").filter(Boolean);

  for (const block of commitBlocks) {
    const lines = block.split("\n");
    if (lines.length < 4) continue;

    const sha = lines[0].trim();
    const timestamp = parseInt(lines[1].trim(), 10) || 0;
    const author = lines[2].trim();
    const subject = lines[3].trim();
    const actions: RawCommit["actions"] = [];

    for (let i = 4; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split("\t");
      const code = parts[0];

      if (code === "D" && parts[1]) {
        actions.push({ type: "D", path: parts[1].replace(/\\/g, "/") });
      } else if (code === "A" && parts[1]) {
        actions.push({ type: "A", path: parts[1].replace(/\\/g, "/") });
      } else if (code === "M" && parts[1]) {
        actions.push({ type: "M", path: parts[1].replace(/\\/g, "/") });
      } else if (code.startsWith("R") && parts[1] && parts[2]) {
        const score = parseInt(code.substring(1), 10) || 100;
        actions.push({
          type: "R",
          oldPath: parts[1].replace(/\\/g, "/"),
          newPath: parts[2].replace(/\\/g, "/"),
          score,
        });
      }
    }

    rawCommits.push({ sha, timestamp, author, subject, actions });
  }

  // Track surviving lineages and rename graphs
  // If oldPath was renamed to newPath, and newPath is live or survives, oldPath didn't die!
  const renameForwardMap = new Map<string, string>();
  for (const commit of rawCommits) {
    for (const act of commit.actions) {
      if (act.type === "R") {
        renameForwardMap.set(act.oldPath, act.newPath);
      }
    }
  }

  function isPathOrLineageLive(path: string): boolean {
    let curr: string | undefined = path;
    const visited = new Set<string>();
    while (curr && !visited.has(curr)) {
      if (liveFiles.has(curr)) return true;
      visited.add(curr);
      curr = renameForwardMap.get(curr);
    }
    return false;
  }

  interface CandidateDeath {
    path: string;
    diedSha: string;
    diedTimestamp: number;
    diedAuthor: string;
    lastWords: string;
    bornSha?: string;
    bornTimestamp?: number;
  }

  const deadCandidates = new Map<string, CandidateDeath>();

  // Process commits from newest to oldest
  for (const commit of rawCommits) {
    for (const act of commit.actions) {
      if (act.type === "D") {
        const p = act.path;
        if (!isPathOrLineageLive(p) && !deadCandidates.has(p)) {
          deadCandidates.set(p, {
            path: p,
            diedSha: commit.sha,
            diedTimestamp: commit.timestamp,
            diedAuthor: commit.author,
            lastWords: commit.subject,
          });
        }
      } else if (act.type === "A") {
        const p = act.path;
        const candidate = deadCandidates.get(p);
        if (candidate && !candidate.bornSha) {
          candidate.bornSha = commit.sha;
          candidate.bornTimestamp = commit.timestamp;
        }
      }
    }
  }

  // Sort candidates by death timestamp (most recent deaths first)
  const sortedCandidates = Array.from(deadCandidates.values())
    .sort((a, b) => b.diedTimestamp - a.diedTimestamp)
    .slice(0, maxDeaths);

  const total = sortedCandidates.length;
  const results: DeathRecord[] = [];

  for (let idx = 0; idx < sortedCandidates.length; idx++) {
    const candidate = sortedCandidates[idx];
    onProgress?.({
      stage: "extracting_evidence",
      message: `Extracting evidence for ${candidate.path} (${idx + 1}/${total})`,
      current: idx + 1,
      total,
    });

    let bornSha = candidate.bornSha;
    let bornTimestamp = candidate.bornTimestamp;

    // If birth commit was not reached in top commits, use git log --follow
    if (!bornSha || !bornTimestamp) {
      try {
        const { stdout: followLog } = await execGit(
          [
            "log",
            "--follow",
            "--format=%H|%at|%an|%s",
            `${candidate.diedSha}^`,
            "--",
            candidate.path,
          ],
          { cwd: repoPath }
        );
        const followLines = followLog.trim().split("\n").filter(Boolean);
        if (followLines.length > 0) {
          const earliest = followLines[followLines.length - 1].split("|");
          bornSha = earliest[0];
          bornTimestamp = parseInt(earliest[1], 10) || candidate.diedTimestamp;
        }
      } catch {
        // Fallback to diedSha if earliest couldn't be reached
      }
    }

    if (!bornSha) bornSha = candidate.diedSha;
    if (!bornTimestamp) bornTimestamp = candidate.diedTimestamp;

    const bornDate = new Date(bornTimestamp * 1000).toISOString();
    const diedDate = new Date(candidate.diedTimestamp * 1000).toISOString();
    const lifespanDays = Math.max(
      0,
      Math.round((candidate.diedTimestamp - bornTimestamp) / 86400)
    );

    const evidence = await extractEvidence(
      repoPath,
      candidate.path,
      bornSha,
      candidate.diedSha
    );

    const deathId = crypto
      .createHash("sha256")
      .update(`${repoId}:${candidate.path}:${candidate.diedSha}`)
      .digest("hex")
      .substring(0, 16);

    const deathRecord: DeathRecord = {
      id: deathId,
      repo_id: repoId,
      path: candidate.path,
      born_sha: bornSha,
      born_date: bornDate,
      died_sha: candidate.diedSha,
      died_date: diedDate,
      lifespan_days: lifespanDays,
      last_words: candidate.lastWords,
      diff_stat: evidence.diffStat,
      authors: evidence.authors.length > 0 ? evidence.authors : [candidate.diedAuthor],
      first_version_snippet: evidence.firstVersionSnippet,
      final_diff: evidence.finalDiff,
      commit_history: evidence.commitHistory,
    };

    results.push(deathRecord);
  }

  return results;
}
