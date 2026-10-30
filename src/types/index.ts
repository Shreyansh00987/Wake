export type CauseOfDeath =
  | "refactor"
  | "rewrite"
  | "abandoned_experiment"
  | "security_fix"
  | "dependency_removal"
  | "unknown";

export interface DiffStat {
  insertions: number;
  deletions: number;
}

export interface CommitSummary {
  sha: string;
  shortSha: string;
  author: string;
  date: string;
  message: string;
}

export interface DeathRecord {
  id: string;
  repo_id: string;
  path: string;
  born_sha: string;
  born_date: string;
  died_sha: string;
  died_date: string;
  lifespan_days: number;
  last_words: string;
  diff_stat: DiffStat;
  authors: string[];
  first_version_snippet?: string;
  final_diff?: string;
  commit_history?: CommitSummary[];
}

export interface ObituaryRecord {
  id: string;
  death_id: string;
  summary: string;
  cause: CauseOfDeath;
  confidence: number;
  cites: string[];
  is_template: boolean;
  created_at: string;
}

export interface HauntingRecord {
  id: string;
  repo_id: string;
  death_id: string;
  dead_path: string;
  dead_symbol: string;
  file: string;
  line: number;
  snippet: string;
  reason: string;
  confidence: number;
}

export interface RepoRecord {
  id: string;
  name: string;
  path: string;
  last_scanned_at: string;
  death_count: number;
  haunting_count: number;
}

export interface HeadstoneDetail {
  death: DeathRecord;
  obituary: ObituaryRecord;
  hauntings: HauntingRecord[];
}

export interface ScanProgress {
  stage:
    | "discovering"
    | "extracting_evidence"
    | "generating_obituaries"
    | "detecting_hauntings"
    | "complete"
    | "error";
  message: string;
  current: number;
  total: number;
  record?: Partial<DeathRecord>;
}

export interface ExorciseDiff {
  death_id: string;
  target_file: string;
  diff: string;
  original_line: number;
  dead_reference: string;
}
