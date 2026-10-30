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

  async function handleStartScan(e: React.FormEvent) {
    e.preventDefault();
    setScanning(true);
    setError(null);
    setLogs([]);
    setProgress({
      stage: "discovering",
      message: "Initializing scan pipeline...",
      current: 0,
      total: 0,
    });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath: repoPath.trim() || undefined }),
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
            setLogs((prev) => [...prev.slice(-30), `[${data.stage}] ${data.message}`]);

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-mono text-xs">
      <div>
        <span className="text-[10px] tracking-widest uppercase text-ash block mb-1">
          INGESTION & HISTORICAL ARCHAEOLOGY
        </span>
        <h1 className="text-xl font-medium text-content">
          Scan Repository History
        </h1>
        <p className="font-sans text-xs text-ash-light mt-1">
          Provide a local git directory. Wake is strictly read-only and never modifies your repository files.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleStartScan} className="border border-hairline p-4 sm:p-6 bg-surface/40 space-y-4">
        <div>
          <label htmlFor="repoPathInput" className="block text-ash text-[10px] uppercase mb-1.5">
            Local Repository Path
          </label>
          <input
            id="repoPathInput"
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            disabled={scanning}
            placeholder="Leave empty to scan Wake's own repository, or enter absolute path"
            className="w-full bg-ground border border-hairline focus:border-content text-content px-3 py-2 text-xs font-mono outline-none transition-colors"
          />
        </div>

        {/* Quick Suggestion Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-ash">
          <span>Preset suggestions:</span>
          <button
            type="button"
            onClick={() => setRepoPath("")}
            className="px-2 py-0.5 border border-hairline hover:border-hairline-light hover:text-content"
          >
            Wake (Current)
          </button>
          <button
            type="button"
            onClick={() => setRepoPath("fixtures/cors")}
            className="px-2 py-0.5 border border-hairline hover:border-hairline-light hover:text-content"
          >
            fixtures/cors (MIT)
          </button>
          <button
            type="button"
            onClick={() => setRepoPath("fixtures/is")}
            className="px-2 py-0.5 border border-hairline hover:border-hairline-light hover:text-content"
          >
            fixtures/is (MIT)
          </button>
        </div>

        {error && (
          <div className="p-3 border border-red-500/50 bg-red-950/20 text-red-200 text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={scanning}
          className={`w-full py-2.5 px-4 font-mono text-xs uppercase tracking-wider transition-all border ${
            scanning
              ? "bg-surface border-hairline text-ash cursor-not-allowed"
              : "border-content text-ground bg-content hover:bg-ground hover:text-content hover:border-content"
          }`}
        >
          {scanning ? "Scanning in progress..." : "Begin Archaeological Scan"}
        </button>
      </form>

      {/* Progress & Live Event Log */}
      {scanning && progress && (
        <div className="border border-hairline p-4 sm:p-6 bg-surface/30 space-y-4">
          <div className="flex items-center justify-between text-[10px] text-ash uppercase">
            <span>Scan Pipeline: {progress.stage.replace("_", " ")}</span>
            <span className="tabular-nums">
              {progress.total > 0 ? `${progress.current} / ${progress.total}` : "Analyzing"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-ground border border-hairline overflow-hidden">
            <div
              className="h-full bg-content transition-all duration-150"
              style={{
                width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : "30%",
              }}
            />
          </div>

          <div className="text-ash-light font-sans text-xs">
            {progress.message}
          </div>

          {/* Scrolling Event Terminal Log */}
          <div className="p-3 bg-ground border border-hairline max-h-48 overflow-y-auto space-y-1 text-[11px] text-ash">
            {logs.map((log, idx) => (
              <div key={idx} className="font-mono truncate">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
