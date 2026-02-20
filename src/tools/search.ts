import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildSearchCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search",
    {
      title: "Ripgrep Search",
      description:
        "Search file contents for a pattern using ripgrep. Supports regex, literal strings, multiline matching, and various filtering options.",
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
          .string()
          .optional()
          .describe("Filter by file type (e.g. 'ts', 'py')"),
        fileTypeNot: z
          .string()
          .optional()
          .describe("Exclude file type (e.g. 'json')"),
        glob: z
          .string()
          .optional()
          .describe("Glob pattern to filter files (e.g. '*.test.ts')"),
        maxResults: z.number().optional().describe("Maximum matches per file"),
        contextLines: z
          .number()
          .optional()
          .describe("Lines of context before and after each match"),
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
          .describe("Additional patterns for OR matching"),
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
          .describe("Ignore .gitignore and other ignore files"),
        sortBy: z
          .enum(["path", "modified", "created"])
          .optional()
          .describe("Sort results by field"),
      },
    },
    async (args) => {
      try {
        const cmd = buildSearchCommand(args);
        const result = await executeRgCommand(cmd);
        return {
          content: [
            { type: "text", text: result.stdout || "No matches found." },
          ],
        };
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
