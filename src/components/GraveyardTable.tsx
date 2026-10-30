"use client";

import React, { useState, useMemo } from "react";
import { DeathRecord, ObituaryRecord, CauseOfDeath } from "@/types";

interface GraveyardTableProps {
  deaths: Array<DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }>;
  onSelectDeath: (deathId: string) => void;
}

export function GraveyardTable({ deaths, onSelectDeath }: GraveyardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [causeFilter, setCauseFilter] = useState<string>("all");
  const [onlyHaunted, setOnlyHaunted] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "lifespan" | "deletions">("date");

  const filteredDeaths = useMemo(() => {
    return deaths
      .filter((d) => {
        if (onlyHaunted && d.hauntingCount === 0) return false;
        if (causeFilter !== "all" && d.obituary.cause !== causeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchPath = d.path.toLowerCase().includes(q);
          const matchWords = d.last_words.toLowerCase().includes(q);
          const matchAuthor = d.authors.some((a) => a.toLowerCase().includes(q));
          if (!matchPath && !matchWords && !matchAuthor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "lifespan") return b.lifespan_days - a.lifespan_days;
        if (sortBy === "deletions") return b.diff_stat.deletions - a.diff_stat.deletions;
        return new Date(b.died_date).getTime() - new Date(a.died_date).getTime();
      });
  }, [deaths, searchQuery, causeFilter, onlyHaunted, sortBy]);

  function getCauseBadgeClass(cause: CauseOfDeath) {
    switch (cause) {
      case "refactor":
        return "text-cause-refactor border-cause-refactor/40 bg-cause-refactor/5";
      case "rewrite":
        return "text-cause-rewrite border-cause-rewrite/40 bg-cause-rewrite/5";
      case "security_fix":
        return "text-cause-security border-cause-security/40 bg-cause-security/5";
      case "dependency_removal":
        return "text-cause-dependency border-cause-dependency/40 bg-cause-dependency/5";
      case "abandoned_experiment":
        return "text-cause-abandoned border-cause-abandoned/40 bg-cause-abandoned/5";
      default:
        return "text-ash border-hairline bg-surface/30";
    }
  }

  if (deaths.length === 0) {
    return (
      <div className="border border-hairline p-10 text-center my-8 bg-surface/20">
        <div className="text-ash-dark text-xl font-mono mb-2">†</div>
        <p className="font-mono text-sm text-content mb-1">
          Nothing has died here yet.
        </p>
        <p className="font-sans text-xs text-ash max-w-md mx-auto">
          Scan a repository to resurrect the history of deleted files, grounded obituaries, and dangling ghost references.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full my-8 font-mono text-xs space-y-4">
      {/* Table Controls / Filter Toolbar */}
      <div className="p-3 bg-ground-elevated/70 border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dead paths, last words, or authors..."
            className="w-full bg-ground border border-hairline px-3 py-1.5 text-xs text-content placeholder:text-ash-dark outline-none focus:border-content transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ash hover:text-content text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {/* Cause Filter */}
          <select
            value={causeFilter}
            onChange={(e) => setCauseFilter(e.target.value)}
            className="bg-ground border border-hairline px-2.5 py-1.5 text-content outline-none cursor-pointer focus:border-content"
          >
            <option value="all">All Causes</option>
            <option value="refactor">Refactor</option>
            <option value="rewrite">Rewrite</option>
            <option value="security_fix">Security Fix</option>
            <option value="dependency_removal">Dependency Removal</option>
            <option value="abandoned_experiment">Abandoned Experiment</option>
            <option value="unknown">Unknown</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-ground border border-hairline px-2.5 py-1.5 text-content outline-none cursor-pointer focus:border-content"
          >
            <option value="date">Sort: Most Recent Death</option>
            <option value="lifespan">Sort: Longest Lifespan</option>
            <option value="deletions">Sort: Lines Purged</option>
          </select>

          {/* Ghost Toggle Button */}
          <button
            type="button"
            onClick={() => setOnlyHaunted(!onlyHaunted)}
            className={`px-2.5 py-1.5 border transition-all flex items-center gap-1.5 ${
              onlyHaunted
                ? "border-marigold text-marigold bg-marigold-dim font-medium"
                : "border-hairline text-ash hover:border-hairline-light hover:text-content"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlyHaunted ? "bg-marigold animate-pulse" : "bg-ash"}`} />
            Haunting Only
          </button>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] tracking-wider text-ash uppercase border-b border-hairline">
        <span>NECROPOLIS REGISTER</span>
        <span className="tabular-nums">
          Showing {filteredDeaths.length} of {deaths.length} tombstones
        </span>
      </div>

      {/* Ledger Rows */}
      {filteredDeaths.length === 0 ? (
        <div className="p-8 border border-hairline text-center text-ash font-mono text-xs">
          No tombstones match your filter query.
        </div>
      ) : (
        <div className="divide-y divide-hairline border-y border-hairline bg-ground-elevated/20">
          {filteredDeaths.map((death) => {
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
                className={`py-3 px-3 sm:px-4 hover:bg-surface border-l-2 hover-lift cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
                  isHaunted ? "border-l-marigold" : "border-l-transparent"
                }`}
              >
                {/* Left: Tombstone Symbol, Path, Last Words */}
                <div className="min-w-0 flex items-start sm:items-center gap-3">
                  <span className={`text-[12px] select-none ${isHaunted ? "text-marigold" : "text-ash-dark"}`}>
                    †
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-content font-medium text-xs sm:text-sm group-hover:underline truncate max-w-md">
                        {death.path}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 border uppercase tracking-wider ${getCauseBadgeClass(
                          death.obituary.cause
                        )}`}
                      >
                        {death.obituary.cause.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-ash-light font-sans text-xs mt-0.5 line-clamp-1 italic">
                      "{death.last_words}"
                    </p>
                  </div>
                </div>

                {/* Right: Metadata Chips */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-[11px] font-mono justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-content tabular-nums block font-medium">
                      {death.lifespan_days}d
                    </span>
                    <span className="text-ash-dark text-[10px] block">lifespan</span>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-ash tabular-nums block">
                      -{death.diff_stat.deletions}
                    </span>
                    <span className="text-ash-dark text-[10px] block">lines</span>
                  </div>

                  <div className="text-right hidden md:block">
                    <span className="text-ash tabular-nums block">
                      {new Date(death.died_date).toISOString().split("T")[0]}
                    </span>
                    <span className="text-ash-dark text-[10px] block">
                      commit {death.died_sha.substring(0, 7)}
                    </span>
                  </div>

                  {isHaunted ? (
                    <span className="px-2.5 py-1 border border-marigold text-marigold text-[10px] font-medium tracking-wider bg-marigold-dim flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-pulse" />
                      HAUNTING ({death.hauntingCount})
                    </span>
                  ) : (
                    <span className="text-ash-dark text-[10px] px-2 py-1 hidden sm:inline select-none">
                      RESTS IN PEACE
                    </span>
                  )}

                  <span className="text-ash group-hover:text-content group-hover:translate-x-0.5 transition-transform text-xs">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
