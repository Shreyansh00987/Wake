import fs from "node:fs";
import path from "node:path";
import { HauntingRecord, ExorciseDiff } from "@/types";

export function generateExorciseDiff(
  repoPath: string,
  haunting: HauntingRecord
): ExorciseDiff | null {
  const fullPath = path.join(repoPath, haunting.file);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(fullPath, "utf8");
  } catch {
    return null;
  }

  const lines = fileContent.split("\n");
  const targetIdx = haunting.line - 1; // 0-indexed

  if (targetIdx < 0 || targetIdx >= lines.length) {
    return null;
  }

  // Window of context: up to 3 lines before and 3 lines after
  const contextBefore = 3;
  const contextAfter = 3;

  const startIdx = Math.max(0, targetIdx - contextBefore);
  const endIdx = Math.min(lines.length - 1, targetIdx + contextAfter);

  const diffLines: string[] = [];
  const normalizedFile = haunting.file.replace(/\\/g, "/");

  diffLines.push(`--- a/${normalizedFile}`);
  diffLines.push(`+++ b/${normalizedFile}`);

  const oldStart = startIdx + 1;
  const oldCount = endIdx - startIdx + 1;
  const newStart = startIdx + 1;
  const newCount = oldCount - 1;

  diffLines.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);

  for (let i = startIdx; i <= endIdx; i++) {
    const lineText = lines[i].replace(/\r$/, "");
    if (i === targetIdx) {
      diffLines.push(`-${lineText}`);
    } else {
      diffLines.push(` ${lineText}`);
    }
  }

  return {
    death_id: haunting.death_id,
    target_file: normalizedFile,
    diff: diffLines.join("\n"),
    original_line: haunting.line,
    dead_reference: haunting.dead_symbol,
  };
}
