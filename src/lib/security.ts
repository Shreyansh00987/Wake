import fs from "node:fs";
import path from "node:path";

export interface PathValidationResult {
  valid: boolean;
  resolvedPath?: string;
  error?: string;
}

export function validateRepoPath(targetPath?: string): PathValidationResult {
  if (!targetPath || targetPath.trim() === "") {
    return {
      valid: true,
      resolvedPath: process.cwd(),
    };
  }

  const clean = targetPath.trim();

  // Reject suspicious control characters or null bytes
  if (/[\0\r\n]/.test(clean)) {
    return { valid: false, error: "Invalid path: forbidden control characters detected." };
  }

  const resolved = path.resolve(clean);

  if (!fs.existsSync(resolved)) {
    return { valid: false, error: `Directory does not exist: "${resolved}"` };
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(resolved);
  } catch (err: any) {
    return { valid: false, error: `Unable to access path: ${err.message}` };
  }

  if (!stat.isDirectory()) {
    return { valid: false, error: `Path is not a directory: "${resolved}"` };
  }

  // Must contain a .git directory or file (for worktrees/submodules)
  const gitPath = path.join(resolved, ".git");
  if (!fs.existsSync(gitPath)) {
    return {
      valid: false,
      error: `Path is not a git repository (missing .git): "${resolved}"`,
    };
  }

  return {
    valid: true,
    resolvedPath: resolved,
  };
}
