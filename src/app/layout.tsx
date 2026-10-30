import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wake — Archival Git Necropolis",
  description: "Every deleted line had a reason. Grounded obituaries and haunting detection for dead code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ground text-content selection:bg-surface selection:text-content flex flex-col justify-between">
        <div>
          {/* Top Archival Header */}
          <header className="border-b border-hairline py-3 px-4 sm:px-6 bg-ground-elevated/85 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <a
                  href="/"
                  className="font-mono text-sm tracking-widest font-semibold uppercase hover:text-content flex items-center gap-2 group transition-colors"
                >
                  <span className="text-ash-light group-hover:text-content text-base font-normal">†</span>
                  <span className="tracking-widest">WAKE</span>
                </a>
                <span className="text-ash-dark text-xs select-none">/</span>
                <span className="text-ash text-xs hidden sm:inline font-mono">
                  "Every deleted line had a reason."
                </span>
              </div>

              {/* Navigation tabs */}
              <nav className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
                <a
                  href="/"
                  className="px-2.5 py-1 text-ash-light hover:text-content hover:bg-surface transition-all duration-140 rounded-sm"
                >
                  Necropolis
                </a>
                <a
                  href="/hauntings"
                  className="px-2.5 py-1 text-ash-light hover:text-content hover:bg-surface transition-all duration-140 rounded-sm flex items-center gap-1.5 group"
                >
                  <span>Hauntings</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-marigold group-hover:shadow-[0_0_8px_var(--marigold)] transition-all animate-pulse" />
                </a>
                <a
                  href="/scan"
                  className="border border-hairline hover:border-hairline-light px-3 py-1 text-content hover:bg-surface transition-all duration-140 font-medium rounded-sm bg-surface/30"
                >
                  + Scan Repo
                </a>
              </nav>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {children}
          </main>
        </div>

        {/* Archival Colophon Footer */}
        <footer className="border-t border-hairline py-6 px-4 sm:px-6 mt-16 text-ash-dark font-mono text-xs bg-ground-elevated/40">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-ash font-medium">WAKE ARCHIVAL SYSTEM</span>
              <span>•</span>
              <span className="text-ash-light">100% Local Open-Weight AI (Gemma 3 1B)</span>
              <span>•</span>
              <span>$0 / Zero Telemetry</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Shreyansh00987/Wake"
                target="_blank"
                rel="noreferrer"
                className="hover:text-content transition-colors"
              >
                GitHub
              </a>
              <span>•</span>
              <a
                href="https://dev.to/challenges/hacktoberfest-week4-2026-10-26"
                target="_blank"
                rel="noreferrer"
                className="hover:text-content transition-colors"
              >
                Hacktoberfest: Ghost in the Machine
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
