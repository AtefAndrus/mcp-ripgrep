import { spawn } from "node:child_process";
import type { RgCommand, RgResult } from "./types.js";

export async function executeRgCommand(
  rgCommand: RgCommand,
): Promise<RgResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(rgCommand.command, rgCommand.args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => {
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
      const code = exitCode ?? 1;

      if (code <= 1) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new Error(stderr || `rg exited with code ${code}`));
      }
    });
  });
}
