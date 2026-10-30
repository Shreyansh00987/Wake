import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getDatabase, dbOps } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deathId = params.id;
  if (!deathId) {
    return NextResponse.json({ error: "Missing death id" }, { status: 400 });
  }

  const db = getDatabase();
  const detail = dbOps.getHeadstoneDetail(db, deathId);

  if (detail) {
    return NextResponse.json(detail);
  }

  // Fallback to precomputed samples
  const sampleFiles = ["wake.json", "cors.json"];
  for (const file of sampleFiles) {
    const sPath = path.join(process.cwd(), "samples", file);
    if (fs.existsSync(sPath)) {
      try {
        const sample = JSON.parse(fs.readFileSync(sPath, "utf8"));
        const matchDeath = sample.deaths.find((d: any) => d.id === deathId);
        if (matchDeath) {
          const matchHauntings = (sample.hauntings || []).filter((h: any) => h.death_id === deathId);
          return NextResponse.json({
            death: matchDeath,
            obituary: matchDeath.obituary,
            hauntings: matchHauntings,
          });
        }
      } catch {
        // ignore
      }
    }
  }

  return NextResponse.json({ error: "Headstone not found" }, { status: 404 });
}
