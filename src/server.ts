import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListFileTypesTool } from "./tools/list-file-types.js";
import { registerListFilesTool } from "./tools/list-files.js";
import { registerSearchCountTool } from "./tools/search-count.js";
import { registerSearchFilesTool } from "./tools/search-files.js";
import { registerSearchReplaceTool } from "./tools/search-replace.js";
import { registerSearchTool } from "./tools/search.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

export interface ServerConfig {
  allowedDirs?: string[];
  defaultMaxCharacters?: number;
  maxOutputBytes?: number;
}

export function createServer(config?: ServerConfig): McpServer {
  const server = new McpServer({
    name: "mcp-ripgrep",
    version,
  });

  const cfg: ServerConfig = {
    ...config,
    defaultMaxCharacters: config?.defaultMaxCharacters ?? 50_000,
  };

  registerSearchTool(server, cfg);
  registerSearchReplaceTool(server, cfg);
  registerSearchCountTool(server, cfg);
  registerSearchFilesTool(server, cfg);
  registerListFilesTool(server, cfg);
  registerListFileTypesTool(server, cfg);

  return server;
}
