import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { validatePath } from "../path-guard.js";
import { buildSearchFilesCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";

export function registerSearchFilesTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "search-files",
    {
      title: "Ripgrep Search Files",
      description:
        "List files that match (or do not match) a pattern using ripgrep. Returns file paths only, no line content.",
      inputSchema: {
        pattern: z.string().describe("Search pattern (regex by default)"),
        path: z.string().describe("Directory or file to search"),
        invertMatch: z
          .boolean()
          .optional()
          .describe("If true, list files that do NOT contain the pattern"),
        fixedStrings: z
          .boolean()
          .optional()
          .describe("Treat pattern as a literal string"),
        caseSensitive: z
          .boolean()
          .optional()
          .describe(
            "true = case-sensitive, false = case-insensitive, omit = smart-case",
          ),
        wordMatch: z.boolean().optional().describe("Only match whole words"),
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
        const cmd = buildSearchFilesCommand(args);
        const result = await executeRgCommand(cmd);
        const limit = args.maxCharacters ?? config.defaultMaxCharacters;
        return formatToolResult(result, "No matching files found.", limit);
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
