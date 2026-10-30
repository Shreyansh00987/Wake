import { NextRequest, NextResponse } from "next/server";
import { getDatabase, dbOps } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const repoId = searchParams.get("repoId");
  const db = getDatabase();

  let repo = null;
  if (repoId) {
    repo = dbOps.getRepo(db, repoId);
  } else {
    const all = dbOps.getAllRepos(db);
    if (all.length > 0) {
      repo = all[0];
    }
  }

  if (!repo) {
    return NextResponse.json({ repo: null, deaths: [] });
  }

  const rawDeaths = dbOps.getDeathsForRepo(db, repo.id);
  const hauntings = dbOps.getHauntingsForRepo(db, repo.id);

  // Group hauntings by death_id
  const hauntingsCountMap = new Map<string, number>();
  for (const h of hauntings) {
    hauntingsCountMap.set(h.death_id, (hauntingsCountMap.get(h.death_id) || 0) + 1);
  }

  const deathsWithDetails = rawDeaths.map((death) => {
    const obit = dbOps.getObituary(db, death.id) || {
      id: `fallback-${death.id}`,
      death_id: death.id,
      summary: `Removed ${death.path} after ${death.lifespan_days} days.`,
      cause: "unknown" as const,
      confidence: 1.0,
      cites: [death.died_sha],
      is_template: true,
      created_at: death.died_date,
    };

    return {
      ...death,
      obituary: obit,
      hauntingCount: hauntingsCountMap.get(death.id) || 0,
    };
  });

  return NextResponse.json({
    repo,
    deaths: deathsWithDetails,
  });
}
