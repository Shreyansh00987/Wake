import { spawn } from "node:child_process";

export interface GitExecOptions {
  cwd: string;
  timeoutMs?: number;
  maxBufferBytes?: number;
}

export function execGit(
  args: string[],
  options: GitExecOptions
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const timeout = options.timeoutMs ?? 30000;
    const maxBuffer = options.maxBufferBytes ?? 10 * 1024 * 1024; // 10MB default

    const child = spawn("git", args, {
      cwd: options.cwd,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let stdoutBytes = 0;
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
      reject(new Error(`Git command timed out after ${timeout}ms: git ${args.join(" ")}`));
    }, timeout);

    child.stdout.on("data", (data: Buffer) => {
      stdoutBytes += data.length;
      if (stdoutBytes > maxBuffer) {
        killed = true;
        child.kill("SIGTERM");
        clearTimeout(timer);
        reject(new Error(`Git stdout exceeded buffer limit of ${maxBuffer} bytes`));
        return;
      }
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
      if (code !== 0) {
        reject(
          new Error(
            `Git exited with code ${code}: git ${args.join(" ")}\n${stderr.trim()}`
          )
        );
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
