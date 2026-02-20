import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListFileTypesTool } from "./tools/list-file-types.js";
import { registerListFilesTool } from "./tools/list-files.js";
import { registerSearchCountTool } from "./tools/search-count.js";
import { registerSearchFilesTool } from "./tools/search-files.js";
import { registerSearchReplaceTool } from "./tools/search-replace.js";
import { registerSearchTool } from "./tools/search.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-ripgrep",
    version: "1.0.0",
  });

  registerSearchTool(server);
  registerSearchReplaceTool(server);
  registerSearchCountTool(server);
  registerSearchFilesTool(server);
  registerListFilesTool(server);
  registerListFileTypesTool(server);

  return server;
}
