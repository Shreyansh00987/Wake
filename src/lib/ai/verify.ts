import { DeathRecord, CauseOfDeath } from "@/types";

export interface CandidateObituary {
  summary: string;
  cause: CauseOfDeath;
  confidence: number;
  cites: string[];
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  normalizedCites?: string[];
}

export function verifyCitations(
  candidate: CandidateObituary,
  death: DeathRecord
): VerificationResult {
  if (!candidate.summary || typeof candidate.summary !== "string") {
    return { valid: false, reason: "Missing or invalid summary string" };
  }

  const validCauses: CauseOfDeath[] = [
    "refactor",
    "rewrite",
    "abandoned_experiment",
    "security_fix",
    "dependency_removal",
    "unknown",
  ];
  if (!validCauses.includes(candidate.cause)) {
    return { valid: false, reason: `Invalid cause enum value: ${candidate.cause}` };
  }

  if (
    typeof candidate.confidence !== "number" ||
    isNaN(candidate.confidence) ||
    candidate.confidence < 0 ||
    candidate.confidence > 1
  ) {
    return { valid: false, reason: `Confidence must be a number between 0 and 1` };
  }

  if (!Array.isArray(candidate.cites) || candidate.cites.length === 0) {
    return { valid: false, reason: "Citations array must not be empty" };
  }

  // Build lookup of all acceptable commit SHAs (case-insensitive)
  // Maps short or full sha -> canonical full sha
  const shaMap = new Map<string, string>();

  function registerSha(fullSha: string) {
    if (!fullSha) return;
    const lower = fullSha.toLowerCase();
    shaMap.set(lower, fullSha);
    if (lower.length >= 7) {
      shaMap.set(lower.substring(0, 7), fullSha);
      shaMap.set(lower.substring(0, 8), fullSha);
      shaMap.set(lower.substring(0, 10), fullSha);
      shaMap.set(lower.substring(0, 12), fullSha);
    }
  }

  registerSha(death.died_sha);
  registerSha(death.born_sha);

  if (death.commit_history) {
    for (const c of death.commit_history) {
      registerSha(c.sha);
    }
  }

  const normalizedCites: string[] = [];

  for (const cite of candidate.cites) {
    if (typeof cite !== "string") {
      return { valid: false, reason: `Non-string citation encountered: ${cite}` };
    }

    const clean = cite.trim().replace(/^#/, "").toLowerCase();

    // Check if cite matches any known SHA from the context pack
    const canonical = shaMap.get(clean);
    if (!canonical) {
      return {
        valid: false,
        reason: `Cited SHA "${cite}" was not found in the verified commit history of ${death.path}`,
      };
    }

    if (!normalizedCites.includes(canonical)) {
      normalizedCites.push(canonical);
    }
  }

  return {
    valid: true,
    normalizedCites,
  };
}
