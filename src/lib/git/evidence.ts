import { execGit } from "./exec";
import { DiffStat, CommitSummary } from "@/types";

export interface DeathEvidence {
  diffStat: DiffStat;
  authors: string[];
  firstVersionSnippet: string;
  finalDiff: string;
  commitHistory: CommitSummary[];
}

export async function extractEvidence(
  repoPath: string,
  filePath: string,
  bornSha: string,
  diedSha: string
): Promise<DeathEvidence> {
  // 1. Get diff stat of the deletion commit
  let diffStat: DiffStat = { insertions: 0, deletions: 0 };
  try {
    const { stdout } = await execGit(
      ["diff", "--numstat", `${diedSha}^`, diedSha, "--", filePath],
      { cwd: repoPath }
    );
    const line = stdout.trim().split("\n")[0];
    if (line) {
      const [ins, del] = line.split("\t");
      diffStat = {
        insertions: parseInt(ins, 10) || 0,
        deletions: parseInt(del, 10) || 0,
      };
    }
  } catch {
    // If diedSha is root commit or parent diff fails
  }

  // 2. Extract commit history and authors
  const commitHistory: CommitSummary[] = [];
  const authorsSet = new Set<string>();

  try {
    const { stdout } = await execGit(
      [
        "log",
        "--follow",
        "--format=%H|%at|%an|%s",
        "-n",
        "25",
        diedSha,
        "--",
        filePath,
      ],
      { cwd: repoPath }
    );

    const lines = stdout.trim().split("\n").filter(Boolean);
    for (const line of lines) {
      const parts = line.split("|");
      if (parts.length >= 4) {
        const sha = parts[0];
        const at = parseInt(parts[1], 10);
        const author = parts[2];
        const message = parts.slice(3).join("|");

        if (author) authorsSet.add(author);
        commitHistory.push({
          sha,
          shortSha: sha.substring(0, 7),
          author,
          date: new Date(at * 1000).toISOString(),
          message,
        });
      }
    }
  } catch {
    // Fallback if log --follow fails
  }

  // 3. Extract first version snippet (truncated to 80 lines / 4KB)
  let firstVersionSnippet = "";
  try {
    const { stdout } = await execGit(
      ["show", `${bornSha}:${filePath}`],
      { cwd: repoPath, maxBufferBytes: 1024 * 512 }
    );
    const lines = stdout.split("\n").slice(0, 80);
    firstVersionSnippet = lines.join("\n");
  } catch {
    // File might have been born under a different name or empty
  }

  // 4. Extract final deletion diff (truncated to 150 lines / 8KB)
  let finalDiff = "";
  try {
    const { stdout } = await execGit(
      ["diff", `${diedSha}^`, diedSha, "--", filePath],
      { cwd: repoPath, maxBufferBytes: 1024 * 512 }
    );
    const lines = stdout.split("\n").slice(0, 150);
    finalDiff = lines.join("\n");
  } catch {
    // Fallback
  }

  return {
    diffStat,
    authors: Array.from(authorsSet),
    firstVersionSnippet,
    finalDiff,
    commitHistory,
  };
}
