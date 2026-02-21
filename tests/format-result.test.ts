import { describe, expect, test } from "bun:test";
import { formatToolResult } from "../src/format-result.js";
import type { RgResult } from "../src/rg/types.js";

function makeResult(stdout: string, stderr = "", exitCode = 0): RgResult {
  return { stdout, stderr, exitCode };
}

function getText(result: ReturnType<typeof formatToolResult>): string {
  return result.content[0].text;
}

describe("formatToolResult", () => {
  test("returns stdout when present", () => {
    const result = formatToolResult(
      makeResult("file.ts:1:hello"),
      "No matches found.",
    );
    expect(getText(result)).toBe("file.ts:1:hello");
  });

  test("returns emptyMessage when stdout is empty", () => {
    const result = formatToolResult(makeResult(""), "No matches found.");
    expect(getText(result)).toBe("No matches found.");
  });

  test("appends stderr warning when stderr is present", () => {
    const result = formatToolResult(
      makeResult("output", "permission denied: /root/secret"),
      "No matches found.",
    );
    const text = getText(result);
    expect(text).toContain("output");
    expect(text).toContain("--- Warning (stderr) ---");
    expect(text).toContain("permission denied: /root/secret");
  });

  test("does not append stderr section when stderr is whitespace only", () => {
    const result = formatToolResult(
      makeResult("output", "  \n  "),
      "No matches found.",
    );
    expect(getText(result)).toBe("output");
  });

  test("truncates when maxCharacters is exceeded", () => {
    const longOutput = "line1\nline2\nline3\nline4\nline5";
    const result = formatToolResult(
      makeResult(longOutput),
      "No matches found.",
      12,
    );
    const text = getText(result);
    expect(text).toContain("line1\nline2");
    expect(text).toContain("--- Result truncated ---");
    expect(text).toContain("Showing:");
  });

  test("does not truncate when within limit", () => {
    const result = formatToolResult(
      makeResult("short"),
      "No matches found.",
      1000,
    );
    const text = getText(result);
    expect(text).toBe("short");
    expect(text).not.toContain("truncated");
  });

  test("shows both truncation and stderr", () => {
    const longOutput = "line1\nline2\nline3\nline4\nline5";
    const result = formatToolResult(
      makeResult(longOutput, "some warning"),
      "No matches found.",
      12,
    );
    const text = getText(result);
    expect(text).toContain("--- Result truncated ---");
    expect(text).toContain("--- Warning (stderr) ---");
    expect(text).toContain("some warning");
  });

  test("stderr is not affected by character limit", () => {
    const result = formatToolResult(
      makeResult("a", "this is a long warning message"),
      "No matches found.",
      1,
    );
    const text = getText(result);
    expect(text).toContain("this is a long warning message");
  });

  test("maxCharacters undefined means no truncation", () => {
    const longOutput = "a".repeat(100000);
    const result = formatToolResult(
      makeResult(longOutput),
      "No matches found.",
      undefined,
    );
    expect(getText(result)).toBe(longOutput);
  });

  test("prepends stats summary when provided", () => {
    const result = formatToolResult(
      makeResult("file.ts:1:hello"),
      "No matches found.",
      undefined,
      "5 matches, 2 files contained matches, 3 files searched",
    );
    const text = getText(result);
    expect(text).toStartWith(
      "[5 matches, 2 files contained matches, 3 files searched]",
    );
    expect(text).toContain("file.ts:1:hello");
  });

  test("does not prepend summary when statsSummary is null", () => {
    const result = formatToolResult(
      makeResult("file.ts:1:hello"),
      "No matches found.",
      undefined,
      null,
    );
    expect(getText(result)).toBe("file.ts:1:hello");
  });

  test("does not prepend summary when statsSummary is omitted", () => {
    const result = formatToolResult(
      makeResult("file.ts:1:hello"),
      "No matches found.",
    );
    expect(getText(result)).toBe("file.ts:1:hello");
  });
});
