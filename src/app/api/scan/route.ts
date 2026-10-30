import crypto from "node:crypto";
import path from "node:path";
import { getDatabase, dbOps } from "@/lib/db";
import { validateRepoPath } from "@/lib/security";
import { discoverDeaths } from "@/lib/git/ingest";
import { generateObituary } from "@/lib/ai/obituary";
import { detectAllHauntings } from "@/lib/ghosts/hauntings";
import { ScanProgress } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // default to empty
  }

  const pathValidation = validateRepoPath(body.repoPath);
  if (!pathValidation.valid || !pathValidation.resolvedPath) {
    return new Response(
      JSON.stringify({ error: pathValidation.error || "Invalid repository path" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const resolvedPath = pathValidation.resolvedPath;
  const repoName = path.basename(resolvedPath) || "Wake";
  const repoId = crypto
    .createHash("sha256")
    .update(resolvedPath)
    .digest("hex")
    .substring(0, 16);

  const db = getDatabase();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function sendEvent(progress: ScanProgress) {
        try {
          const payload = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream might be closed by client
        }
      }

      try {
        sendEvent({
          stage: "discovering",
          message: `Inspecting ${repoName} git tree and commit history...`,
          current: 0,
          total: 0,
        });

        // Ensure repo row exists before child rows are inserted
        dbOps.upsertRepo(db, {
          id: repoId,
          name: repoName,
          path: resolvedPath,
          last_scanned_at: new Date().toISOString(),
          death_count: 0,
          haunting_count: 0,
        });

        // Clear previous scan data for this repo to avoid stale records
        dbOps.clearRepoData(db, repoId);

        // 1. Discover deleted files with rename tracking
        const deaths = await discoverDeaths(resolvedPath, repoId, {
          onProgress: sendEvent,
        });

        // Persist deaths
        for (const death of deaths) {
          dbOps.insertDeath(db, death);
        }

        // 2. Generate Grounded Obituaries
        const totalDeaths = deaths.length;
        for (let i = 0; i < totalDeaths; i++) {
          const death = deaths[i];
          sendEvent({
            stage: "generating_obituaries",
            message: `Writing obituary for ${death.path} (${i + 1}/${totalDeaths})`,
            current: i + 1,
            total: totalDeaths,
            record: death,
          });

          const res = await generateObituary(death);
          dbOps.insertObituary(db, res.obituary);
        }

        // 3. Detect Hauntings (Ghosts)
        const hauntings = await detectAllHauntings(resolvedPath, deaths, sendEvent);

        for (const haunting of hauntings) {
          dbOps.insertHaunting(db, haunting);
        }

        // Update repo stats
        dbOps.upsertRepo(db, {
          id: repoId,
          name: repoName,
          path: resolvedPath,
          last_scanned_at: new Date().toISOString(),
          death_count: deaths.length,
          haunting_count: hauntings.length,
        });

        sendEvent({
          stage: "complete",
          message: `Scan complete: ${deaths.length} deaths archived, ${hauntings.length} ghosts detected.`,
          current: deaths.length,
          total: deaths.length,
        });

        controller.close();
      } catch (err: any) {
        sendEvent({
          stage: "error",
          message: err?.message || "An unexpected error occurred during scan",
          current: 0,
          total: 0,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
