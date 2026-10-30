# Phase 1 Plan: Git Ingestion, Evidence Layer & Synthetic Fixture Tests
1. Define core domain types for deaths, commits, obituaries, hauntings, and scan progress in src/types/index.ts.
2. Initialize SQLite persistence layer using node:sqlite with migrations for repos, deaths, obituaries, and hauntings.
3. Implement Git Ingestion engine in src/lib/git/ingest.ts with rename tracking (git log -M) and birth/death resolution.
4. Implement Evidence Layer in src/lib/git/evidence.ts extracting real diffstat, author attribution, lifespan, and context packs.
5. Create synthetic git fixture repository and write unit test suite in test/ingest.test.ts covering deletions, renames, and resurrections.
