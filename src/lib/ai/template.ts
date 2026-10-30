import { DeathRecord, ObituaryRecord, CauseOfDeath } from "@/types";

export function inferTemplateCause(lastWords: string, path: string): CauseOfDeath {
  const text = `${lastWords} ${path}`.toLowerCase();

  // 1. Security fix
  if (/\b(cve|vulnerab|security|exploit|patch|advisory)\b/i.test(text)) {
    return "security_fix";
  }

  // 2. Dependency removal or dropping libraries
  if (
    /\b(dep|deps|dependency|dependencies|vendor|unvendor|package|node_modules|drop\s+built-in|remove\s+support|drop\s+support|drop\s+flow)\b/i.test(
      text
    )
  ) {
    return "dependency_removal";
  }

  // 3. Rewrite / overhaul
  if (/\b(rewrite|redesign|overhaul|re-write|move\s+to\s+esm|port\b|in\s+typescript)\b/i.test(text)) {
    return "rewrite";
  }

  // 4. Refactor / build / CI / tooling modernization
  if (
    /\b(refactor|clean\s*up|reorganiz|re-structure|modular|build|ci|actions|travis|eslint|lint|xo|config|mocha|test|tests|rename|switch\s+to)\b/i.test(
      text
    )
  ) {
    return "refactor";
  }

  // 5. Abandoned experiment, obsolete, or unnecessary tests/files
  if (
    /\b(experiment|temp|spike|poc|prototype|abandon|deprecated?|obsolete|unused|unnecessary|redundant|remove\s+\.replit|meta\s+tweaks|wrapping\s+up)\b/i.test(
      text
    )
  ) {
    return "abandoned_experiment";
  }

  return "unknown";
}

export function generateTemplateObituary(death: DeathRecord): ObituaryRecord {
  const cause = inferTemplateCause(death.last_words, death.path);
  const author = death.authors[0] || "Author";
  const shortDied = death.died_sha.substring(0, 7);

  let summary = `Removed ${death.path} after ${death.lifespan_days} days. Final commit ${shortDied} by ${author}: "${death.last_words}".`;
  if (death.diff_stat.deletions > 0) {
    summary += ` Purged ${death.diff_stat.deletions} lines of historical code.`;
  }

  return {
    id: `obit-template-${death.id}`,
    death_id: death.id,
    summary,
    cause,
    confidence: 1.0,
    cites: [death.died_sha],
    is_template: true,
    created_at: new Date().toISOString(),
  };
}
