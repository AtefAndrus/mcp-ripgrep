import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { validatePath } from "../path-guard.js";
import { buildReplaceCommand } from "../rg/builder.js";
import { type ExecuteOptions, executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";

export function registerSearchReplaceTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "search-and-replace",
    {
      title: "Ripgrep Search and Replace Preview",
      description:
        "Read-only preview of search-and-replace results using ripgrep. Does NOT modify files. Useful for previewing replacements and testing capture groups ($1, $2, ${name}).",
      inputSchema: {
        pattern: z.string().describe("Search pattern (regex by default)"),
        replacement: z
          .string()
          .describe(
            "Replacement string (supports $1, $2, ${name} for capture groups)",
          ),
        path: z.string().describe("Directory or file to search"),
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
        multiline: z
          .boolean()
          .optional()
          .describe(
            "Enable multiline matching (for function signatures, import blocks, etc.)",
          ),
        fileType: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Filter by file type (e.g. 'ts', 'py')"),
        fileTypeNot: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Exclude file type (e.g. 'json')"),
        glob: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Glob pattern to filter files"),
        maxResults: z.number().optional().describe("Maximum matches per file"),
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
          .describe(
            "Do NOT respect .gitignore rules (search files that are normally ignored)",
          ),
        onlyMatching: z
          .boolean()
          .optional()
          .describe(
            "Show only the matched/replaced text instead of the full line (useful for extracting captured groups)",
          ),
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
        const cmd = buildReplaceCommand(args);
        const execOpts: ExecuteOptions = {
          maxOutputBytes: config.maxOutputBytes,
        };
        const result = await executeRgCommand(cmd, execOpts);
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
