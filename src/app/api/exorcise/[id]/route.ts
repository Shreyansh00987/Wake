import { NextRequest, NextResponse } from "next/server";
import { getDatabase, dbOps } from "@/lib/db";
import { generateExorciseDiff } from "@/lib/ghosts/exorcise";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const hauntingId = params.id;
  if (!hauntingId) {
    return NextResponse.json({ error: "Missing haunting id" }, { status: 400 });
  }

  const db = getDatabase();
  // Find haunting by querying database
  const stmt = db.prepare(`SELECT * FROM hauntings WHERE id = ? LIMIT 1`);
  const r = stmt.get(hauntingId) as any;

  if (!r) {
    return NextResponse.json({ error: "Haunting not found" }, { status: 404 });
  }

  const repo = dbOps.getRepo(db, r.repo_id);
  if (!repo) {
    return NextResponse.json({ error: "Repository record not found" }, { status: 404 });
  }

  const haunting = {
    id: r.id,
    repo_id: r.repo_id,
    death_id: r.death_id,
    dead_path: r.dead_path,
    dead_symbol: r.dead_symbol,
    file: r.file,
    line: Number(r.line),
    snippet: r.snippet,
    reason: r.reason,
    confidence: Number(r.confidence),
  };

  const diffResult = generateExorciseDiff(repo.path, haunting);
  if (!diffResult) {
    return NextResponse.json(
      { error: "Could not generate diff. Target file may have moved or line was deleted." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    exorcism: diffResult,
  });
}
