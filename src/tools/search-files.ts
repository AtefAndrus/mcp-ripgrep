import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildSearchFilesCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";

export function registerSearchFilesTool(server: McpServer): void {
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
          .string()
          .optional()
          .describe("Filter by file type (e.g. 'ts', 'py')"),
        fileTypeNot: z.string().optional().describe("Exclude file type"),
        glob: z.string().optional().describe("Glob pattern to filter files"),
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
      },
    },
    async (args) => {
      try {
        const cmd = buildSearchFilesCommand(args);
        const result = await executeRgCommand(cmd);
        return {
          content: [
            { type: "text", text: result.stdout || "No matching files found." },
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
