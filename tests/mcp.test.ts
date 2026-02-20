import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

const fixturesPath = new URL("./fixtures", import.meta.url).pathname;

function getTextContent(
  result: Awaited<ReturnType<Client["callTool"]>>,
): string {
  const content = result.content as Array<{ type: string; text: string }>;
  return content[0]?.text ?? "";
}

describe("MCP integration", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const server = createServer();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
    cleanup = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  test("tools/list returns all 6 tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "list-file-types",
      "list-files",
      "search",
      "search-and-replace",
      "search-count",
      "search-files",
    ]);
  });

  test("search finds matches in fixtures", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { pattern: "hello", path: fixturesPath },
    });
    expect(result.isError).toBeFalsy();
    expect(getTextContent(result)).toContain("hello");
  });

  test("search returns no-match message", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { pattern: "zzz_nonexistent_zzz", path: fixturesPath },
    });
    expect(result.isError).toBeFalsy();
    expect(getTextContent(result)).toContain("No matches");
  });

  test("search with fixedStrings", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: {
        pattern: "hello()",
        path: fixturesPath,
        fixedStrings: true,
      },
    });
    expect(result.isError).toBeFalsy();
    expect(getTextContent(result)).toContain("hello()");
  });

  test("search with Japanese pattern", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { pattern: "こんにちは", path: fixturesPath },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("こんにちは世界");
    expect(text).toContain("hello こんにちは");
  });

  test("search with Japanese fixed string", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: {
        pattern: "東京タワー",
        path: fixturesPath,
        fixedStrings: true,
      },
    });
    expect(result.isError).toBeFalsy();
    expect(getTextContent(result)).toContain("東京タワー");
  });

  test("search-and-replace previews replacement", async () => {
    const result = await client.callTool({
      name: "search-and-replace",
      arguments: {
        pattern: "(\\w+) world",
        replacement: "$1 universe",
        path: fixturesPath,
      },
    });
    expect(result.isError).toBeFalsy();
    expect(getTextContent(result)).toContain("universe");
  });

  test("search-count returns counts per file", async () => {
    const result = await client.callTool({
      name: "search-count",
      arguments: {
        pattern: "hello",
        path: fixturesPath,
        caseSensitive: false,
      },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    // Should contain file paths with counts
    expect(text).toMatch(/:\d+/);
  });

  test("search-count with Japanese pattern", async () => {
    const result = await client.callTool({
      name: "search-count",
      arguments: { pattern: "こんにちは", path: fixturesPath },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("japanese.txt:");
  });

  test("search-files returns file paths only", async () => {
    const result = await client.callTool({
      name: "search-files",
      arguments: { pattern: "hello", path: fixturesPath },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("sample.txt");
    expect(text).toContain("sample.ts");
    // Should not contain line numbers or content
    expect(text).not.toMatch(/:\d+:/);
  });

  test("search-files with invertMatch finds non-matching files", async () => {
    const result = await client.callTool({
      name: "search-files",
      arguments: {
        pattern: "hello",
        path: fixturesPath,
        invertMatch: true,
      },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("deep.js");
  });

  test("list-files returns fixture files", async () => {
    const result = await client.callTool({
      name: "list-files",
      arguments: { path: fixturesPath },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("sample.txt");
    expect(text).toContain("sample.ts");
    expect(text).toContain("deep.js");
  });

  test("list-files with fileType filter", async () => {
    const result = await client.callTool({
      name: "list-files",
      arguments: { path: fixturesPath, fileType: "js" },
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("deep.js");
    expect(text).not.toContain("sample.txt");
  });

  test("list-file-types returns supported types", async () => {
    const result = await client.callTool({
      name: "list-file-types",
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    const text = getTextContent(result);
    expect(text).toContain("typescript");
    expect(text).toContain("python");
  });
});
