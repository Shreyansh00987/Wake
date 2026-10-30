import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getDatabase, dbOps } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const repoId = searchParams.get("repoId");
  const db = getDatabase();

  let targetRepoId = repoId;
  if (!targetRepoId) {
    const repos = dbOps.getAllRepos(db);
    if (repos.length > 0) {
      targetRepoId = repos[0].id;
    }
  }

  if (!targetRepoId) {
    const samplePath = path.join(process.cwd(), "samples", "wake.json");
    if (fs.existsSync(samplePath)) {
      try {
        const sampleData = JSON.parse(fs.readFileSync(samplePath, "utf8"));
        return NextResponse.json({ hauntings: sampleData.hauntings || [] });
      } catch {
        // Fall through
      }
    }
    return NextResponse.json({ hauntings: [] });
  }

  const hauntings = dbOps.getHauntingsForRepo(db, targetRepoId);
  return NextResponse.json({
    hauntings,
    repoId: targetRepoId,
    allRepos: dbOps.getAllRepos(db),
  });
}
