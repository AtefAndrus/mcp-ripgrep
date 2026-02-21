#!/usr/bin/env node
import { parseArgs } from "node:util";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const { values } = parseArgs({
  options: {
    "allow-dir": { type: "string", multiple: true },
    "max-result-chars": { type: "string" },
  },
  strict: false,
});

const allowedDirs = values["allow-dir"] as string[] | undefined;
const maxResultCharsRaw = values["max-result-chars"] as string | undefined;
const defaultMaxCharacters = maxResultCharsRaw
  ? Number(maxResultCharsRaw)
  : undefined;

const server = createServer({ allowedDirs, defaultMaxCharacters });
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("mcp-ripgrep server running");
