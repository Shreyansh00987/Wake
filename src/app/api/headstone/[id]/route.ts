import { NextRequest, NextResponse } from "next/server";
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

  if (!detail) {
    return NextResponse.json({ error: "Headstone not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
