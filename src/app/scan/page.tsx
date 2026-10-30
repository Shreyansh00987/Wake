"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanProgress } from "@/types";

export default function ScanPage() {
  const router = useRouter();
  const [repoPath, setRepoPath] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pipelineStages = [
    { key: "discovering", label: "1. Discover Deletions" },
    { key: "extracting_evidence", label: "2. Extract Evidence" },
    { key: "generating_obituaries", label: "3. Grounded Obituaries" },
    { key: "detecting_hauntings", label: "4. Detect Ghosts" },
  ];

  async function triggerScan(targetPath?: string) {
    const finalPath = (targetPath !== undefined ? targetPath : repoPath).trim();
    setScanning(true);
    setError(null);
    setLogs([]);
    setProgress({
      stage: "discovering",
      message: "Initializing archaeological scan pipeline...",
      current: 0,
      total: 0,
    });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath: finalPath || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Scan failed with status ${res.status}`);
      }

      if (!res.body) {
        throw new Error("ReadableStream not supported by browser");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const ev of events) {
          if (!ev.startsWith("data: ")) continue;
          try {
            const data: ScanProgress = JSON.parse(ev.substring(6));
            setProgress(data);
            setLogs((prev) => [
              ...prev.slice(-35),
              `[${new Date().toLocaleTimeString()}] [${data.stage}] ${data.message}`,
            ]);

            if (data.stage === "complete") {
              setTimeout(() => {
                router.push("/");
              }, 1200);
            }
          } catch {
            // ignore parse error
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during scan");
      setScanning(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    triggerScan();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-mono text-xs">
      <div>
        <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] tracking-widest text-ash uppercase">
          <span>INGESTION & HISTORICAL ARCHAEOLOGY</span>
          <span>//</span>
          <span>READ-ONLY PIPELINE</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-mono font-medium text-content tracking-tight">
          Scan Repository History
        </h1>
        <p className="font-sans text-xs text-ash-light mt-1.5 leading-relaxed">
          Provide any local git repository path. Wake operates in strict read-only mode, extracting deletions, generating grounded obituaries, and locating dangling ghost references.
        </p>
      </div>

      {/* Preset Buttons for Quick Testing */}
      <div className="p-3.5 bg-ground-elevated/70 border border-hairline space-y-2">
        <span className="text-[10px] text-ash uppercase tracking-wider block font-medium">
          DEMO ARCHAEOLOGICAL TARGETS
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={scanning}
            onClick={() => {
              setRepoPath("");
              triggerScan("");
            }}
            className="px-3 py-1.5 bg-ground border border-hairline hover:border-hairline-light text-content text-[11px] font-mono transition-colors"
          >
            ✦ Wake (Self History)
          </button>
          <button
            type="button"
            disabled={scanning}
            onClick={() => {
              setRepoPath("fixtures/cors");
              triggerScan("fixtures/cors");
            }}
            className="px-3 py-1.5 bg-ground border border-hairline hover:border-hairline-light text-ash-light hover:text-content text-[11px] font-mono transition-colors"
          >
            fixtures/cors (Express middleware)
          </button>
          <button
            type="button"
            disabled={scanning}
            onClick={() => {
              setRepoPath("fixtures/chalk");
              triggerScan("fixtures/chalk");
            }}
            className="px-3 py-1.5 bg-ground border border-hairline hover:border-hairline-light text-ash-light hover:text-content text-[11px] font-mono transition-colors"
          >
            fixtures/chalk (Terminal styling)
          </button>
        </div>
      </div>

      {/* Scan Input Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoPath" className="block text-ash text-[11px] uppercase tracking-wider mb-1.5 font-medium">
            LOCAL REPOSITORY DIRECTORY PATH
          </label>
          <div className="flex gap-2">
            <input
              id="repoPath"
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              placeholder="e.g. D:/Project/Wake or fixtures/cors (leave blank for Wake self-history)"
              disabled={scanning}
              className="flex-1 bg-ground border border-hairline px-3 py-2 text-content placeholder:text-ash-dark outline-none focus:border-content transition-colors font-mono text-xs"
            />
            <button
              type="submit"
              disabled={scanning}
              className="px-5 py-2 bg-surface hover:bg-surface-hover border border-hairline-light text-content font-medium transition-colors shrink-0 disabled:opacity-50"
            >
              {scanning ? "Archaeology in Progress..." : "Begin Scan →"}
            </button>
          </div>
        </div>
      </form>

      {/* Pipeline Status Stepper */}
      {scanning && (
        <div className="border border-hairline p-4 space-y-4 bg-ground-elevated/40">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-content font-medium uppercase tracking-wider">
              PIPELINE EXECUTION PROGRESS
            </span>
            <span className="text-ash tabular-nums">
              {progress?.current || 0} / {progress?.total || "?"} items
            </span>
          </div>

          {/* Stepper Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            {pipelineStages.map((stg) => {
              const isCurrent = progress?.stage === stg.key;
              const isDone =
                progress?.stage === "complete" ||
                (stg.key === "discovering" && progress?.stage !== "discovering") ||
                (stg.key === "extracting_evidence" &&
                  ["generating_obituaries", "detecting_hauntings", "complete"].includes(
                    progress?.stage || ""
                  )) ||
                (stg.key === "generating_obituaries" &&
                  ["detecting_hauntings", "complete"].includes(progress?.stage || ""));

              return (
                <div
                  key={stg.key}
                  className={`p-2 border transition-all ${
                    isCurrent
                      ? "border-marigold bg-marigold-dim text-marigold"
                      : isDone
                      ? "border-hairline bg-surface text-content"
                      : "border-hairline/40 text-ash-dark"
                  }`}
                >
                  <div className="truncate font-medium">{stg.label}</div>
                  <div className="text-[9px] mt-0.5">
                    {isCurrent ? "Active..." : isDone ? "✓ Done" : "Queued"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Streaming Logs */}
          <div className="bg-ground border border-hairline p-3 h-48 overflow-y-auto space-y-1 font-mono text-[11px] leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="text-ash-light">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="border border-cause-security/60 bg-cause-security/10 p-4 text-cause-security space-y-1">
          <div className="font-medium text-xs">Scan Interrupted</div>
          <p className="font-sans text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
