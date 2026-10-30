"use client";

import React, { useState, useEffect } from "react";
import { DeathRecord, ObituaryRecord, HauntingRecord, RepoRecord, HeadstoneDetail, CauseOfDeath } from "@/types";
import { Timeline } from "../components/Timeline";
import { GraveyardTable } from "../components/GraveyardTable";
import { HeadstoneSheet } from "../components/HeadstoneSheet";
import { ExorciseModal } from "../components/ExorciseModal";

export default function NecropolisLandingPage() {
  const [repo, setRepo] = useState<RepoRecord | null>(null);
  const [deaths, setDeaths] = useState<
    Array<DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }>
  >([]);
  const [allRepos, setAllRepos] = useState<RepoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet & Modal state
  const [selectedDeathId, setSelectedDeathId] = useState<string | null>(null);
  const [activeHeadstone, setActiveHeadstone] = useState<HeadstoneDetail | null>(null);
  const [activeExorcism, setActiveExorcism] = useState<any | null>(null);

  // System status
  const [status, setStatus] = useState<any>(null);

  async function loadData(targetRepoId?: string) {
    try {
      const gUrl = targetRepoId ? `/api/graveyard?repoId=${targetRepoId}` : "/api/graveyard";
      const [graveyardRes, statusRes] = await Promise.all([
        fetch(gUrl),
        fetch("/api/status"),
      ]);

      if (graveyardRes.ok) {
        const gData = await graveyardRes.json();
        setRepo(gData.repo);
        setDeaths(gData.deaths || []);
        if (gData.allRepos) setAllRepos(gData.allRepos);
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

  useEffect(() => {
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

  function getCauseColorBorder(cause: CauseOfDeath) {
    switch (cause) {
      case "refactor":
        return "border-l-cause-refactor";
      case "rewrite":
        return "border-l-cause-rewrite";
      case "security_fix":
        return "border-l-cause-security";
      case "dependency_removal":
        return "border-l-cause-dependency";
      case "abandoned_experiment":
        return "border-l-cause-abandoned";
      default:
        return "border-l-hairline-light";
    }
  }

  return (
    <div className="space-y-12">
      {/* Eye-Catching Atmospheric Hero Section */}
      <section className="relative overflow-hidden border border-hairline bg-gradient-to-b from-ground-elevated to-ground p-6 sm:p-9 rounded-sm shadow-xl">
        {/* Ambient spectral backlight */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-marigold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-surface/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-6">
          {/* Top Eyebrow & Status Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-ash uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-content/60" />
              <span className="text-content font-medium">FORENSIC ARCHAEOLOGY ENGINE</span>
              <span>//</span>
              <span className="text-marigold font-medium">GHOST IN THE MACHINE</span>
            </div>

            {/* Inference Beacon */}
            <div className="flex items-center gap-2 font-mono text-xs px-3 py-1 border border-hairline bg-surface/40 rounded-sm shrink-0 shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.ollamaOnline
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "bg-marigold shadow-[0_0_8px_var(--marigold)]"
                }`}
              />
              <span className="text-content text-[11px] font-medium">
                {status?.ollamaOnline
                  ? `Ollama: ${status?.model || "gemma3:1b"}`
                  : "Template Engine Active"}
              </span>
              <span className="text-ash text-[10px] hidden sm:inline">• $0 Offline</span>
            </div>
          </div>

          {/* Main Hero Headline */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-mono font-medium tracking-tight text-content leading-tight">
              Wake: Every deleted line had a reason.
            </h1>
            <p className="font-sans text-sm sm:text-base text-ash-light leading-relaxed">
              When code dies, its context is lost. Wake deterministically extracts historical deletions, writes grounded obituaries with strictly verified commit SHA citations, and detects the living ghosts: surviving code, docs, and configs that still reference things that died.
            </p>
          </div>

          {/* High-Impact Visual Metric Deck */}
          {repo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="p-3.5 sm:p-4 bg-ground border border-hairline rounded-sm space-y-1">
                <span className="text-ash text-[10px] uppercase font-mono tracking-wider block">
                  ARCHAEOLOGICAL TARGET
                </span>
                {allRepos.length > 1 ? (
                  <select
                    value={repo.id}
                    onChange={(e) => loadData(e.target.value)}
                    className="w-full bg-surface border border-hairline text-content font-mono font-semibold text-xs sm:text-sm py-1 px-1.5 rounded-sm outline-none cursor-pointer focus:border-content"
                  >
                    {allRepos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.death_count} deaths)
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-content font-mono font-semibold text-base sm:text-lg block truncate">
                    {repo.name}
                  </span>
                )}
                <span className="text-ash text-[10px] font-mono block">Git Historical Ledger</span>
              </div>

              <div className="p-3.5 sm:p-4 bg-ground border border-hairline rounded-sm space-y-1">
                <span className="text-ash text-[10px] uppercase font-mono tracking-wider block">
                  DEATHS RECORDED
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="tabular-nums text-content font-mono font-bold text-xl sm:text-2xl">
                    {deaths.length}
                  </span>
                  <span className="text-ash text-xs font-mono">files purged</span>
                </div>
                <span className="text-ash text-[10px] font-mono block">100% rename-safe</span>
              </div>

              <div className="p-3.5 sm:p-4 bg-ground border border-marigold/60 bg-marigold-dim rounded-sm space-y-1">
                <span className="text-marigold text-[10px] uppercase font-mono tracking-wider block font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />
                  GHOSTS IN CODE
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="tabular-nums text-marigold font-mono font-bold text-xl sm:text-2xl">
                    {repo.haunting_count}
                  </span>
                  <span className="text-marigold text-xs font-mono font-medium">hauntings</span>
                </div>
                <a
                  href="/hauntings"
                  className="text-marigold hover:underline text-[10px] font-mono font-medium block"
                >
                  Inspect & Exorcise →
                </a>
              </div>

              <div className="p-3.5 sm:p-4 bg-ground border border-hairline rounded-sm space-y-1">
                <span className="text-ash text-[10px] uppercase font-mono tracking-wider block">
                  AI CITATION INTEGRITY
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="tabular-nums text-content font-mono font-bold text-xl sm:text-2xl">
                    100%
                  </span>
                  <span className="text-ash text-xs font-mono">SHA match</span>
                </div>
                <span className="text-ash text-[10px] font-mono block">0 hallucinations allowed</span>
              </div>
            </div>
          )}

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="/hauntings"
              className="px-4 py-2 border border-marigold text-marigold bg-marigold-dim hover:bg-marigold hover:text-ground transition-all duration-140 font-mono text-xs font-semibold flex items-center gap-2 rounded-sm shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />
              <span>Hunt Active Ghosts ({repo?.haunting_count || 0})</span>
            </a>
            <a
              href="/scan"
              className="px-4 py-2 border border-hairline hover:border-hairline-light bg-surface hover:bg-surface-hover text-content transition-all duration-140 font-mono text-xs font-medium rounded-sm"
            >
              + Scan Local Repository
            </a>
            <button
              onClick={() => {
                if (deaths[0]) handleSelectDeath(deaths[0].id);
              }}
              className="px-3.5 py-2 text-ash hover:text-content hover:underline font-mono text-xs transition-colors"
            >
              Inspect Featured Headstone →
            </button>
          </div>
        </div>
      </section>

      {/* Featured Real Headstones (Specimen Dossier Plaques) */}
      {deaths.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-ash px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-marigold" />
              <span className="uppercase tracking-widest text-[11px] font-medium text-content">
                FEATURED HISTORICAL HEADSTONES
              </span>
            </div>
            <span className="text-[10px] text-ash-light">Click plaque to open forensic dossier</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {deaths.slice(0, 3).map((d) => {
              const isHaunted = d.hauntingCount > 0;
              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDeath(d.id)}
                  className={`p-4 bg-ground-elevated border border-hairline border-l-4 ${getCauseColorBorder(
                    d.obituary.cause
                  )} hover-lift cursor-pointer rounded-sm space-y-3 transition-all group`}
                >
                  {/* Top Bar: Icon, Path, and Cause */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-ash-dark uppercase tracking-wider">
                        DECEASED FILE
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 border border-hairline uppercase text-ash-light bg-surface/50">
                        {d.obituary.cause.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-ash-dark text-sm">†</span>
                      <h3 className="font-mono text-sm font-semibold text-content group-hover:underline truncate">
                        {d.path}
                      </h3>
                    </div>
                  </div>

                  {/* Last Words Blockquote */}
                  <div className="p-2.5 bg-surface/40 border border-hairline/60 text-xs font-sans text-ash-light italic line-clamp-2 leading-relaxed">
                    "{d.last_words}"
                  </div>

                  {/* Lifeline & Status */}
                  <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px] font-mono">
                    <div className="text-ash">
                      <span className="tabular-nums text-content font-medium">{d.lifespan_days}d</span> alive
                    </div>

                    {isHaunted ? (
                      <span className="px-2 py-0.5 border border-marigold text-marigold text-[9px] font-semibold bg-marigold-dim tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />
                        HAUNTING ({d.hauntingCount})
                      </span>
                    ) : (
                      <span className="text-ash-dark text-[10px]">At Peace</span>
                    )}

                    <span className="text-ash group-hover:text-content group-hover:translate-x-0.5 transition-transform text-xs">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* D3 Spectrogram Timeline */}
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

      {/* Terminal Quickstart Showcase */}
      <section className="border border-hairline bg-ground-elevated/70 rounded-sm overflow-hidden shadow-md font-mono text-xs">
        {/* Terminal Header Bar */}
        <div className="p-3 bg-surface border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[11px] text-ash font-medium ml-2">bash — wake-archaeology</span>
          </div>
          <span className="text-[10px] text-ash uppercase tracking-wider hidden sm:inline">
            100% Offline • Zero Telemetry
          </span>
        </div>

        {/* Terminal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="font-sans text-xs text-ash-light leading-relaxed">
            Wake is built around open-weight AI running completely locally via Ollama. Deterministic git analysis extracts all ground truth facts; the local model only narrates and categorizes with strictly verified commit SHA citations.
          </p>

          <pre className="p-3 bg-ground border border-hairline text-[11px] text-content overflow-x-auto leading-relaxed">
            <span className="text-ash"># 1. Start Ollama local daemon</span>{'\n'}
            <span className="text-content">ollama serve</span>{'\n\n'}
            <span className="text-ash"># 2. Pull open-weight model (Google Gemma Terms of Use, 806 MB)</span>{'\n'}
            <span className="text-content">ollama pull gemma3:1b</span>{'\n\n'}
            <span className="text-ash"># 3. Scan any local repository completely offline</span>{'\n'}
            <span className="text-content">npm run dev</span>
          </pre>
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
