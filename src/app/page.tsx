"use client";

import React, { useState, useEffect } from "react";
import { DeathRecord, ObituaryRecord, HauntingRecord, RepoRecord, HeadstoneDetail } from "@/types";
import { Timeline } from "@/components/Timeline";
import { GraveyardTable } from "@/components/GraveyardTable";
import { HeadstoneSheet } from "@/components/HeadstoneSheet";
import { ExorciseModal } from "@/components/ExorciseModal";

export default function NecropolisLandingPage() {
  const [repo, setRepo] = useState<RepoRecord | null>(null);
  const [deaths, setDeaths] = useState<
    Array<DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Sheet & Modal state
  const [selectedDeathId, setSelectedDeathId] = useState<string | null>(null);
  const [activeHeadstone, setActiveHeadstone] = useState<HeadstoneDetail | null>(null);
  const [activeExorcism, setActiveExorcism] = useState<any | null>(null);

  // System status
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [graveyardRes, statusRes] = await Promise.all([
          fetch("/api/graveyard"),
          fetch("/api/status"),
        ]);

        if (graveyardRes.ok) {
          const gData = await graveyardRes.json();
          setRepo(gData.repo);
          setDeaths(gData.deaths || []);
        }

        if (statusRes.ok) {
          const sData = await statusRes.json();
          setStatus(sData);
        }
      } catch (err) {
        console.error("Failed to load graveyard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSelectDeath(deathId: string) {
    setSelectedDeathId(deathId);
    try {
      const res = await fetch(`/api/headstone/${deathId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveHeadstone(data);
      }
    } catch (err) {
      console.error("Failed to load headstone:", err);
    }
  }

  async function handleTriggerExorcise(haunting: HauntingRecord) {
    try {
      const res = await fetch(`/api/exorcise/${haunting.id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setActiveExorcism(data.exorcism);
      }
    } catch (err) {
      console.error("Failed to generate exorcise diff:", err);
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="border-b border-hairline pb-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-widest text-ash uppercase">
              <span className="text-content">ARCHIVAL CODEBASE NECROPOLIS</span>
              <span>//</span>
              <span>GHOST IN THE MACHINE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-mono font-medium tracking-tight text-content leading-tight">
              Wake: Every deleted line had a reason.
            </h1>
          </div>

          {/* Model Status Pill */}
          <div className="flex items-center gap-2.5 font-mono text-xs px-3 py-1.5 border border-hairline bg-ground-elevated/80 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                status?.ollamaOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-ash"
              }`}
            />
            <span className="text-ash-light">
              {status?.ollamaOnline
                ? `Ollama: ${status?.model || "gemma3:1b"}`
                : "Deterministic Template Mode"}
            </span>
            <span className="text-ash-dark text-[10px] hidden sm:inline">($0 Offline)</span>
          </div>
        </div>

        <p className="font-sans text-sm text-ash-light max-w-3xl leading-relaxed">
          Wake deterministically extracts deleted code from git history, writes grounded obituaries with strictly verified commit citations, and hunts down the surviving ghosts: living code, docs, and configs that still reference things that died.
        </p>

        {/* Repository Overview Stats Bar */}
        {repo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3.5 bg-ground-elevated/70 border border-hairline font-mono text-xs">
            <div>
              <span className="text-ash text-[10px] uppercase block tracking-wider">ACTIVE ARCHIVE</span>
              <span className="text-content font-medium truncate block text-sm">{repo.name}</span>
            </div>
            <div>
              <span className="text-ash text-[10px] uppercase block tracking-wider">DEATHS RECORDED</span>
              <span className="tabular-nums text-content font-medium block text-sm">{deaths.length} files</span>
            </div>
            <div>
              <span className="text-ash text-[10px] uppercase block tracking-wider">ACTIVE HAUNTINGS</span>
              <span
                className={`tabular-nums font-medium block text-sm flex items-center gap-1.5 ${
                  repo.haunting_count > 0 ? "text-marigold" : "text-content"
                }`}
              >
                {repo.haunting_count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />}
                {repo.haunting_count} ghosts detected
              </span>
            </div>
            <div>
              <span className="text-ash text-[10px] uppercase block tracking-wider">INFERENCE RUNTIME</span>
              <span className="text-ash-light block text-sm">100% Local ($0)</span>
            </div>
          </div>
        )}
      </section>

      {/* Featured Real Headstones (Hairline Rows) */}
      {deaths.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-ash px-1">
            <span className="uppercase tracking-widest text-[10px]">FEATURED HEADSTONES FROM WAKE'S HISTORY</span>
            <span className="text-[10px]">VERIFIED GIT EVIDENCE</span>
          </div>

          <div className="divide-y divide-hairline border-y border-hairline bg-ground-elevated/20">
            {deaths.slice(0, 3).map((d) => (
              <div
                key={d.id}
                onClick={() => handleSelectDeath(d.id)}
                className="py-3 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-surface hover-lift cursor-pointer transition-all group"
              >
                <div className="min-w-0 font-mono text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-ash-dark text-[11px]">†</span>
                    <span className="text-content font-medium group-hover:underline">{d.path}</span>
                    <span className="text-[9px] px-1.5 py-0.2 border border-hairline uppercase text-ash-light bg-surface/50">
                      {d.obituary.cause.replace("_", " ")}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-ash-light mt-1 line-clamp-1 italic">
                    "{d.last_words}"
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono text-[11px] justify-between sm:justify-end">
                  <span className="text-ash tabular-nums">{d.lifespan_days}d alive</span>
                  <span className="text-ash-dark tabular-nums">commit {d.died_sha.substring(0, 7)}</span>
                  {d.hauntingCount > 0 ? (
                    <span className="px-2 py-0.5 border border-marigold text-marigold text-[9px] font-medium tracking-wider bg-marigold-dim">
                      HAUNTING ({d.hauntingCount})
                    </span>
                  ) : (
                    <span className="text-ash-dark text-[10px] hidden sm:inline">AT PEACE</span>
                  )}
                  <span className="text-ash group-hover:text-content text-xs">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D3 Timeline */}
      <Timeline
        deaths={deaths}
        selectedDeathId={selectedDeathId}
        onSelectDeath={handleSelectDeath}
      />

      {/* Filterable Necropolis Ledger */}
      <GraveyardTable
        deaths={deaths}
        onSelectDeath={handleSelectDeath}
      />

      {/* Offline Terminal & Quickstart Section */}
      <section className="border-t border-hairline pt-8 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between text-ash px-1">
          <span className="text-[10px] uppercase tracking-widest font-medium">100% OFFLINE LOCAL ARCHAEOLOGY</span>
          <span className="text-[10px]">ZERO CLOUD DATA EXFILTRATION</span>
        </div>

        <div className="p-4 sm:p-5 bg-surface/40 border border-hairline space-y-3">
          <p className="font-sans text-xs text-ash-light leading-relaxed">
            Wake is built around open-weight AI running fully locally via Ollama. Deterministic git analysis extracts all ground truth facts; the local model only narrates and categorizes with verified commit SHA citations.
          </p>

          <div className="p-3.5 bg-ground border border-hairline text-[11px] text-content overflow-x-auto">
            <pre className="font-mono leading-relaxed">
              <span className="text-ash"># 1. Start Ollama local daemon</span>{'\n'}
              <span className="text-content">ollama serve</span>{'\n\n'}
              <span className="text-ash"># 2. Pull open-weight model (Google Gemma Terms of Use, 806 MB)</span>{'\n'}
              <span className="text-content">ollama pull gemma3:1b</span>{'\n\n'}
              <span className="text-ash"># 3. Scan any local repository completely offline</span>{'\n'}
              <span className="text-content">npm run dev</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Headstone Drawer Sheet */}
      <HeadstoneSheet
        death={activeHeadstone?.death || null}
        obituary={activeHeadstone?.obituary || null}
        hauntings={activeHeadstone?.hauntings || []}
        isOpen={!!activeHeadstone}
        onClose={() => setActiveHeadstone(null)}
        onExorciseHaunting={handleTriggerExorcise}
      />

      {/* Exorcise Diff Modal */}
      <ExorciseModal
        diff={activeExorcism}
        isOpen={!!activeExorcism}
        onClose={() => setActiveExorcism(null)}
      />
    </div>
  );
}
