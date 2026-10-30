import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getDatabase, dbOps } from "../src/lib/db";
import { discoverDeaths } from "../src/lib/git/ingest";
import { generateObituary } from "../src/lib/ai/obituary";
import { detectAllHauntings } from "../src/lib/ghosts/hauntings";
import { generateExorciseDiff } from "../src/lib/ghosts/exorcise";

async function exportSample(repoPath: string, repoName: string, outputFile: string) {
  const samplesDir = path.join(process.cwd(), "samples");
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  const repoId = crypto.createHash("sha256").update(repoPath).digest("hex").substring(0, 16);
  console.log(`Generating precomputed sample for ${repoName} (${repoPath})...`);

  const deaths = await discoverDeaths(repoPath, repoId, { maxDeaths: 20 });
  const deathsWithObits = [];

  for (const death of deaths) {
    const obitRes = await generateObituary(death, { model: "gemma3:1b", timeoutMs: 15000 });
    deathsWithObits.push({
      ...death,
      obituary: obitRes.obituary,
    });
  }

  const hauntings = await detectAllHauntings(repoPath, deaths);

  // Group haunting counts
  const countMap = new Map<string, number>();
  for (const h of hauntings) {
    countMap.set(h.death_id, (countMap.get(h.death_id) || 0) + 1);
  }

  const enrichedDeaths = deathsWithObits.map((d) => ({
    ...d,
    hauntingCount: countMap.get(d.id) || 0,
  }));

  // Generate exorcisms for hauntings
  const exorcisms = hauntings.map((h) => ({
    haunting_id: h.id,
    diff: generateExorciseDiff(repoPath, h),
  })).filter((e) => e.diff !== null);

  const samplePayload = {
    exported_at: new Date().toISOString(),
    generator: "Wake Precomputed Sample Exporter",
    model: "gemma3:1b",
    repo: {
      id: repoId,
      name: repoName,
      path: repoPath,
      last_scanned_at: new Date().toISOString(),
      death_count: enrichedDeaths.length,
      haunting_count: hauntings.length,
    },
    deaths: enrichedDeaths,
    hauntings,
    exorcisms,
  };

  const outPath = path.join(samplesDir, outputFile);
  fs.writeFileSync(outPath, JSON.stringify(samplePayload, null, 2), "utf8");
  console.log(`Wrote sample to ${outPath} (${enrichedDeaths.length} deaths, ${hauntings.length} hauntings)`);
}

async function run() {
  // 1. Export Wake's own real repo
  await exportSample(process.cwd(), "Wake", "wake.json");

  // 2. Export expressjs/cors
  const corsPath = path.join(process.cwd(), "fixtures", "cors");
  if (fs.existsSync(corsPath)) {
    await exportSample(corsPath, "expressjs/cors", "cors.json");
  }

  console.log("Precomputed sample generation complete.");
}

run().catch((err) => {
  console.error("Sample export error:", err);
  process.exit(1);
});
