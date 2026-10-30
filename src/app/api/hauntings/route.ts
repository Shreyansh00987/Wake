import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ hauntings: [] });
  }

  const hauntings = dbOps.getHauntingsForRepo(db, targetRepoId);
  return NextResponse.json({ hauntings });
}
