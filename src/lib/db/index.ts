import type { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import {
  DeathRecord,
  ObituaryRecord,
  HauntingRecord,
  RepoRecord,
  HeadstoneDetail,
} from "@/types";

let DatabaseSyncClass: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqliteModule = require("node:sqlite");
  DatabaseSyncClass = sqliteModule.DatabaseSync;
} catch {
  // node:sqlite requires --experimental-sqlite in Node 22
}

let dbInstance: any = null;

// Safe fallback stub when SQLite is not compiled/flagged in Node
const mockDb: any = {
  exec: () => {},
  prepare: () => ({
    run: () => {},
    get: () => null,
    all: () => [],
  }),
  close: () => {},
};

export function getDatabase(dbPath?: string): DatabaseSync {
  if (dbInstance && !dbPath) {
    return dbInstance;
  }

  if (!DatabaseSyncClass) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sqliteModule = require("node:sqlite");
      DatabaseSyncClass = sqliteModule.DatabaseSync;
    } catch {
      return mockDb as DatabaseSync;
    }
  }

  const resolvedPath =
    dbPath ||
    process.env.WAKE_DB_PATH ||
    path.join(process.cwd(), "data", "wake.db");

  if (resolvedPath !== ":memory:") {
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  try {
    const db = new DatabaseSyncClass(resolvedPath);
    db.exec("PRAGMA foreign_keys = ON;");
    initSchema(db);

    if (!dbPath) {
      dbInstance = db;
    }

    return db;
  } catch (err) {
    console.warn("[Wake DB] Could not initialize SQLite, using fallback:", err);
    return mockDb as DatabaseSync;
  }
}

export function closeDatabase(): void {
  if (dbInstance && dbInstance !== mockDb) {
    try {
      dbInstance.close();
    } catch {
      // Ignore if already closed
    }
    dbInstance = null;
  }
}

function initSchema(db: any): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS repos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      last_scanned_at TEXT,
      death_count INTEGER DEFAULT 0,
      haunting_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS deaths (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      path TEXT NOT NULL,
      born_sha TEXT NOT NULL,
      born_date TEXT NOT NULL,
      died_sha TEXT NOT NULL,
      died_date TEXT NOT NULL,
      lifespan_days INTEGER NOT NULL,
      last_words TEXT NOT NULL,
      diff_stat TEXT NOT NULL,
      authors TEXT NOT NULL,
      first_version_snippet TEXT,
      final_diff TEXT,
      commit_history TEXT,
      FOREIGN KEY(repo_id) REFERENCES repos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS obituaries (
      id TEXT PRIMARY KEY,
      death_id TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      cause TEXT NOT NULL,
      confidence REAL NOT NULL,
      cites TEXT NOT NULL,
      is_template INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(death_id) REFERENCES deaths(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hauntings (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      death_id TEXT NOT NULL,
      dead_path TEXT NOT NULL,
      dead_symbol TEXT NOT NULL,
      file TEXT NOT NULL,
      line INTEGER NOT NULL,
      snippet TEXT NOT NULL,
      reason TEXT NOT NULL,
      confidence REAL NOT NULL,
      FOREIGN KEY(repo_id) REFERENCES repos(id) ON DELETE CASCADE,
      FOREIGN KEY(death_id) REFERENCES deaths(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_deaths_repo ON deaths(repo_id);
    CREATE INDEX IF NOT EXISTS idx_deaths_died_date ON deaths(died_date);
    CREATE INDEX IF NOT EXISTS idx_hauntings_repo ON hauntings(repo_id);
    CREATE INDEX IF NOT EXISTS idx_hauntings_death ON hauntings(death_id);
  `);
}

export const dbOps = {
  upsertRepo(db: DatabaseSync, repo: RepoRecord): void {
    const stmt = db.prepare(`
      INSERT INTO repos (id, name, path, last_scanned_at, death_count, haunting_count)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET
        name = excluded.name,
        last_scanned_at = excluded.last_scanned_at,
        death_count = excluded.death_count,
        haunting_count = excluded.haunting_count
    `);
    stmt.run(
      repo.id,
      repo.name,
      repo.path,
      repo.last_scanned_at,
      repo.death_count,
      repo.haunting_count
    );
  },

  getRepo(db: DatabaseSync, idOrPath: string): RepoRecord | null {
    const stmt = db.prepare(`
      SELECT * FROM repos WHERE id = ? OR path = ? LIMIT 1
    `);
    const row = stmt.get(idOrPath, idOrPath) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      path: row.path,
      last_scanned_at: row.last_scanned_at,
      death_count: Number(row.death_count),
      haunting_count: Number(row.haunting_count),
    };
  },

  getAllRepos(db: DatabaseSync): RepoRecord[] {
    const stmt = db.prepare(`SELECT * FROM repos ORDER BY last_scanned_at DESC`);
    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      path: row.path,
      last_scanned_at: row.last_scanned_at,
      death_count: Number(row.death_count),
      haunting_count: Number(row.haunting_count),
    }));
  },

  clearRepoData(db: DatabaseSync, repoId: string): void {
    const stmtDeaths = db.prepare(`DELETE FROM deaths WHERE repo_id = ?`);
    stmtDeaths.run(repoId);
    const stmtHauntings = db.prepare(`DELETE FROM hauntings WHERE repo_id = ?`);
    stmtHauntings.run(repoId);
  },

  insertDeath(db: DatabaseSync, death: DeathRecord): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO deaths (
        id, repo_id, path, born_sha, born_date, died_sha, died_date,
        lifespan_days, last_words, diff_stat, authors,
        first_version_snippet, final_diff, commit_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      death.id,
      death.repo_id,
      death.path,
      death.born_sha,
      death.born_date,
      death.died_sha,
      death.died_date,
      death.lifespan_days,
      death.last_words,
      JSON.stringify(death.diff_stat),
      JSON.stringify(death.authors),
      death.first_version_snippet || "",
      death.final_diff || "",
      death.commit_history ? JSON.stringify(death.commit_history) : "[]"
    );
  },

  getDeathsForRepo(db: DatabaseSync, repoId: string): DeathRecord[] {
    const stmt = db.prepare(`
      SELECT * FROM deaths WHERE repo_id = ? ORDER BY died_date DESC
    `);
    const rows = stmt.all(repoId) as any[];
    return rows.map((r) => ({
      id: r.id,
      repo_id: r.repo_id,
      path: r.path,
      born_sha: r.born_sha,
      born_date: r.born_date,
      died_sha: r.died_sha,
      died_date: r.died_date,
      lifespan_days: Number(r.lifespan_days),
      last_words: r.last_words,
      diff_stat: JSON.parse(r.diff_stat),
      authors: JSON.parse(r.authors),
      first_version_snippet: r.first_version_snippet,
      final_diff: r.final_diff,
      commit_history: r.commit_history ? JSON.parse(r.commit_history) : [],
    }));
  },

  getDeathById(db: DatabaseSync, deathId: string): DeathRecord | null {
    const stmt = db.prepare(`SELECT * FROM deaths WHERE id = ? LIMIT 1`);
    const r = stmt.get(deathId) as any;
    if (!r) return null;
    return {
      id: r.id,
      repo_id: r.repo_id,
      path: r.path,
      born_sha: r.born_sha,
      born_date: r.born_date,
      died_sha: r.died_sha,
      died_date: r.died_date,
      lifespan_days: Number(r.lifespan_days),
      last_words: r.last_words,
      diff_stat: JSON.parse(r.diff_stat),
      authors: JSON.parse(r.authors),
      first_version_snippet: r.first_version_snippet,
      final_diff: r.final_diff,
      commit_history: r.commit_history ? JSON.parse(r.commit_history) : [],
    };
  },

  insertObituary(db: DatabaseSync, obit: ObituaryRecord): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO obituaries (
        id, death_id, summary, cause, confidence, cites, is_template, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      obit.id,
      obit.death_id,
      obit.summary,
      obit.cause,
      obit.confidence,
      JSON.stringify(obit.cites),
      obit.is_template ? 1 : 0,
      obit.created_at
    );
  },

  getObituary(db: DatabaseSync, deathId: string): ObituaryRecord | null {
    const stmt = db.prepare(`SELECT * FROM obituaries WHERE death_id = ? LIMIT 1`);
    const r = stmt.get(deathId) as any;
    if (!r) return null;
    return {
      id: r.id,
      death_id: r.death_id,
      summary: r.summary,
      cause: r.cause,
      confidence: Number(r.confidence),
      cites: JSON.parse(r.cites),
      is_template: Boolean(r.is_template),
      created_at: r.created_at,
    };
  },

  insertHaunting(db: DatabaseSync, haunting: HauntingRecord): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO hauntings (
        id, repo_id, death_id, dead_path, dead_symbol, file, line, snippet, reason, confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      haunting.id,
      haunting.repo_id,
      haunting.death_id,
      haunting.dead_path,
      haunting.dead_symbol,
      haunting.file,
      haunting.line,
      haunting.snippet,
      haunting.reason,
      haunting.confidence
    );
  },

  getHauntingsForRepo(db: DatabaseSync, repoId: string): HauntingRecord[] {
    const stmt = db.prepare(`
      SELECT * FROM hauntings WHERE repo_id = ? ORDER BY confidence DESC
    `);
    const rows = stmt.all(repoId) as any[];
    return rows.map((r) => ({
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
    }));
  },

  getHauntingsForDeath(db: DatabaseSync, deathId: string): HauntingRecord[] {
    const stmt = db.prepare(`
      SELECT * FROM hauntings WHERE death_id = ? ORDER BY confidence DESC
    `);
    const rows = stmt.all(deathId) as any[];
    return rows.map((r) => ({
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
    }));
  },

  getHeadstoneDetail(db: DatabaseSync, deathId: string): HeadstoneDetail | null {
    const death = this.getDeathById(db, deathId);
    if (!death) return null;
    const obituary = this.getObituary(db, deathId) || {
      id: `fallback-${deathId}`,
      death_id: deathId,
      summary: `Removed ${death.path} in commit ${death.died_sha.substring(0, 7)}: "${death.last_words}"`,
      cause: "unknown" as const,
      confidence: 1.0,
      cites: [death.died_sha],
      is_template: true,
      created_at: new Date().toISOString(),
    };
    const hauntings = this.getHauntingsForDeath(db, deathId);
    return { death, obituary, hauntings };
  },
};
