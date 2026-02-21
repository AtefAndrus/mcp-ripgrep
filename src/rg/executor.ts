import { spawn } from "node:child_process";
import type { RgCommand, RgResult } from "./types.js";

const DEFAULT_MAX_OUTPUT_BYTES = 20 * 1024 * 1024; // 20 MB

export interface ExecuteOptions {
  maxOutputBytes?: number;
}

export async function executeRgCommand(
  rgCommand: RgCommand,
  options?: ExecuteOptions,
): Promise<RgResult> {
  const maxBytes = options?.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;

  return new Promise((resolve, reject) => {
    const child = spawn(rgCommand.command, rgCommand.args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let truncatedByExecutor = false;

    child.stdout.on("data", (chunk: Buffer) => {
      if (truncatedByExecutor) return;
      stdoutBytes += chunk.length;
      if (stdoutBytes > maxBytes) {
        truncatedByExecutor = true;
        child.kill("SIGTERM");
        return;
      }
      stdoutChunks.push(chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to spawn rg: ${error.message}`));
    });

    child.on("close", (exitCode) => {
      const stdout = Buffer.concat(stdoutChunks).toString("utf-8");
      const stderr = Buffer.concat(stderrChunks).toString("utf-8");

      if (truncatedByExecutor) {
        resolve({ stdout, stderr, exitCode: 0, truncatedByExecutor: true });
        return;
      }

      const code = exitCode ?? 1;

      if (code <= 1) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new Error(stderr || `rg exited with code ${code}`));
      }
    });
  });
}
