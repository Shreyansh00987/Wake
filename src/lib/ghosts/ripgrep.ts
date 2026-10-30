import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

let cachedRgPath: string | null = null;

export function getRipgrepPath(): string {
  if (cachedRgPath) return cachedRgPath;

  // 1. Try @vscode/ripgrep bundled binary
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vscRg = require("@vscode/ripgrep");
    if (vscRg && vscRg.rgPath && fs.existsSync(vscRg.rgPath)) {
      cachedRgPath = vscRg.rgPath;
      return cachedRgPath!;
    }
  } catch {
    // Fall back to looking in node_modules
  }

  // 2. Check node_modules common paths
  const localRgWin = path.join(
    process.cwd(),
    "node_modules",
    "@vscode",
    "ripgrep-win32-x64",
    "bin",
    "rg.exe"
  );
  if (fs.existsSync(localRgWin)) {
    cachedRgPath = localRgWin;
    return cachedRgPath;
  }

  // 3. Fallback to system "rg"
  cachedRgPath = "rg";
  return cachedRgPath;
}

export interface RgMatch {
  file: string;
  line: number;
  column: number;
  snippet: string;
}

export interface RipgrepOptions {
  cwd: string;
  globs?: string[];
  maxMatches?: number;
  timeoutMs?: number;
}

export function runRipgrep(
  regexPattern: string,
  options: RipgrepOptions
): Promise<RgMatch[]> {
  return new Promise((resolve, reject) => {
    const rgBin = getRipgrepPath();
    const timeout = options.timeoutMs ?? 20000;
    const maxMatches = options.maxMatches ?? 100;

    const defaultGlobs = [
      "!node_modules/**",
      "!package-lock.json",
      "!yarn.lock",
      "!pnpm-lock.yaml",
      "!bun.lockb",
      "!.git/**",
      "!.next/**",
      "!dist/**",
      "!build/**",
      "!fixtures/**",
      "!data/**",
      "!samples/**",
      "!.agent/**",
      "!**/*.sqlite*",
      "!**/*.jsonl",
    ];

    const globs = [...defaultGlobs, ...(options.globs || [])];

    const args: string[] = [
      "--line-number",
      "--column",
      "--no-heading",
      "--color=never",
      "--max-columns=300",
      "--max-columns-preview",
    ];

    for (const g of globs) {
      args.push("-g", g);
    }

    args.push("-e", regexPattern, ".");

    const child = spawn(rgBin, args, {
      cwd: options.cwd,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
      resolve([]);
    }, timeout);

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString("utf8");
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString("utf8");
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      if (!killed) reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (killed) return;

      // rg exit code 0 = matches found, 1 = no matches found, 2 = error
      if (code !== 0 && code !== 1) {
        resolve([]);
        return;
      }

      const matches: RgMatch[] = [];
      const lines = stdout.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;
        const firstColon = line.indexOf(":");
        if (firstColon === -1) continue;
        const secondColon = line.indexOf(":", firstColon + 1);
        if (secondColon === -1) continue;
        const thirdColon = line.indexOf(":", secondColon + 1);
        if (thirdColon === -1) continue;

        // Normalize: replace backslashes and strip leading ./ or .\
        const rawFile = line.substring(0, firstColon);
        const file = rawFile.replace(/\\/g, "/").replace(/^\.\//, "");
        const lineNum = parseInt(line.substring(firstColon + 1, secondColon), 10) || 1;
        const colNum = parseInt(line.substring(secondColon + 1, thirdColon), 10) || 1;
        const snippet = line.substring(thirdColon + 1).trim();

        matches.push({
          file,
          line: lineNum,
          column: colNum,
          snippet,
        });

        if (matches.length >= maxMatches) {
          break;
        }
      }

      resolve(matches);
    });
  });
}
