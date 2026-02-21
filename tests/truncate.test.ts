import { describe, expect, test } from "bun:test";
import { truncateText } from "../src/truncate.js";

describe("truncateText", () => {
  test("returns full text when maxCharacters is undefined", () => {
    const result = truncateText("hello world", undefined);
    expect(result.text).toBe("hello world");
    expect(result.truncated).toBe(false);
    expect(result.originalLength).toBe(11);
  });

  test("returns full text when within limit", () => {
    const result = truncateText("hello", 10);
    expect(result.text).toBe("hello");
    expect(result.truncated).toBe(false);
    expect(result.originalLength).toBe(5);
  });

  test("returns full text when exactly at limit", () => {
    const result = truncateText("hello", 5);
    expect(result.text).toBe("hello");
    expect(result.truncated).toBe(false);
  });

  test("truncates at line boundary when exceeding limit", () => {
    const text = "line1\nline2\nline3\nline4";
    const result = truncateText(text, 14);
    // 14 chars: "line1\nline2\nli" — last newline at index 11
    expect(result.text).toBe("line1\nline2");
    expect(result.truncated).toBe(true);
    expect(result.originalLength).toBe(text.length);
  });

  test("truncates at character position when no newline found", () => {
    const text = "abcdefghij";
    const result = truncateText(text, 5);
    expect(result.text).toBe("abcde");
    expect(result.truncated).toBe(true);
  });

  test("handles empty string", () => {
    const result = truncateText("", 100);
    expect(result.text).toBe("");
    expect(result.truncated).toBe(false);
    expect(result.originalLength).toBe(0);
  });

  test("handles Japanese text correctly (character count, not byte count)", () => {
    const text = "あいうえお\nかきくけこ\nさしすせそ";
    // 5 + 1 + 5 + 1 + 5 = 17 chars total
    const result = truncateText(text, 10);
    // 10 chars: "あいうえお\nかきくけ" — last newline at index 5
    expect(result.text).toBe("あいうえお");
    expect(result.truncated).toBe(true);
    expect(result.originalLength).toBe(17);
  });

  test("maxCharacters of 0 truncates everything", () => {
    const result = truncateText("hello\nworld", 0);
    expect(result.text).toBe("");
    expect(result.truncated).toBe(true);
  });
});
