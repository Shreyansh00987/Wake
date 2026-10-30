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
      <body className="min-h-screen bg-ground text-content selection:bg-surface selection:text-content">
        <header className="border-b border-hairline py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="font-mono text-sm tracking-widest uppercase hover:text-content">
                WAKE
              </a>
              <span className="text-ash-dark text-xs select-none">/</span>
              <span className="text-ash text-xs hidden sm:inline">
                "Every deleted line had a reason."
              </span>
            </div>

            <nav className="flex items-center gap-4 text-xs font-mono">
              <a
                href="/"
                className="text-ash hover:text-content transition-colors duration-150"
              >
                Necropolis
              </a>
              <a
                href="/hauntings"
                className="text-ash hover:text-content transition-colors duration-150"
              >
                Hauntings
              </a>
              <a
                href="/scan"
                className="border border-hairline hover:border-hairline-light px-2.5 py-1 text-content hover:bg-surface transition-all duration-150"
              >
                + Scan
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
