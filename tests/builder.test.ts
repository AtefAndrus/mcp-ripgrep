import { describe, expect, test } from "bun:test";
import {
  buildCountCommand,
  buildListFileTypesCommand,
  buildListFilesCommand,
  buildReplaceCommand,
  buildSearchCommand,
  buildSearchFilesCommand,
} from "../src/rg/builder.js";

describe("buildSearchCommand", () => {
  test("minimal arguments", () => {
    const cmd = buildSearchCommand({ pattern: "hello", path: "/tmp" });
    expect(cmd.command).toBe("rg");
    expect(cmd.args).toContain("-n");
    expect(cmd.args).toContain("--no-heading");
    expect(cmd.args).toContain("--");
    expect(cmd.args).toContain("hello");
    expect(cmd.args).toContain("/tmp");
    // default smart-case
    expect(cmd.args).toContain("-S");
  });

  test("fixedStrings", () => {
    const cmd = buildSearchCommand({
      pattern: "hello.*",
      path: "/tmp",
      fixedStrings: true,
    });
    expect(cmd.args).toContain("-F");
  });

  test("caseSensitive true", () => {
    const cmd = buildSearchCommand({
      pattern: "hello",
      path: "/tmp",
      caseSensitive: true,
    });
    expect(cmd.args).toContain("-s");
    expect(cmd.args).not.toContain("-i");
    expect(cmd.args).not.toContain("-S");
  });

  test("caseSensitive false", () => {
    const cmd = buildSearchCommand({
      pattern: "hello",
      path: "/tmp",
      caseSensitive: false,
    });
    expect(cmd.args).toContain("-i");
    expect(cmd.args).not.toContain("-s");
    expect(cmd.args).not.toContain("-S");
  });

  test("caseSensitive undefined uses smart-case", () => {
    const cmd = buildSearchCommand({ pattern: "hello", path: "/tmp" });
    expect(cmd.args).toContain("-S");
  });

  test("wordMatch", () => {
    const cmd = buildSearchCommand({
      pattern: "hello",
      path: "/tmp",
      wordMatch: true,
    });
    expect(cmd.args).toContain("-w");
  });

  test("multiline", () => {
    const cmd = buildSearchCommand({
      pattern: "fn.*\\{",
      path: "/tmp",
      multiline: true,
    });
    expect(cmd.args).toContain("-U");
    expect(cmd.args).toContain("--multiline-dotall");
  });

  test("fileType", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      fileType: "ts",
    });
    const tIdx = cmd.args.indexOf("-t");
    expect(tIdx).toBeGreaterThan(-1);
    expect(cmd.args[tIdx + 1]).toBe("ts");
  });

  test("fileTypeNot", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      fileTypeNot: "json",
    });
    const tIdx = cmd.args.indexOf("-T");
    expect(tIdx).toBeGreaterThan(-1);
    expect(cmd.args[tIdx + 1]).toBe("json");
  });

  test("glob", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      glob: "*.ts",
    });
    const gIdx = cmd.args.indexOf("-g");
    expect(gIdx).toBeGreaterThan(-1);
    expect(cmd.args[gIdx + 1]).toBe("*.ts");
  });

  test("maxResults", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      maxResults: 5,
    });
    const mIdx = cmd.args.indexOf("-m");
    expect(mIdx).toBeGreaterThan(-1);
    expect(cmd.args[mIdx + 1]).toBe("5");
  });

  test("contextLines", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      contextLines: 3,
    });
    const bIdx = cmd.args.indexOf("-B");
    expect(bIdx).toBeGreaterThan(-1);
    expect(cmd.args[bIdx + 1]).toBe("3");
    const aIdx = cmd.args.indexOf("-A");
    expect(aIdx).toBeGreaterThan(-1);
    expect(cmd.args[aIdx + 1]).toBe("3");
  });

  test("contextLines with beforeContext override", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      contextLines: 3,
      beforeContext: 5,
    });
    const bIdx = cmd.args.indexOf("-B");
    expect(bIdx).toBeGreaterThan(-1);
    expect(cmd.args[bIdx + 1]).toBe("5");
    const aIdx = cmd.args.indexOf("-A");
    expect(aIdx).toBeGreaterThan(-1);
    expect(cmd.args[aIdx + 1]).toBe("3");
  });

  test("contextLines with afterContext override", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      contextLines: 3,
      afterContext: 7,
    });
    const bIdx = cmd.args.indexOf("-B");
    expect(bIdx).toBeGreaterThan(-1);
    expect(cmd.args[bIdx + 1]).toBe("3");
    const aIdx = cmd.args.indexOf("-A");
    expect(aIdx).toBeGreaterThan(-1);
    expect(cmd.args[aIdx + 1]).toBe("7");
  });

  test("beforeContext", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      beforeContext: 2,
    });
    const bIdx = cmd.args.indexOf("-B");
    expect(bIdx).toBeGreaterThan(-1);
    expect(cmd.args[bIdx + 1]).toBe("2");
  });

  test("afterContext", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      afterContext: 4,
    });
    const aIdx = cmd.args.indexOf("-A");
    expect(aIdx).toBeGreaterThan(-1);
    expect(cmd.args[aIdx + 1]).toBe("4");
  });

  test("invertMatch", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      invertMatch: true,
    });
    expect(cmd.args).toContain("-v");
  });

  test("includeHidden", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      includeHidden: true,
    });
    expect(cmd.args).toContain("--hidden");
  });

  test("followSymlinks", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      followSymlinks: true,
    });
    expect(cmd.args).toContain("-L");
  });

  test("maxDepth", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      maxDepth: 2,
    });
    const dIdx = cmd.args.indexOf("-d");
    expect(dIdx).toBeGreaterThan(-1);
    expect(cmd.args[dIdx + 1]).toBe("2");
  });

  test("jsonOutput", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      jsonOutput: true,
    });
    expect(cmd.args).toContain("--json");
  });

  test("maxColumns", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      maxColumns: 200,
    });
    const mIdx = cmd.args.indexOf("-M");
    expect(mIdx).toBeGreaterThan(-1);
    expect(cmd.args[mIdx + 1]).toBe("200");
  });

  test("noIgnore", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      noIgnore: true,
    });
    expect(cmd.args).toContain("--no-ignore");
  });

  test("sortBy", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      sortBy: "modified",
    });
    expect(cmd.args).toContain("--sort=modified");
  });

  test("additionalPatterns uses -e for all patterns", () => {
    const cmd = buildSearchCommand({
      pattern: "foo",
      path: "/tmp",
      additionalPatterns: ["bar", "baz"],
    });
    const eIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-e") acc.push(i);
      return acc;
    }, []);
    expect(eIndices.length).toBe(3);
    expect(cmd.args[eIndices[0] + 1]).toBe("foo");
    expect(cmd.args[eIndices[1] + 1]).toBe("bar");
    expect(cmd.args[eIndices[2] + 1]).toBe("baz");
    // path should still follow --
    const sepIdx = cmd.args.indexOf("--");
    expect(cmd.args[sepIdx + 1]).toBe("/tmp");
  });

  test("pattern with spaces is a single array element", () => {
    const cmd = buildSearchCommand({
      pattern: "hello world",
      path: "/tmp",
    });
    const sepIdx = cmd.args.indexOf("--");
    expect(cmd.args[sepIdx + 1]).toBe("hello world");
  });

  test("pattern starting with dash is after -- separator", () => {
    const cmd = buildSearchCommand({ pattern: "-v", path: "/tmp" });
    const sepIdx = cmd.args.indexOf("--");
    expect(sepIdx).toBeGreaterThan(-1);
    expect(cmd.args[sepIdx + 1]).toBe("-v");
  });

  test("fileType with shell metacharacters is a single array element", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      fileType: "ts; rm -rf /",
    });
    const tIdx = cmd.args.indexOf("-t");
    expect(cmd.args[tIdx + 1]).toBe("ts; rm -rf /");
  });

  test("path with spaces and special characters", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp/my dir/$pecial",
    });
    const sepIdx = cmd.args.indexOf("--");
    expect(cmd.args[sepIdx + 2]).toBe("/tmp/my dir/$pecial");
  });

  test("Japanese pattern is a single array element", () => {
    const cmd = buildSearchCommand({
      pattern: "こんにちは世界",
      path: "/tmp",
    });
    const sepIdx = cmd.args.indexOf("--");
    expect(cmd.args[sepIdx + 1]).toBe("こんにちは世界");
  });

  test("path with Japanese characters", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp/日本語パス/テスト",
    });
    const sepIdx = cmd.args.indexOf("--");
    expect(cmd.args[sepIdx + 2]).toBe("/tmp/日本語パス/テスト");
  });

  test("includes --stats flag", () => {
    const cmd = buildSearchCommand({ pattern: "x", path: "/tmp" });
    expect(cmd.args).toContain("--stats");
  });

  test("fileType as array", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      fileType: ["ts", "js"],
    });
    const tIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-t") acc.push(i);
      return acc;
    }, []);
    expect(tIndices.length).toBe(2);
    expect(cmd.args[tIndices[0] + 1]).toBe("ts");
    expect(cmd.args[tIndices[1] + 1]).toBe("js");
  });

  test("fileTypeNot as array", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      fileTypeNot: ["json", "md"],
    });
    const tIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-T") acc.push(i);
      return acc;
    }, []);
    expect(tIndices.length).toBe(2);
    expect(cmd.args[tIndices[0] + 1]).toBe("json");
    expect(cmd.args[tIndices[1] + 1]).toBe("md");
  });

  test("glob as array", () => {
    const cmd = buildSearchCommand({
      pattern: "x",
      path: "/tmp",
      glob: ["*.ts", "*.js"],
    });
    const gIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-g") acc.push(i);
      return acc;
    }, []);
    expect(gIndices.length).toBe(2);
    expect(cmd.args[gIndices[0] + 1]).toBe("*.ts");
    expect(cmd.args[gIndices[1] + 1]).toBe("*.js");
  });

  test("Japanese additionalPatterns", () => {
    const cmd = buildSearchCommand({
      pattern: "東京",
      path: "/tmp",
      additionalPatterns: ["大阪", "京都"],
    });
    const eIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-e") acc.push(i);
      return acc;
    }, []);
    expect(eIndices.length).toBe(3);
    expect(cmd.args[eIndices[0] + 1]).toBe("東京");
    expect(cmd.args[eIndices[1] + 1]).toBe("大阪");
    expect(cmd.args[eIndices[2] + 1]).toBe("京都");
  });
});

describe("buildReplaceCommand", () => {
  test("minimal arguments", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
    });
    expect(cmd.command).toBe("rg");
    expect(cmd.args).toContain("-r");
    const rIdx = cmd.args.indexOf("-r");
    expect(cmd.args[rIdx + 1]).toBe("bar");
    expect(cmd.args).toContain("--");
    expect(cmd.args).toContain("foo");
  });

  test("onlyMatching", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      onlyMatching: true,
    });
    expect(cmd.args).toContain("-o");
  });

  test("replacement with capture groups", () => {
    const cmd = buildReplaceCommand({
      pattern: "(\\w+)",
      replacement: "$1_suffix",
      path: "/tmp",
    });
    const rIdx = cmd.args.indexOf("-r");
    expect(cmd.args[rIdx + 1]).toBe("$1_suffix");
  });

  test("fixed strings", () => {
    const cmd = buildReplaceCommand({
      pattern: "a.b",
      replacement: "c",
      path: "/tmp",
      fixedStrings: true,
    });
    expect(cmd.args).toContain("-F");
  });

  test("fileTypeNot", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      fileTypeNot: "json",
    });
    const tIdx = cmd.args.indexOf("-T");
    expect(tIdx).toBeGreaterThan(-1);
    expect(cmd.args[tIdx + 1]).toBe("json");
  });

  test("followSymlinks", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      followSymlinks: true,
    });
    expect(cmd.args).toContain("-L");
  });

  test("maxDepth", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      maxDepth: 5,
    });
    const dIdx = cmd.args.indexOf("-d");
    expect(dIdx).toBeGreaterThan(-1);
    expect(cmd.args[dIdx + 1]).toBe("5");
  });

  test("noIgnore", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      noIgnore: true,
    });
    expect(cmd.args).toContain("--no-ignore");
  });

  test("fileType as array", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      fileType: ["ts", "js"],
    });
    const tIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-t") acc.push(i);
      return acc;
    }, []);
    expect(tIndices.length).toBe(2);
    expect(cmd.args[tIndices[0] + 1]).toBe("ts");
    expect(cmd.args[tIndices[1] + 1]).toBe("js");
  });

  test("glob as array", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
      glob: ["*.ts", "!*.test.ts"],
    });
    const gIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-g") acc.push(i);
      return acc;
    }, []);
    expect(gIndices.length).toBe(2);
    expect(cmd.args[gIndices[0] + 1]).toBe("*.ts");
    expect(cmd.args[gIndices[1] + 1]).toBe("!*.test.ts");
  });

  test("multiline adds -U and --multiline-dotall", () => {
    const cmd = buildReplaceCommand({
      pattern: "fn.*\\{",
      replacement: "function {",
      path: "/tmp",
      multiline: true,
    });
    expect(cmd.args).toContain("-U");
    expect(cmd.args).toContain("--multiline-dotall");
  });

  test("no multiline flags when multiline is not set", () => {
    const cmd = buildReplaceCommand({
      pattern: "foo",
      replacement: "bar",
      path: "/tmp",
    });
    expect(cmd.args).not.toContain("-U");
    expect(cmd.args).not.toContain("--multiline-dotall");
  });
});

describe("buildCountCommand", () => {
  test("default count mode is lines", () => {
    const cmd = buildCountCommand({ pattern: "x", path: "/tmp" });
    expect(cmd.args).toContain("-c");
    expect(cmd.args).not.toContain("--count-matches");
  });

  test("countMode matches", () => {
    const cmd = buildCountCommand({
      pattern: "x",
      path: "/tmp",
      countMode: "matches",
    });
    expect(cmd.args).toContain("--count-matches");
    expect(cmd.args).not.toContain("-c");
  });

  test("includeZero", () => {
    const cmd = buildCountCommand({
      pattern: "x",
      path: "/tmp",
      includeZero: true,
    });
    expect(cmd.args).toContain("--include-zero");
  });

  test("does not include -n flag", () => {
    const cmd = buildCountCommand({ pattern: "x", path: "/tmp" });
    expect(cmd.args).not.toContain("-n");
  });

  test("fileType and glob as arrays", () => {
    const cmd = buildCountCommand({
      pattern: "x",
      path: "/tmp",
      fileType: ["ts", "js"],
      glob: ["*.test.*", "!*.spec.*"],
    });
    const tIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-t") acc.push(i);
      return acc;
    }, []);
    expect(tIndices.length).toBe(2);
    const gIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-g") acc.push(i);
      return acc;
    }, []);
    expect(gIndices.length).toBe(2);
  });
});

describe("buildSearchFilesCommand", () => {
  test("default uses -l (files with matches)", () => {
    const cmd = buildSearchFilesCommand({ pattern: "x", path: "/tmp" });
    expect(cmd.args).toContain("-l");
    expect(cmd.args).not.toContain("--files-without-match");
  });

  test("invertMatch uses --files-without-match", () => {
    const cmd = buildSearchFilesCommand({
      pattern: "x",
      path: "/tmp",
      invertMatch: true,
    });
    expect(cmd.args).toContain("--files-without-match");
    expect(cmd.args).not.toContain("-l");
  });

  test("sortBy", () => {
    const cmd = buildSearchFilesCommand({
      pattern: "x",
      path: "/tmp",
      sortBy: "path",
    });
    expect(cmd.args).toContain("--sort=path");
  });

  test("fileType and fileTypeNot as arrays", () => {
    const cmd = buildSearchFilesCommand({
      pattern: "x",
      path: "/tmp",
      fileType: ["ts", "js"],
      fileTypeNot: ["json"],
      glob: ["src/**"],
    });
    const tIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-t") acc.push(i);
      return acc;
    }, []);
    expect(tIndices.length).toBe(2);
    const bigTIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-T") acc.push(i);
      return acc;
    }, []);
    expect(bigTIndices.length).toBe(1);
    const gIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-g") acc.push(i);
      return acc;
    }, []);
    expect(gIndices.length).toBe(1);
  });
});

describe("buildListFilesCommand", () => {
  test("minimal arguments", () => {
    const cmd = buildListFilesCommand({ path: "/tmp" });
    expect(cmd.args).toContain("--files");
    expect(cmd.args).toContain("--color");
    expect(cmd.args).toContain("never");
    expect(cmd.args).toContain("--");
    expect(cmd.args).toContain("/tmp");
  });

  test("all options", () => {
    const cmd = buildListFilesCommand({
      path: "/tmp",
      fileType: "ts",
      fileTypeNot: "json",
      glob: "*.test.ts",
      includeHidden: true,
      followSymlinks: true,
      maxDepth: 3,
      noIgnore: true,
      sortBy: "created",
    });
    expect(cmd.args).toContain("-t");
    expect(cmd.args).toContain("-T");
    expect(cmd.args).toContain("-g");
    expect(cmd.args).toContain("--hidden");
    expect(cmd.args).toContain("-L");
    expect(cmd.args).toContain("-d");
    expect(cmd.args).toContain("--no-ignore");
    expect(cmd.args).toContain("--sort=created");
  });
  test("fileType and glob as arrays", () => {
    const cmd = buildListFilesCommand({
      path: "/tmp",
      fileType: ["ts", "js"],
      glob: ["src/**", "!node_modules/**"],
    });
    const tIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-t") acc.push(i);
      return acc;
    }, []);
    expect(tIndices.length).toBe(2);
    const gIndices = cmd.args.reduce<number[]>((acc, arg, i) => {
      if (arg === "-g") acc.push(i);
      return acc;
    }, []);
    expect(gIndices.length).toBe(2);
  });
});

describe("buildListFileTypesCommand", () => {
  test("returns correct command", () => {
    const cmd = buildListFileTypesCommand();
    expect(cmd.command).toBe("rg");
    expect(cmd.args).toContain("--type-list");
    expect(cmd.args).toContain("--color");
    expect(cmd.args).toContain("never");
  });
});
