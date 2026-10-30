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
      <section className="border-b border-hairline pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-ash uppercase block mb-1">
              ARCHIVAL CODEBASE NECROPOLIS
            </span>
            <h1 className="text-2xl sm:text-3xl font-mono font-medium tracking-tight text-content">
              Wake: Every deleted line had a reason.
            </h1>
          </div>

          {/* Model Status Pill */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                status?.ollamaOnline ? "bg-emerald-500" : "bg-ash"
              }`}
            />
            <span className="text-ash">
              {status?.ollamaOnline
                ? `Ollama: ${status?.model || "gemma3:1b"}`
                : "Offline Template Safety Mode"}
            </span>
          </div>
        </div>

        <p className="font-sans text-sm text-ash-light max-w-2xl leading-relaxed mb-6">
          Wake scans git history, finds every deleted file, and writes a grounded obituary with strictly verified commit citations. It then locates the "ghosts": living code, docs, and configs that still reference dead files.
        </p>

        {/* Repository Overview Stats Bar */}
        {repo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-surface/50 border border-hairline font-mono text-xs">
            <div>
              <span className="text-ash text-[10px] block">ACTIVE REPO</span>
              <span className="text-content font-medium truncate block">{repo.name}</span>
            </div>
            <div>
              <span className="text-ash text-[10px] block">DEATHS RECORDED</span>
              <span className="tabular-nums text-content font-medium">{deaths.length} files</span>
            </div>
            <div>
              <span className="text-ash text-[10px] block">ACTIVE HAUNTINGS</span>
              <span className={`tabular-nums font-medium ${repo.haunting_count > 0 ? "text-marigold" : "text-content"}`}>
                {repo.haunting_count} ghosts
              </span>
            </div>
            <div>
              <span className="text-ash text-[10px] block">INFERENCE RUNTIME</span>
              <span className="text-ash-light">100% Local ($0)</span>
            </div>
          </div>
        )}
      </section>

      {/* Featured Real Headstones (Hairline Rows) */}
      {deaths.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-ash">
            <span>FEATURED HEADSTONES FROM WAKE'S HISTORY</span>
            <span>REAL COMMITS</span>
          </div>

          <div className="divide-y divide-hairline border-y border-hairline">
            {deaths.slice(0, 3).map((d) => (
              <div
                key={d.id}
                onClick={() => handleSelectDeath(d.id)}
                className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface hover-lift cursor-pointer"
              >
                <div className="min-w-0 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-content font-medium">{d.path}</span>
                    <span className="text-[10px] px-1.5 py-0.2 border border-hairline uppercase text-ash">
                      {d.obituary.cause.replace("_", " ")}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-ash-light mt-1 line-clamp-1">
                    {d.obituary.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className="text-ash tabular-nums">{d.lifespan_days}d alive</span>
                  <span className="text-ash-dark tabular-nums">{d.died_sha.substring(0, 7)}</span>
                  {d.hauntingCount > 0 && (
                    <span className="px-1.5 py-0.5 border border-marigold text-marigold text-[9px]">
                      HAUNTING
                    </span>
                  )}
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

      {/* Complete Necropolis Ledger */}
      <GraveyardTable
        deaths={deaths}
        onSelectDeath={handleSelectDeath}
      />

      {/* Offline Terminal & Quickstart Section */}
      <section className="border-t border-hairline pt-8 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between text-ash">
          <span>OFFLINE LOCAL EXECUTION</span>
          <span>NO EXTERNAL REQUESTS AT RUNTIME</span>
        </div>

        <div className="p-4 bg-surface/80 border border-hairline text-ash-light space-y-3">
          <p className="font-sans text-xs text-ash-light">
            Wake is built around open-weight AI running fully locally via Ollama. Deterministic git analysis extracts all ground truth; Ollama only narrates and classifies with verified citations.
          </p>

          <div className="p-3 bg-ground border border-hairline text-[11px] overflow-x-auto text-content">
            <code>
              # 1. Start Ollama local daemon<br />
              ollama serve<br /><br />
              # 2. Pull open-weight model (Gemma Terms of Use, 806 MB)<br />
              ollama pull gemma3:1b<br /><br />
              # 3. Run Wake scan on any local git repo<br />
              npm run dev
            </code>
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
