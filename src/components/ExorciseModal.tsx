"use client";

import React, { useState, useEffect } from "react";
import { ExorciseDiff } from "@/types";

interface ExorciseModalProps {
  diff: ExorciseDiff | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExorciseModal({ diff, isOpen, onClose }: ExorciseModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !diff) return null;

  function copyDiff() {
    if (!diff) return;
    navigator.clipboard.writeText(diff.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const diffLines = diff.diff.split("\n");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="bg-ground border border-hairline w-full max-w-2xl p-5 sm:p-7 text-content shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-marigold font-medium">
                EXORCISE GHOST REFERENCE
              </span>
            </div>
            <h3 className="text-sm font-mono text-content font-medium">
              Target: <code className="text-content font-mono">{diff.target_file}</code> (Line {diff.original_line})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ash hover:text-content font-mono text-xs px-2.5 py-1 border border-hairline hover:border-hairline-light"
          >
            ✕ Close (Esc)
          </button>
        </div>

        <p className="font-sans text-xs text-ash-light leading-relaxed">
          Wake operates in <strong>read-only mode</strong> on target repositories. Review the generated unified patch below, which safely unlinks the dangling reference to <code className="font-mono text-content">"{diff.dead_reference}"</code>.
        </p>

        {/* Unified Diff View with syntax highlights */}
        <div className="bg-surface border border-hairline overflow-x-auto max-h-72 font-mono text-[11px] leading-relaxed p-2.5">
          {diffLines.map((line, idx) => {
            const isDel = line.startsWith("-");
            const isIns = line.startsWith("+");
            const isHeader = line.startsWith("@@") || line.startsWith("---") || line.startsWith("+++");
            return (
              <div
                key={idx}
                className={`px-2 py-0.5 whitespace-pre ${
                  isDel
                    ? "diff-del font-medium"
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

        {/* How to apply tip */}
        <div className="p-3 bg-ground-elevated/60 border border-hairline text-[11px] font-mono text-ash flex items-center justify-between">
          <span>Apply in terminal: <code className="text-content">git apply patch.diff</code></span>
          <span className="text-[10px] text-ash-dark">Zero-loss unified format</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-hairline">
          <span className="text-[10px] font-mono text-ash-dark">
            Purges reference to "{diff.dead_reference}"
          </span>
          <button
            onClick={copyDiff}
            className="px-4 py-2 font-mono text-xs border border-marigold text-marigold hover:bg-marigold hover:text-ground transition-all font-medium uppercase tracking-wider"
          >
            {copied ? "✓ Copied to Clipboard!" : "Copy Unified Diff"}
          </button>
        </div>
      </div>
    </div>
  );
}
