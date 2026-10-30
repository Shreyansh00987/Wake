"use client";

import React, { useState } from "react";
import { ExorciseDiff } from "@/types";

interface ExorciseModalProps {
  diff: ExorciseDiff | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExorciseModal({ diff, isOpen, onClose }: ExorciseModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !diff) return null;

  function copyDiff() {
    if (!diff) return;
    navigator.clipboard.writeText(diff.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150">
      <div className="bg-ground border border-hairline w-full max-w-2xl p-4 sm:p-6 text-content">
        <div className="flex items-start justify-between border-b border-hairline pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-marigold block mb-1">
              EXORCISE GHOST REFERENCE
            </span>
            <h3 className="text-sm font-mono text-content">
              Target: {diff.target_file} (Line {diff.original_line})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ash hover:text-content font-mono text-xs px-2 py-1 border border-hairline hover:border-hairline-light"
          >
            ✕ Close
          </button>
        </div>

        <p className="font-sans text-xs text-ash mb-4">
          Wake is strictly read-only and never mutates repository files. Copy the unified diff below to purge this zombie reference using <code className="font-mono text-content">git apply</code>.
        </p>

        <pre className="p-3 bg-surface border border-hairline text-[11px] font-mono text-ash-light overflow-x-auto mb-4 max-h-60">
          {diff.diff}
        </pre>

        <div className="flex items-center justify-between pt-2 border-t border-hairline">
          <span className="text-[10px] font-mono text-ash-dark">
            Purges reference to "{diff.dead_reference}"
          </span>
          <button
            onClick={copyDiff}
            className="px-3 py-1.5 font-mono text-xs border border-marigold text-marigold hover:bg-marigold hover:text-ground transition-all"
          >
            {copied ? "✓ Copied to Clipboard!" : "Copy Unified Diff"}
          </button>
        </div>
      </div>
    </div>
  );
}
