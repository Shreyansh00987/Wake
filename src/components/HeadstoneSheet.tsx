"use client";

import React, { useState } from "react";
import { DeathRecord, ObituaryRecord, HauntingRecord, CommitSummary } from "@/types";

interface HeadstoneSheetProps {
  death: DeathRecord | null;
  obituary: ObituaryRecord | null;
  hauntings: HauntingRecord[];
  isOpen: boolean;
  onClose: () => void;
  onExorciseHaunting?: (haunting: HauntingRecord) => void;
}

export function HeadstoneSheet({
  death,
  obituary,
  hauntings,
  isOpen,
  onClose,
  onExorciseHaunting,
}: HeadstoneSheetProps) {
  const [expandedSha, setExpandedSha] = useState<string | null>(null);

  if (!isOpen || !death) return null;

  const shortDied = death.died_sha.substring(0, 7);
  const shortBorn = death.born_sha.substring(0, 7);

  // Helper to find commit details from history
  function findCommit(sha: string): CommitSummary | undefined {
    return death?.commit_history?.find(
      (c) => c.sha.toLowerCase() === sha.toLowerCase() || c.shortSha.toLowerCase() === sha.toLowerCase()
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-none animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet Container: full screen on mobile, 620px sheet on desktop */}
      <div className="w-full sm:max-w-2xl h-full bg-ground border-l border-hairline overflow-y-auto p-4 sm:p-6 text-content">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-ash block mb-1">
              HEADSTONE ARTIFACT
            </span>
            <h2 className="text-base font-mono font-medium text-content break-all">
              {death.path}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-ash hover:text-content font-mono text-sm px-2 py-1 border border-hairline hover:border-hairline-light transition-colors"
            aria-label="Close sheet"
          >
            ✕ Close
          </button>
        </div>

        {/* Vital Inscription Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-hairline text-xs font-mono mb-6">
          <div>
            <span className="text-ash block text-[10px]">BORN</span>
            <span className="tabular-nums text-content block">
              {new Date(death.born_date).toISOString().split("T")[0]}
            </span>
            <span className="text-ash-dark text-[10px]">{shortBorn}</span>
          </div>
          <div>
            <span className="text-ash block text-[10px]">DIED</span>
            <span className="tabular-nums text-content block">
              {new Date(death.died_date).toISOString().split("T")[0]}
            </span>
            <span className="text-ash-dark text-[10px]">{shortDied}</span>
          </div>
          <div>
            <span className="text-ash block text-[10px]">LIFESPAN</span>
            <span className="tabular-nums text-content block text-sm">
              {death.lifespan_days}d
            </span>
            <span className="text-ash-dark text-[10px]">days alive</span>
          </div>
          <div>
            <span className="text-ash block text-[10px]">LINES PURGED</span>
            <span className="tabular-nums text-content block text-sm">
              -{death.diff_stat.deletions}
            </span>
            <span className="text-ash-dark text-[10px]">deletions</span>
          </div>
        </div>

        {/* Last Words & Author */}
        <div className="mb-6 font-mono text-xs">
          <span className="text-[10px] text-ash uppercase tracking-wider block mb-1">
            LAST WORDS (DEATH COMMIT MESSAGE)
          </span>
          <p className="p-3 bg-surface border border-hairline text-ash-light italic">
            "{death.last_words}"
          </p>
          <div className="mt-2 text-ash text-[11px] flex items-center justify-between">
            <span>Authors: {death.authors.join(", ")}</span>
            <span className="tabular-nums text-ash-dark">SHA: {shortDied}</span>
          </div>
        </div>

        {/* Grounded Obituary */}
        {obituary && (
          <div className="mb-6 border border-hairline p-4 bg-surface/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono tracking-wider text-ash uppercase">
                GROUNDED OBITUARY
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 border border-hairline uppercase text-ash-light">
                  {obituary.cause.replace("_", " ")}
                </span>
                <span className="text-[9px] font-mono text-ash-dark">
                  {obituary.is_template ? "[TEMPLATE]" : "[GEMMA NARRATIVE]"}
                </span>
              </div>
            </div>

            <p className="text-sm font-sans text-content leading-relaxed mb-4">
              {obituary.summary}
            </p>

            {/* Clickable Verified SHA Chips */}
            {obituary.cites && obituary.cites.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-ash block mb-1.5 uppercase">
                  Verified Citation Chips (Click to Inspect Commit):
                </span>
                <div className="flex flex-wrap gap-2">
                  {obituary.cites.map((sha) => {
                    const short = sha.substring(0, 7);
                    const isExpanded = expandedSha === sha;
                    const commitInfo = findCommit(sha);

                    return (
                      <div key={sha} className="font-mono text-xs">
                        <button
                          onClick={() => setExpandedSha(isExpanded ? null : sha)}
                          className={`px-2 py-1 border transition-all text-left ${
                            isExpanded
                              ? "border-content bg-surface text-content"
                              : "border-hairline hover:border-hairline-light text-ash hover:text-content"
                          }`}
                        >
                          commit {short} {isExpanded ? "▲" : "▼"}
                        </button>

                        {isExpanded && commitInfo && (
                          <div className="mt-1 p-2 bg-ground border border-hairline text-[11px] max-w-sm">
                            <div className="text-ash-dark text-[9px] break-all">{sha}</div>
                            <div className="text-content mt-1">"{commitInfo.message}"</div>
                            <div className="text-ash text-[10px] mt-1">
                              By {commitInfo.author} on{" "}
                              {new Date(commitInfo.date).toISOString().split("T")[0]}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Haunting Ghosts Alert */}
        {hauntings.length > 0 && (
          <div className="mb-6 border border-marigold/60 p-4 bg-marigold/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-marigold font-medium">
                ⚠ STILL HAUNTING ({hauntings.length})
              </span>
            </div>
            <p className="text-xs text-ash-light mb-3 font-sans">
              Active files in this repository still contain dangling references or imports to this deleted file.
            </p>
            <div className="space-y-2">
              {hauntings.map((h) => (
                <div
                  key={h.id}
                  className="p-2 border border-hairline bg-ground flex items-center justify-between text-xs font-mono"
                >
                  <div className="truncate max-w-[340px]">
                    <span className="text-content">{h.file}</span>
                    <span className="text-ash text-[10px] ml-2">line {h.line}</span>
                    <div className="text-ash-dark text-[10px] truncate">{h.snippet}</div>
                  </div>
                  {onExorciseHaunting && (
                    <button
                      onClick={() => onExorciseHaunting(h)}
                      className="px-2 py-1 text-[10px] border border-marigold text-marigold hover:bg-marigold hover:text-ground transition-colors"
                    >
                      Exorcise
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Deletion Diff */}
        {death.final_diff && (
          <div className="mb-6">
            <span className="text-[10px] font-mono text-ash uppercase tracking-wider block mb-2">
              FINAL DELETION DIFF
            </span>
            <pre className="p-3 bg-surface border border-hairline text-[11px] font-mono overflow-x-auto text-ash-light leading-snug max-h-72">
              {death.final_diff}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
