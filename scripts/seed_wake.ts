import crypto from "node:crypto";
import path from "node:path";
import { getDatabase, dbOps } from "../src/lib/db";
import { discoverDeaths } from "../src/lib/git/ingest";
import { generateObituary } from "../src/lib/ai/obituary";
import { detectAllHauntings } from "../src/lib/ghosts/hauntings";

async function seedWake() {
  const repoPath = process.cwd();
  const repoName = "Wake";
  const repoId = crypto.createHash("sha256").update(repoPath).digest("hex").substring(0, 16);

  console.log(`Scanning Wake repository at ${repoPath}...`);
  const db = getDatabase();

  // First upsert the repo record so foreign keys succeed
  dbOps.upsertRepo(db, {
    id: repoId,
    name: repoName,
    path: repoPath,
    last_scanned_at: new Date().toISOString(),
    death_count: 0,
    haunting_count: 0,
  });

  dbOps.clearRepoData(db, repoId);

  const deaths = await discoverDeaths(repoPath, repoId);
  console.log(`Discovered ${deaths.length} deaths in Wake:`, deaths.map((d) => d.path));

  for (const death of deaths) {
    dbOps.insertDeath(db, death);
    console.log(`Generating obituary for ${death.path}...`);
    const res = await generateObituary(death);
    dbOps.insertObituary(db, res.obituary);
    console.log(`Obituary generated (${res.source}): ${res.obituary.summary}`);
  }

  const hauntings = await detectAllHauntings(repoPath, deaths);
  console.log(`Detected ${hauntings.length} hauntings in Wake.`);
  for (const h of hauntings) {
    dbOps.insertHaunting(db, h);
    console.log(`- Ghost in ${h.file} line ${h.line}: ${h.snippet}`);
  }

  dbOps.upsertRepo(db, {
    id: repoId,
    name: repoName,
    path: repoPath,
    last_scanned_at: new Date().toISOString(),
    death_count: deaths.length,
    haunting_count: hauntings.length,
  });

  console.log("Seeding complete! Database populated with Wake's real history.");
}

seedWake().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
