"use client";

import React, { useState, useEffect } from "react";
import { HauntingRecord, ExorciseDiff } from "@/types";
import { ExorciseModal } from "@/components/ExorciseModal";

export default function HauntingsPage() {
  const [hauntings, setHauntings] = useState<HauntingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExorcism, setActiveExorcism] = useState<ExorciseDiff | null>(null);
  const [exorcisingId, setExorcisingId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    async function loadHauntings() {
      try {
        const res = await fetch("/api/hauntings");
        if (res.ok) {
          const data = await res.json();
          setHauntings(data.hauntings || []);
        }
      } catch (err) {
        console.error("Failed to load hauntings:", err);
      } finally {
        setLoading(false);
      }
    }

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
      h.snippet.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-mono text-xs">
      <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest uppercase text-marigold block mb-1">
            GHOST IN THE MACHINE
          </span>
          <h1 className="text-xl font-medium text-content">
            Active Hauntings
          </h1>
          <p className="font-sans text-xs text-ash-light mt-1">
            Living code, docs, and configs referencing dead files and symbols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter hauntings..."
            className="bg-ground border border-hairline px-2.5 py-1 text-content text-xs font-mono outline-none focus:border-content"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-ash py-8 text-center">Searching for lingering ghosts...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-hairline p-8 text-center bg-surface/20">
          <p className="text-content font-mono mb-1">No ghosts detected.</p>
          <p className="font-sans text-xs text-ash">
            All surviving code, documentation, and configuration files are cleanly untangled from dead references.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-hairline border-y border-hairline">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="py-4 px-2 hover:bg-surface/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-content font-medium text-sm">{h.file}</span>
                  <span className="text-ash text-xs">line {h.line}</span>
                  <span className="px-1.5 py-0.2 border border-marigold text-marigold text-[9px]">
                    {(h.confidence * 100).toFixed(0)}% CONFIDENCE
                  </span>
                </div>

                <div className="text-ash-light font-sans text-xs">
                  {h.reason} (referenced dead file: <code className="font-mono text-content">{h.dead_path}</code>)
                </div>

                <pre className="p-2 bg-ground border border-hairline text-[11px] text-ash-light overflow-x-auto truncate">
                  {h.snippet}
                </pre>
              </div>

              <div className="shrink-0 flex items-center">
                <button
                  onClick={() => handleExorcise(h)}
                  disabled={exorcisingId === h.id}
                  className="px-3 py-1.5 border border-marigold text-marigold hover:bg-marigold hover:text-ground transition-all text-xs font-mono"
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
