import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

const START_MARKER = "<!-- params-table-start -->";
const END_MARKER = "<!-- params-table-end -->";

async function getToolSchemas() {
  const server = createServer();
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "param-table-gen", version: "1.0.0" });
  await client.connect(clientTransport);

  const { tools } = await client.listTools();

  await client.close();
  await server.close();

  return tools;
}

function generateTable(
  tools: Awaited<ReturnType<typeof getToolSchemas>>,
): string {
  const toolNames = tools.map((t) => t.name).sort();
  const paramSet = new Map<string, Set<string>>();

  for (const tool of tools) {
    const props = (tool.inputSchema as { properties?: Record<string, unknown> })
      .properties;
    if (!props) continue;
    for (const param of Object.keys(props)) {
      if (!paramSet.has(param)) paramSet.set(param, new Set());
      paramSet.get(param)?.add(tool.name);
    }
  }

  const paramNames = [...paramSet.keys()];

  const header = `| パラメータ | ${toolNames.map((n) => `\`${n}\``).join(" | ")} |`;
  const separator = `|---|${toolNames.map(() => ":---:").join("|")}|`;

  const rows = paramNames.map((param) => {
    const supported = paramSet.get(param) ?? new Set<string>();
    const cells = toolNames.map((t) => (supported.has(t) ? "o" : "-"));
    return `| \`${param}\` | ${cells.join(" | ")} |`;
  });

  return [header, separator, ...rows].join("\n");
}

async function main() {
  const tools = await getToolSchemas();
  const table = generateTable(tools);

  const writeMode = process.argv.includes("--write");

  if (!writeMode) {
    console.log(table);
    return;
  }

  const readmePath = resolve(import.meta.dirname ?? ".", "../README.md");
  const content = readFileSync(readmePath, "utf-8");

  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `Markers not found in README.md. Add ${START_MARKER} and ${END_MARKER}.`,
    );
    process.exit(1);
  }

  const before = content.slice(0, startIdx + START_MARKER.length);
  const after = content.slice(endIdx);
  const updated = `${before}\n${table}\n${after}`;

  writeFileSync(readmePath, updated);
  console.log("README.md updated.");
}

main();
