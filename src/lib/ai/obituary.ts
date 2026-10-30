import crypto from "node:crypto";
import { DeathRecord, ObituaryRecord } from "@/types";
import { requestObituaryFromOllama, OllamaGenerateOptions } from "./client";
import { verifyCitations } from "./verify";
import { generateTemplateObituary } from "./template";

export interface GenerateObituaryResult {
  obituary: ObituaryRecord;
  rejectionReason?: string;
  source: "model" | "template_fallback";
}

export async function generateObituary(
  death: DeathRecord,
  options?: OllamaGenerateOptions
): Promise<GenerateObituaryResult> {
  try {
    const candidate = await requestObituaryFromOllama(death, options);
    const verification = verifyCitations(candidate, death);

    if (verification.valid && verification.normalizedCites) {
      const obitId = crypto
        .createHash("sha256")
        .update(`obit:${death.id}:${candidate.summary}`)
        .digest("hex")
        .substring(0, 16);

      return {
        obituary: {
          id: obitId,
          death_id: death.id,
          summary: candidate.summary,
          cause: candidate.cause,
          confidence: candidate.confidence,
          cites: verification.normalizedCites,
          is_template: false,
          created_at: new Date().toISOString(),
        },
        source: "model",
      };
    } else {
      // Citation validation failed -> reject and fall back to template
      const fallback = generateTemplateObituary(death);
      return {
        obituary: fallback,
        rejectionReason: verification.reason || "Citation verification failed",
        source: "template_fallback",
      };
    }
  } catch (err: any) {
    // Model offline, unreachable, timeout, or schema error -> fallback to template
    const fallback = generateTemplateObituary(death);
    return {
      obituary: fallback,
      rejectionReason: err?.message || "Ollama inference error or offline",
      source: "template_fallback",
    };
  }
}
