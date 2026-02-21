import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { validatePath } from "../path-guard.js";
import { buildCountCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";

export function registerSearchCountTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "search-count",
    {
      title: "Ripgrep Search Count",
      description:
        "Count pattern matches per file using ripgrep. Returns file paths with their match counts.",
      inputSchema: {
        pattern: z.string().describe("Search pattern (regex by default)"),
        path: z.string().describe("Directory or file to search"),
        countMode: z
          .enum(["lines", "matches"])
          .optional()
          .describe(
            "'lines' counts matching lines (default), 'matches' counts all matches including multiple per line",
          ),
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
        includeZero: z
          .boolean()
          .optional()
          .describe("Include files with zero matches in the output"),
        noIgnore: z
          .boolean()
          .optional()
          .describe("Ignore .gitignore and other ignore files"),
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
        const cmd = buildCountCommand(args);
        const result = await executeRgCommand(cmd);
        const limit = args.maxCharacters ?? config.defaultMaxCharacters;
        return formatToolResult(result, "No matches found.", limit);
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
