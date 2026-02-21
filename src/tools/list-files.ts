import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { validatePath } from "../path-guard.js";
import { buildListFilesCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";

export function registerListFilesTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "list-files",
    {
      title: "Ripgrep List Files",
      description:
        "List all files in the search scope using ripgrep. No pattern matching — just lists files that would be searched.",
      inputSchema: {
        path: z.string().describe("Directory to list files from"),
        fileType: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Filter by file type (e.g. 'ts', 'py')"),
        fileTypeNot: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Exclude file type"),
        glob: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Glob pattern to filter files"),
        includeHidden: z
          .boolean()
          .optional()
          .describe("Include hidden files and directories"),
        followSymlinks: z
          .boolean()
          .optional()
          .describe("Follow symbolic links"),
        maxDepth: z
          .number()
          .optional()
          .describe("Maximum directory traversal depth"),
        noIgnore: z
          .boolean()
          .optional()
          .describe("Ignore .gitignore and other ignore files"),
        sortBy: z
          .enum(["path", "modified", "created"])
          .optional()
          .describe("Sort results by field"),
        maxCharacters: z
          .number()
          .optional()
          .describe(
            "Maximum characters in the result. Truncated with summary if exceeded.",
          ),
      },
    },
    async (args) => {
      try {
        validatePath(args.path, config.allowedDirs);
        const cmd = buildListFilesCommand(args);
        const result = await executeRgCommand(cmd);
        const limit = args.maxCharacters ?? config.defaultMaxCharacters;
        return formatToolResult(result, "No files found.", limit);
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
