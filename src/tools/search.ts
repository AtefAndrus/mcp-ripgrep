import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { validatePath } from "../path-guard.js";
import { buildSearchCommand } from "../rg/builder.js";
import { type ExecuteOptions, executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";
import { extractStats } from "../stats.js";

export function registerSearchTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "search",
    {
      title: "Ripgrep Search",
      description:
        "Search file contents for a pattern using ripgrep. Supports regex, literal strings, multiline matching, OR matching via additionalPatterns, and various filtering options. For large or unfamiliar codebases, consider using search-count or search-files first to assess the scope of matches.",
      inputSchema: {
        pattern: z.string().describe("Search pattern (regex by default)"),
        path: z.string().describe("Directory or file to search"),
        fixedStrings: z
          .boolean()
          .optional()
          .describe("Treat pattern as a literal string instead of regex"),
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
          .describe("Glob pattern to filter files (e.g. '*.test.ts')"),
        maxResults: z.number().optional().describe("Maximum matches per file"),
        contextLines: z
          .number()
          .optional()
          .describe(
            "Lines of context before and after each match. When beforeContext or afterContext are also specified, they override the respective side.",
          ),
        beforeContext: z
          .number()
          .optional()
          .describe("Lines of context before each match"),
        afterContext: z
          .number()
          .optional()
          .describe("Lines of context after each match"),
        invertMatch: z
          .boolean()
          .optional()
          .describe("Show lines that do NOT match the pattern"),
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
        additionalPatterns: z
          .array(z.string())
          .optional()
          .describe(
            "Additional patterns for OR matching. When fixedStrings is true, all patterns (including these) are treated as literal strings.",
          ),
        jsonOutput: z
          .boolean()
          .optional()
          .describe("Output in JSON Lines format"),
        maxColumns: z
          .number()
          .optional()
          .describe(
            "Maximum display width per line (useful for minified files)",
          ),
        noIgnore: z
          .boolean()
          .optional()
          .describe(
            "Do NOT respect .gitignore rules (search files that are normally ignored)",
          ),
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
        const cmd = buildSearchCommand(args);
        const execOpts: ExecuteOptions = {
          maxOutputBytes: config.maxOutputBytes,
        };
        const result = await executeRgCommand(cmd, execOpts);
        const { content, summary } = extractStats(result.stdout);
        const cleanResult = { ...result, stdout: content };
        const limit = args.maxCharacters ?? config.defaultMaxCharacters;
        return formatToolResult(
          cleanResult,
          "No matches found.",
          limit,
          summary,
        );
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
