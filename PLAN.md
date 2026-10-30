# Phase 5 Plan: Precomputed Sample Scans, Docker & Deployment Config
1. Build sample export script in scripts/generate_samples.ts to dump full real scans into samples/wake.json and samples/cors.json.
2. Generate authenticated precomputed sample files capturing real deaths, obituaries, citations, and hauntings.
3. Add fallback sample loader to API routes so hosted cloud environments (e.g. Render) serve authentic precomputed scans.
4. Author multi-stage Dockerfile and docker-compose.yml for one-command local offline execution.
5. Write render.yaml deploy configuration and document hosted read-only behavior with complete transparency.
