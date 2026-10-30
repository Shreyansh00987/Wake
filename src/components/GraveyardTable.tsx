"use client";

import React from "react";
import { DeathRecord, ObituaryRecord } from "@/types";

interface GraveyardTableProps {
  deaths: Array<DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }>;
  onSelectDeath: (deathId: string) => void;
}

export function GraveyardTable({ deaths, onSelectDeath }: GraveyardTableProps) {
  if (deaths.length === 0) {
    return (
      <div className="border border-hairline p-8 text-center my-8">
        <p className="font-mono text-sm text-content mb-2">
          Nothing has died here yet.
        </p>
        <p className="font-sans text-xs text-ash max-w-md mx-auto">
          Scan a repository to resurrect the history of deleted files, grounded obituaries, and dangling ghost references.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full my-6 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-hairline text-ash text-[10px] tracking-wider uppercase">
        <span>NECROPOLIS LEDGER</span>
        <span className="tabular-nums">{deaths.length} TOTAL TOMBSTONES</span>
      </div>

      <div className="divide-y divide-hairline">
        {deaths.map((death) => {
          const isHaunted = death.hauntingCount > 0;
          return (
            <div
              key={death.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDeath(death.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDeath(death.id);
                }
              }}
              className="py-3 px-2 sm:px-3 hover:bg-surface border border-transparent hover:border-hairline hover-lift cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-ash-dark text-[11px] select-none">†</span>
                <div className="truncate">
                  <span className="text-content font-medium hover:underline">
                    {death.path}
                  </span>
                  <span className="text-ash-dark text-[10px] ml-2 block sm:inline">
                    "{death.last_words.slice(0, 50)}..."
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-ash text-[11px]">
                <span className="px-1.5 py-0.5 border border-hairline text-[10px] uppercase text-ash-light">
                  {death.obituary.cause.replace("_", " ")}
                </span>

                <span className="tabular-nums text-ash-light">
                  {death.lifespan_days}d
                </span>

                <span className="tabular-nums text-ash-dark hidden md:inline">
                  {new Date(death.died_date).toISOString().split("T")[0]}
                </span>

                {isHaunted ? (
                  <span className="px-2 py-0.5 border border-marigold text-marigold text-[10px] font-medium tracking-wider">
                    HAUNTING ({death.hauntingCount})
                  </span>
                ) : (
                  <span className="text-ash-dark text-[10px] hidden sm:inline">
                    RESTS IN PEACE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
