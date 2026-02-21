import { describe, expect, test } from "bun:test";
import { extractStats } from "../src/stats.js";

describe("extractStats", () => {
  test("extracts stats block from stdout tail", () => {
    const stdout = [
      "file.ts:1:hello world",
      "file.ts:3:hello again",
      "",
      "2 matches",
      "2 matched lines",
      "1 file contained matches",
      "3 files searched",
      "100 bytes printed",
      "500 bytes searched",
      "0.000122 seconds spent searching",
      "0.003333 seconds total",
    ].join("\n");

    const result = extractStats(stdout);
    expect(result.content).toBe("file.ts:1:hello world\nfile.ts:3:hello again");
    expect(result.summary).toBe(
      "2 matches, 1 file contained matches, 3 files searched",
    );
  });

  test("returns stdout as-is when no stats present", () => {
    const stdout = "file.ts:1:hello world\nfile.ts:3:hello again";
    const result = extractStats(stdout);
    expect(result.content).toBe(stdout);
    expect(result.summary).toBeNull();
  });

  test("handles 0 matches (stats only)", () => {
    const stdout = [
      "",
      "0 matches",
      "0 matched lines",
      "0 files contained matches",
      "6 files searched",
      "0 bytes printed",
      "930 bytes searched",
      "0.000050 seconds spent searching",
      "0.001000 seconds total",
    ].join("\n");

    const result = extractStats(stdout);
    expect(result.content).toBe("");
    expect(result.summary).toBe(
      "0 matches, 0 files contained matches, 6 files searched",
    );
  });

  test("does not misparse search result lines as stats", () => {
    const stdout = [
      "file.ts:10:  5 matches found in database",
      "file.ts:20:  3 files searched by user",
      "",
      "2 matches",
      "2 matched lines",
      "1 file contained matches",
      "1 file searched",
      "80 bytes printed",
      "200 bytes searched",
      "0.000010 seconds spent searching",
      "0.000500 seconds total",
    ].join("\n");

    const result = extractStats(stdout);
    expect(result.content).toBe(
      "file.ts:10:  5 matches found in database\nfile.ts:20:  3 files searched by user",
    );
    expect(result.summary).toBe(
      "2 matches, 1 file contained matches, 1 file searched",
    );
  });

  test("handles singular forms", () => {
    const stdout = [
      "file.ts:1:match",
      "",
      "1 match",
      "1 matched line",
      "1 file contained match",
      "1 file searched",
      "20 bytes printed",
      "100 bytes searched",
      "0.000001 seconds spent searching",
      "0.000100 seconds total",
    ].join("\n");

    const result = extractStats(stdout);
    expect(result.content).toBe("file.ts:1:match");
    expect(result.summary).toBe(
      "1 match, 1 file contained match, 1 file searched",
    );
  });

  test("handles empty string input", () => {
    const result = extractStats("");
    expect(result.content).toBe("");
    expect(result.summary).toBeNull();
  });
});
