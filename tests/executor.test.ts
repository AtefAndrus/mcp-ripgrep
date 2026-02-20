import { describe, expect, test } from "bun:test";
import { executeRgCommand } from "../src/rg/executor.js";
import type { RgCommand } from "../src/rg/types.js";

const fixturesPath = new URL("./fixtures", import.meta.url).pathname;

describe("executeRgCommand", () => {
  test("exit code 0 when matches found", async () => {
    const cmd: RgCommand = {
      command: "rg",
      args: [
        "-n",
        "--color",
        "never",
        "--no-heading",
        "--",
        "hello",
        fixturesPath,
      ],
    };
    const result = await executeRgCommand(cmd);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hello");
  });

  test("exit code 1 when no matches (returns normally)", async () => {
    const cmd: RgCommand = {
      command: "rg",
      args: [
        "--color",
        "never",
        "--",
        "zzz_definitely_not_found_zzz",
        fixturesPath,
      ],
    };
    const result = await executeRgCommand(cmd);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
  });

  test("exit code 2 for invalid regex rejects", async () => {
    const cmd: RgCommand = {
      command: "rg",
      args: ["--color", "never", "--", "[invalid", fixturesPath],
    };
    await expect(executeRgCommand(cmd)).rejects.toThrow();
  });

  test("non-existent command rejects", async () => {
    const cmd: RgCommand = {
      command: "rg_nonexistent_binary",
      args: ["--version"],
    };
    await expect(executeRgCommand(cmd)).rejects.toThrow("Failed to spawn");
  });

  test("handles Japanese content", async () => {
    const cmd: RgCommand = {
      command: "rg",
      args: [
        "-n",
        "--color",
        "never",
        "--no-heading",
        "--",
        "こんにちは",
        fixturesPath,
      ],
    };
    const result = await executeRgCommand(cmd);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("こんにちは");
  });

  test("handles large output", async () => {
    const cmd: RgCommand = {
      command: "rg",
      args: ["--color", "never", "--no-heading", "-e", ".", "--", fixturesPath],
    };
    const result = await executeRgCommand(cmd);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  });
});
