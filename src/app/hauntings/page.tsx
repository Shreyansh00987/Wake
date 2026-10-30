"use client";

import React, { useState, useEffect } from "react";
import { HauntingRecord, ExorciseDiff, RepoRecord } from "@/types";
import { ExorciseModal } from "../../components/ExorciseModal";

export default function HauntingsPage() {
  const [hauntings, setHauntings] = useState<HauntingRecord[]>([]);
  const [allRepos, setAllRepos] = useState<RepoRecord[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeExorcism, setActiveExorcism] = useState<ExorciseDiff | null>(null);
  const [exorcisingId, setExorcisingId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  async function loadHauntings(targetRepoId?: string) {
    try {
      const url = targetRepoId ? `/api/hauntings?repoId=${targetRepoId}` : "/api/hauntings";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHauntings(data.hauntings || []);
        if (data.allRepos) setAllRepos(data.allRepos);
        if (data.repoId) setSelectedRepoId(data.repoId);
      }
    } catch (err) {
      console.error("Failed to load hauntings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHauntings();
  }, []);

  async function handleExorcise(haunting: HauntingRecord) {
    setExorcisingId(haunting.id);
    try {
      const res = await fetch(`/api/exorcise/${haunting.id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setActiveExorcism(data.exorcism);
      }
    } catch (err) {
      console.error("Failed to exorcise haunting:", err);
    } finally {
      setExorcisingId(null);
    }
  }

  const filtered = hauntings.filter(
    (h) =>
      h.file.toLowerCase().includes(filterQuery.toLowerCase()) ||
      h.dead_path.toLowerCase().includes(filterQuery.toLowerCase()) ||
      h.snippet.toLowerCase().includes(filterQuery.toLowerCase()) ||
      h.reason.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header & Hauntings Overview */}
      <div className="border-b border-hairline pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] tracking-widest text-ash uppercase">
              <span className="text-marigold flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />
                GHOST IN THE MACHINE
              </span>
              <span>//</span>
              <span>DANGLING SYMBOL RADAR</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-mono font-medium text-content tracking-tight">
              Active Codebase Hauntings
            </h1>
            <p className="font-sans text-xs text-ash-light mt-1.5 max-w-2xl leading-relaxed">
              Surviving code, documentation, and configuration files that still reference deceased files, deprecated prototypes, or deleted export symbols.
            </p>
          </div>

          {/* Quick Counter & Repo Selector */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {allRepos.length > 1 && (
              <select
                value={selectedRepoId}
                onChange={(e) => {
                  setSelectedRepoId(e.target.value);
                  loadHauntings(e.target.value);
                }}
                className="bg-ground border border-hairline px-2.5 py-1.5 text-xs text-content font-mono outline-none cursor-pointer focus:border-content"
              >
                {allRepos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.haunting_count} ghosts)
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 border border-marigold/60 bg-marigold-dim shrink-0">
              <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" />
              <span className="text-marigold font-medium text-xs tabular-nums">
                {hauntings.length} Active Ghosts
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by living file, dead reference, or code snippet..."
              className="w-full bg-ground border border-hairline px-3 py-1.5 text-xs text-content placeholder:text-ash-dark outline-none focus:border-content transition-colors"
            />
          </div>
          <span className="text-[11px] text-ash tabular-nums self-center">
            Showing {filtered.length} of {hauntings.length} detections
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-ash py-16 text-center border border-hairline bg-surface/20">
          <span className="w-2 h-2 rounded-full bg-marigold animate-pulse inline-block mr-2" />
          Scanning codebase with ripgrep for lingering ghosts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-hairline p-12 text-center bg-surface/20 space-y-2">
          <div className="text-ash-dark text-xl font-mono">†</div>
          <p className="text-content font-mono font-medium text-sm">No ghosts detected in this archive.</p>
          <p className="font-sans text-xs text-ash max-w-md mx-auto">
            All surviving code, documentation, and configuration files are cleanly untangled from dead references.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-hairline border-y border-hairline bg-ground-elevated/20">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="py-4 px-3 sm:px-4 hover:bg-surface/50 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-marigold font-medium text-sm">{h.file}</span>
                  <span className="text-ash text-xs">line {h.line}</span>
                  <span className="px-1.5 py-0.2 border border-marigold/70 text-marigold text-[9px] font-medium bg-marigold-dim tracking-wider">
                    {(h.confidence * 100).toFixed(0)}% CONFIDENCE
                  </span>
                </div>

                <div className="text-ash-light font-sans text-xs flex items-center gap-1.5 flex-wrap">
                  <span>{h.reason}</span>
                  <span className="text-ash-dark">•</span>
                  <span>Deceased target:</span>
                  <code className="font-mono text-content bg-ground px-1.5 py-0.2 border border-hairline text-[11px]">
                    {h.dead_path}
                  </code>
                </div>

                {/* Match Preview Snippet */}
                <div className="relative mt-2">
                  <pre className="p-2.5 bg-ground border border-hairline text-[11px] text-content overflow-x-auto leading-relaxed border-l-2 border-l-marigold">
                    <code>{h.snippet}</code>
                  </pre>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center md:self-center">
                <button
                  onClick={() => handleExorcise(h)}
                  disabled={exorcisingId === h.id}
                  className="px-3.5 py-1.5 border border-marigold text-marigold hover:bg-marigold hover:text-ground transition-all text-xs font-mono font-medium tracking-wide shadow-sm"
                >
                  {exorcisingId === h.id ? "Analyzing..." : "Exorcise (View Diff)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exorcise Diff Modal */}
      <ExorciseModal
        diff={activeExorcism}
        isOpen={!!activeExorcism}
        onClose={() => setActiveExorcism(null)}
      />
    </div>
  );
}
