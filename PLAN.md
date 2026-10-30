# Phase 3 Plan: Haunting Detector & Exorcise Diff Generation
1. Implement cross-platform ripgrep wrapper in src/lib/ghosts/ripgrep.ts using child_process argument arrays and @vscode/ripgrep.
2. Build Haunting Detector in src/lib/ghosts/hauntings.ts with token extraction, path searching, and confidence scoring.
3. Implement false-positive filters ignoring lockfiles, vendored directories (node_modules, dist, .git), and generic short tokens.
4. Implement Exorcise diff generator in src/lib/ghosts/exorcise.ts producing copy-only standard unified diffs without modifying files.
5. Write unit test suite in test/hauntings.test.ts verifying ghost reference matching, confidence rankings, and clean diff generation.
