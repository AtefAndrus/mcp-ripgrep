#!/usr/bin/env node
import { parseArgs } from "node:util";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const { values } = parseArgs({
  options: {
    "allow-dir": { type: "string", multiple: true },
    "max-result-chars": { type: "string" },
    "max-output-bytes": { type: "string" },
  },
  strict: false,
});

const allowedDirs = values["allow-dir"] as string[] | undefined;
const maxResultCharsRaw = values["max-result-chars"] as string | undefined;
const defaultMaxCharacters = maxResultCharsRaw
  ? Number(maxResultCharsRaw)
  : undefined;
const maxOutputBytesRaw = values["max-output-bytes"] as string | undefined;
const maxOutputBytes = maxOutputBytesRaw
  ? Number(maxOutputBytesRaw)
  : undefined;

const server = createServer({
  allowedDirs,
  defaultMaxCharacters,
  maxOutputBytes,
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("mcp-ripgrep server running");
