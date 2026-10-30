"use client";

import React, { useState, useEffect } from "react";
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
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !death) return null;

  const shortDied = death.died_sha.substring(0, 7);
  const shortBorn = death.born_sha.substring(0, 7);

  function findCommit(sha: string): CommitSummary | undefined {
    return death?.commit_history?.find(
      (c) =>
        c.sha.toLowerCase() === sha.toLowerCase() ||
        c.shortSha.toLowerCase() === sha.toLowerCase()
    );
  }

  function handleCopySha(sha: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  }

  // Render colored diff lines
  const diffLines = (death.final_diff || "").split("\n");

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] animate-in fade-in duration-150"
      style={{ backgroundColor: "var(--modal-scrim)" }}
    >
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet Body */}
      <div className="w-full sm:max-w-2xl h-full bg-ground border-l border-hairline overflow-y-auto p-4 sm:p-7 text-content shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Top Dossier Header */}
          <div className="flex items-start justify-between border-b border-hairline pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] text-ash select-none">†</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-ash font-medium">
                  ARCHIVAL HEADSTONE DOSSIER
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-mono font-medium text-content break-all">
                {death.path}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-ash hover:text-content font-mono text-xs px-2.5 py-1 border border-hairline hover:border-hairline-light transition-colors"
              aria-label="Close sheet"
            >
              ✕ Close (Esc)
            </button>
          </div>

          {/* Chronological Life Breadcrumb */}
          <div className="p-3 bg-ground-elevated/70 border border-hairline font-mono text-xs">
            <div className="text-[10px] text-ash uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>LIFELINE TRAJECTORY</span>
              <span className="tabular-nums text-content">{death.lifespan_days} days in existence</span>
            </div>
            <div className="flex items-center justify-between text-[11px] gap-2">
              <div className="truncate">
                <span className="text-ash block text-[10px]">BORN</span>
                <span className="text-content font-medium block">
                  {new Date(death.born_date).toISOString().split("T")[0]}
                </span>
                <span className="text-ash-dark text-[10px]">commit {shortBorn}</span>
              </div>

              <div className="flex-1 flex items-center justify-center px-2">
                <div className="w-full border-t border-hairline-light relative flex items-center justify-center">
                  <span className="bg-ground-elevated px-2 text-[10px] text-ash tabular-nums">
                    {(death.commit_history || []).length} commits
                  </span>
                </div>
              </div>

              <div className="truncate text-right">
                <span className="text-ash block text-[10px]">DIED</span>
                <span className="text-content font-medium block">
                  {new Date(death.died_date).toISOString().split("T")[0]}
                </span>
                <span className="text-ash-dark text-[10px]">commit {shortDied}</span>
              </div>
            </div>
          </div>

          {/* Vital Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-hairline text-xs font-mono">
            <div>
              <span className="text-ash block text-[10px]">CAUSE</span>
              <span className="text-content capitalize block font-medium">
                {obituary?.cause.replace("_", " ") || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-ash block text-[10px]">LINES PURGED</span>
              <span className="tabular-nums text-content font-medium block text-sm">
                -{death.diff_stat.deletions}
              </span>
            </div>
            <div>
              <span className="text-ash block text-[10px]">HISTORICAL AUTHORS</span>
              <span className="text-content truncate block font-medium" title={death.authors.join(", ")}>
                {death.authors[0] || "Unknown"}
                {death.authors.length > 1 ? ` (+${death.authors.length - 1})` : ""}
              </span>
            </div>
            <div>
              <span className="text-ash block text-[10px]">GHOST STATUS</span>
              {hauntings.length > 0 ? (
                <span className="text-marigold font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />
                  {hauntings.length} Ghosts
                </span>
              ) : (
                <span className="text-ash-dark">At Peace</span>
              )}
            </div>
          </div>

          {/* Last Words (Final Commit Message) */}
          <div className="font-mono text-xs">
            <span className="text-[10px] text-ash uppercase tracking-wider block mb-1">
              LAST WORDS (DEATH COMMIT MESSAGE)
            </span>
            <div className="p-3 bg-surface border border-hairline text-content leading-relaxed italic">
              "{death.last_words}"
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-ash">
              <span>Author: {death.authors.join(", ")}</span>
              <button
                onClick={(e) => handleCopySha(death.died_sha, e)}
                className="hover:text-content hover:underline"
              >
                {copiedSha === death.died_sha ? "✓ Copied SHA" : `Copy SHA (${shortDied})`}
              </button>
            </div>
          </div>

          {/* Grounded Obituary Inscription */}
          {obituary && (
            <div className="border border-hairline p-4 bg-surface/40 relative">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-hairline/60">
                <span className="text-[10px] font-mono tracking-widest text-ash uppercase font-medium">
                  GROUNDED OBITUARY
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono px-2 py-0.5 border border-hairline uppercase text-ash-light">
                    {obituary.cause.replace("_", " ")}
                  </span>
                  <span className="text-[9px] font-mono text-ash-dark">
                    {obituary.is_template ? "[TEMPLATE ENGINE]" : "[GEMMA 3 1B]"}
                  </span>
                </div>
              </div>

              <p className="text-sm font-sans text-content leading-relaxed mb-4">
                {obituary.summary}
              </p>

              {/* Verified Commit Citation Chips */}
              {obituary.cites && obituary.cites.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-ash block mb-2 uppercase tracking-wider">
                    Verified Citations (Click chip to inspect Git commit):
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
                            className={`px-2.5 py-1 border transition-all text-left flex items-center gap-1.5 ${
                              isExpanded
                                ? "border-content bg-surface text-content shadow-md"
                                : "border-hairline hover:border-hairline-light text-ash hover:text-content bg-ground"
                            }`}
                          >
                            <span>commit {short}</span>
                            <span className="text-[9px] text-ash-dark">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </button>

                          {isExpanded && commitInfo && (
                            <div className="mt-1.5 p-3 bg-ground border border-hairline-light text-[11px] max-w-md shadow-xl animate-in fade-in duration-100">
                              <div className="flex items-center justify-between text-ash-dark text-[9px] mb-1">
                                <span className="font-mono">{sha}</span>
                                <button
                                  onClick={(e) => handleCopySha(sha, e)}
                                  className="text-ash hover:text-content underline ml-2"
                                >
                                  {copiedSha === sha ? "✓ Copied" : "Copy"}
                                </button>
                              </div>
                              <div className="text-content font-medium my-1">
                                "{commitInfo.message}"
                              </div>
                              <div className="text-ash text-[10px] mt-1 flex items-center justify-between">
                                <span>Author: {commitInfo.author}</span>
                                <span>
                                  {new Date(commitInfo.date).toISOString().split("T")[0]}
                                </span>
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

          {/* Haunting Ghosts Alert Section */}
          {hauntings.length > 0 && (
            <div className="border border-marigold/70 p-4 bg-marigold-dim relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-marigold font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" />
                  STILL HAUNTING ({hauntings.length} LIVING REFERENCES)
                </span>
              </div>
              <p className="text-xs text-ash-light mb-3 font-sans leading-relaxed">
                Living code, documentation, and configuration files still reference this dead file or its exported symbols.
              </p>
              <div className="space-y-2">
                {hauntings.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 border border-hairline bg-ground flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="truncate max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-content font-medium">{h.file}</span>
                        <span className="text-ash text-[10px]">line {h.line}</span>
                        <span className="text-[9px] text-marigold font-medium">
                          {(h.confidence * 100).toFixed(0)}% Match
                        </span>
                      </div>
                      <div className="text-ash-light text-[10px] mt-0.5 font-sans truncate">
                        {h.reason}
                      </div>
                      <div className="text-ash-dark text-[10px] truncate mt-1 bg-surface/50 p-1">
                        {h.snippet}
                      </div>
                    </div>
                    {onExorciseHaunting && (
                      <button
                        onClick={() => onExorciseHaunting(h)}
                        className="px-3 py-1 text-[11px] border border-marigold text-marigold hover:bg-marigold hover:text-ground transition-colors shrink-0 uppercase tracking-wider font-medium"
                      >
                        Exorcise Diff
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Deletion Diff */}
          {death.final_diff && (
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-ash uppercase tracking-wider mb-2">
                <span>HISTORICAL DELETION DIFF</span>
                <span>{diffLines.length} lines</span>
              </div>
              <div className="bg-surface border border-hairline overflow-x-auto max-h-80 font-mono text-[11px] leading-relaxed p-2">
                {diffLines.map((line, idx) => {
                  const isDel = line.startsWith("-");
                  const isIns = line.startsWith("+");
                  const isHeader = line.startsWith("@@") || line.startsWith("diff ");
                  return (
                    <div
                      key={idx}
                      className={`px-2 py-0.2 whitespace-pre ${
                        isDel
                          ? "diff-del"
                          : isIns
                          ? "diff-ins"
                          : isHeader
                          ? "text-ash-dark font-medium"
                          : "text-ash-light"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-hairline mt-6 flex items-center justify-between text-[10px] font-mono text-ash-dark">
          <span>Wake Archival Record ID: {death.id}</span>
          <button onClick={onClose} className="hover:text-content">
            Close Sheet ✕
          </button>
        </div>
      </div>
    </div>
  );
}
