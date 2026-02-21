import { describe, expect, test } from "bun:test";
import { validatePath } from "../src/path-guard.js";

describe("validatePath", () => {
  test("allows any path when allowedDirs is undefined", () => {
    expect(() => validatePath("/etc/passwd", undefined)).not.toThrow();
  });

  test("allows any path when allowedDirs is empty", () => {
    expect(() => validatePath("/etc/passwd", [])).not.toThrow();
  });

  test("allows path inside allowed directory", () => {
    expect(() =>
      validatePath("/tmp/project/src", ["/tmp/project"]),
    ).not.toThrow();
  });

  test("allows path that equals allowed directory exactly", () => {
    expect(() => validatePath("/tmp/project", ["/tmp/project"])).not.toThrow();
  });

  test("rejects path outside allowed directory", () => {
    expect(() => validatePath("/etc/passwd", ["/tmp/project"])).toThrow(
      /outside allowed directories/,
    );
  });

  test("prevents prefix confusion (/tmp/ev vs /tmp/evil)", () => {
    expect(() => validatePath("/tmp/evil", ["/tmp/ev"])).toThrow(
      /outside allowed directories/,
    );
  });

  test("resolves relative paths before checking", () => {
    const cwd = process.cwd();
    expect(() => validatePath(".", [cwd])).not.toThrow();
  });

  test("rejects path traversal attempts", () => {
    expect(() =>
      validatePath("/tmp/project/../../../etc/passwd", ["/tmp/project"]),
    ).toThrow(/outside allowed directories/);
  });

  test("allows path when any of multiple allowed dirs match", () => {
    expect(() =>
      validatePath("/home/user/code/file.ts", ["/tmp", "/home/user/code"]),
    ).not.toThrow();
  });

  test("rejects path not in any of multiple allowed dirs", () => {
    expect(() =>
      validatePath("/var/log/syslog", ["/tmp", "/home/user/code"]),
    ).toThrow(/outside allowed directories/);
  });

  test("includes resolved path and allowed dirs in error message", () => {
    try {
      validatePath("/bad/path", ["/allowed"]);
      throw new Error("should have thrown");
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain("/bad/path");
      expect(msg).toContain("/allowed");
    }
  });
});
